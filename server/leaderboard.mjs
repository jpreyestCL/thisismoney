import http from 'node:http';
import crypto from 'node:crypto';
import pg from 'pg';
import { CHAT_HISTORY, accountNameKey, cleanAccountName, cleanChatName, cleanChatText } from '../src/chat.js';

const { Pool } = pg;
const PORT = Number(process.env.PORT || 8788);
const pool = new Pool({
  ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : { host: '/var/run/postgresql', database: 'thisismoney', user: 'timleaderboard' }),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
const attempts = new Map();
const chatAttempts = new Map();
const saveAttempts = new Map();
const CHAT_KEEP_HOURS = 48;      // el muro guarda dos días de conversación
const PRESENCE_WINDOW = '75 seconds';
let chatPrunedAt = 0;

function quarter() {
  const now = new Date();
  return `${now.getUTCFullYear()}-Q${Math.floor(now.getUTCMonth() / 3) + 1}`;
}
function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'content-length': Buffer.byteLength(data) });
  res.end(data);
}
function clientKey(req) {
  return String(req.headers['cf-connecting-ip'] || req.socket.remoteAddress || 'unknown');
}
// Cuenta los intentos recientes de una IP. Limpia de paso las IP que ya no
// escriben, para que el mapa no crezca sin fin mientras el servicio vive.
function tooMany(map, key, windowMs, max) {
  const now = Date.now();
  const recent = (map.get(key) || []).filter(t => now - t < windowMs);
  recent.push(now); map.set(key, recent);
  if (map.size > 2000) for (const [k, hits] of map) if (!hits.some(t => now - t < windowMs)) map.delete(k);
  return recent.length > max;
}
function rateLimited(req) {
  return tooMany(attempts, clientKey(req), 60_000, 30);
}
function chatRateLimited(req) {
  return tooMany(chatAttempts, clientKey(req), 60_000, 12);
}
function saveRateLimited(req) {
  return tooMany(saveAttempts, clientKey(req), 60_000, 20);
}
async function readBody(req, maxBytes = 4096) {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > maxBytes) throw new Error('body_too_large'); }
  return JSON.parse(raw || '{}');
}
async function list(req, res, url) {
  const sort = ['money', 'stage', 'players'].includes(url.searchParams.get('sort')) ? url.searchParams.get('sort') : 'money';
  const limit = Math.min(250, Math.max(1, Number(url.searchParams.get('limit')) || 100));
  const order = sort === 'stage' ? 'best_stage desc, best_money desc' : sort === 'players' ? 'updated_at desc' : 'best_money desc, best_stage desc';
  const q = quarter();
  const [rows, count] = await Promise.all([
    pool.query(`select display_name, best_money, best_stage, creative, updated_at from leaderboard_scores where quarter = $1 and creative = false order by ${order} limit $2`, [q, limit]),
    pool.query('select count(*)::int as total from leaderboard_scores where quarter = $1 and creative = false', [q]),
  ]);
  json(res, 200, { quarter: q, totalPlayers: count.rows[0].total, sort, players: rows.rows });
}
async function submit(req, res) {
  // El ranking muestra la partida AHORA: si gastas o pierdes plata, baja tu puesto.
  if (rateLimited(req)) return json(res, 429, { error: 'Demasiadas actualizaciones' });
  const body = await readBody(req);
  const playerId = validPlayerId(body.playerId);
  if (!playerId) return json(res, 400, { error: 'Jugador inválido' });
  const money = Math.min(1_000_000_000_000, Math.max(0, Math.floor(Number(body.money) || 0)));
  const stage = Math.min(10_000, Math.max(1, Math.floor(Number(body.stage) || 1)));
  const creative = body.creative === true;
  const fingerprint = crypto.createHash('sha256').update(clientKey(req)).digest('hex').slice(0, 24);
  await pool.query(
    `insert into leaderboard_scores (quarter, player_id, display_name, best_money, best_stage, creative, source_hash)
     values ($1, $2::uuid, $3, $4, $5, $6, $7)
     on conflict (quarter, player_id) do update set
       display_name = excluded.display_name,
       best_money = excluded.best_money,
       best_stage = excluded.best_stage,
       creative = excluded.creative,
       source_hash = excluded.source_hash,
       updated_at = now()`,
    [quarter(), playerId, cleanChatName(body.name), money, stage, creative, fingerprint],
  );
  json(res, 200, { ok: true, quarter: quarter() });
}

// ---- CHAT MUNDIAL -------------------------------------------------
// Una sola sala para todo el juego. El cliente pregunta "¿qué se dijo
// después del mensaje N?" cada pocos segundos; así no hace falta websocket
// y el muro funciona igual detrás de cualquier proxy.
function validPlayerId(value) {
  const id = String(value || '');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null;
}
async function touchPresence(id, name) {
  await pool.query(
    `insert into chat_presence (player_id, display_name) values ($1::uuid, $2)
     on conflict (player_id) do update set display_name = excluded.display_name, seen_at = now()`,
    [id, cleanChatName(name)],
  );
}
// Borra lo viejo de vez en cuando para que el muro no crezca para siempre.
async function chatPrune() {
  const now = Date.now();
  if (now - chatPrunedAt < 600_000) return;
  chatPrunedAt = now;
  await pool.query(`delete from chat_messages where created_at < now() - interval '${CHAT_KEEP_HOURS} hours'`);
  await pool.query("delete from chat_presence where seen_at < now() - interval '1 hour'");
}
function chatRow(row) {
  return { id: Number(row.id), name: row.display_name, text: row.body, ts: row.created_at };
}
// GET /chat            -> los últimos mensajes (el muro del inicio)
// GET /chat?since=N    -> solo lo dicho después de N (los globos del juego)
// GET /chat?since=-1   -> nada, solo el estado (para empezar a escuchar)
async function chatList(req, res, url) {
  const me = validPlayerId(url.searchParams.get('me'));
  if (me) await touchPresence(me, url.searchParams.get('name'));
  const sinceRaw = url.searchParams.get('since');
  const since = sinceRaw === null ? null : Math.max(-1, Math.floor(Number(sinceRaw) || 0));
  let messages = [];
  if (since === null) {
    const recent = await pool.query('select id, display_name, body, created_at from chat_messages order by id desc limit $1', [CHAT_HISTORY]);
    messages = recent.rows.reverse();
  } else if (since >= 0) {
    const nuevos = await pool.query('select id, display_name, body, created_at from chat_messages where id > $1 order by id asc limit $2', [since, CHAT_HISTORY]);
    messages = nuevos.rows;
  }
  const [last, online] = await Promise.all([
    pool.query('select coalesce(max(id), 0)::bigint as last from chat_messages'),
    pool.query(`select count(*)::int as online from chat_presence where seen_at > now() - interval '${PRESENCE_WINDOW}'`),
  ]);
  json(res, 200, { lastId: Number(last.rows[0].last), online: online.rows[0].online, messages: messages.map(chatRow) });
}
async function chatSend(req, res) {
  if (chatRateLimited(req)) return json(res, 429, { error: 'Espera un poco antes de escribir de nuevo' });
  const body = await readBody(req);
  const id = validPlayerId(body.playerId);
  if (!id) return json(res, 400, { error: 'Jugador inválido' });
  const text = cleanChatText(body.text);
  if (!text) return json(res, 400, { error: 'Escribe algo para mandar' });
  const name = cleanChatName(body.name);
  const fingerprint = crypto.createHash('sha256').update(clientKey(req)).digest('hex').slice(0, 24);
  const saved = await pool.query(
    'insert into chat_messages (player_id, display_name, body, source_hash) values ($1::uuid, $2, $3, $4) returning id, display_name, body, created_at',
    [id, name, text, fingerprint],
  );
  json(res, 200, { ok: true, message: chatRow(saved.rows[0]) });
  // El mensaje ya quedó guardado: si la presencia o la limpieza fallaran, el
  // jugador no debe ver un error (lo reenviaría y saldría dos veces en el muro).
  touchPresence(id, name).catch(e => console.error('presencia', e));
  chatPrune().catch(e => console.error('limpieza del chat', e));
}

const SAVE_MAX_BYTES = 1_500_000;
const RESERVED_USERNAMES = new Set(['jugador', 'player', 'admin', 'administrador']);
function hashPassword(password, salt = crypto.randomBytes(16)) {
  const hash = crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return { salt: salt.toString('hex'), hash: hash.toString('hex') };
}
function verifyPassword(password, saltHex, hashHex) {
  try {
    const salt = Buffer.from(String(saltHex || ''), 'hex');
    const expected = Buffer.from(String(hashHex || ''), 'hex');
    const hash = crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    return expected.length === hash.length && crypto.timingSafeEqual(hash, expected);
  } catch (e) { return false; }
}
function validSavePassword(value) {
  const password = String(value || '');
  return password.length >= 4 && password.length <= 64 && password === password.trim();
}
function validCloudName(raw) {
  const display = cleanAccountName(raw);
  const key = accountNameKey(display);
  if (display.length < 2 || key.length < 2) return null;
  if (RESERVED_USERNAMES.has(key)) return null;
  return { display, key };
}
function validSavePayload(save) {
  if (!save || typeof save !== 'object' || Array.isArray(save)) return null;
  const raw = JSON.stringify(save);
  if (raw.length > SAVE_MAX_BYTES) return null;
  return JSON.parse(raw);
}

async function saveAvailable(req, res, url) {
  const parsed = validCloudName(url.searchParams.get('name'));
  if (!parsed) return json(res, 200, { taken: false, available: false, error: 'Elige un nombre propio de 2 a 20 letras' });
  const row = await pool.query('select display_name from cloud_saves where username_key = $1', [parsed.key]);
  if (!row.rowCount) return json(res, 200, { taken: false, available: true });
  return json(res, 200, { taken: true, available: false });
}
async function savePut(req, res, body) {
  const parsed = validCloudName(body.name);
  if (!parsed) return json(res, 400, { error: 'Elige un nombre propio de 2 a 20 letras (no uses Jugador)' });
  if (!validSavePassword(body.password)) return json(res, 400, { error: 'La clave debe tener entre 4 y 64 caracteres' });
  const save = validSavePayload(body.save);
  if (!save) return json(res, 400, { error: 'La partida no se pudo guardar (está vacía o es muy grande)' });
  const existing = await pool.query('select password_salt, password_hash from cloud_saves where username_key = $1', [parsed.key]);
  if (!existing.rowCount) {
    const { salt, hash } = hashPassword(body.password);
    await pool.query(
      'insert into cloud_saves (username_key, display_name, password_salt, password_hash, save) values ($1, $2, $3, $4, $5::jsonb)',
      [parsed.key, parsed.display, salt, hash, JSON.stringify(save)],
    );
    return json(res, 200, { ok: true, created: true, name: parsed.display });
  }
  const row = existing.rows[0];
  if (!verifyPassword(body.password, row.password_salt, row.password_hash)) {
    return json(res, 409, { error: 'Ese nombre ya está ocupado. Elige otro o entra con la clave.' });
  }
  await pool.query(
    'update cloud_saves set display_name = $2, save = $3::jsonb, updated_at = now() where username_key = $1',
    [parsed.key, parsed.display, JSON.stringify(save)],
  );
  return json(res, 200, { ok: true, created: false, name: parsed.display });
}
async function saveLoad(req, res, body) {
  const parsed = validCloudName(body.name);
  if (!parsed) return json(res, 400, { error: 'Escribe el nombre de usuario' });
  if (!validSavePassword(body.password)) return json(res, 400, { error: 'Escribe la clave' });
  const existing = await pool.query('select display_name, password_salt, password_hash, save from cloud_saves where username_key = $1', [parsed.key]);
  if (!existing.rowCount) return json(res, 404, { error: 'No hay una partida con ese nombre' });
  const row = existing.rows[0];
  if (!verifyPassword(body.password, row.password_salt, row.password_hash)) {
    return json(res, 401, { error: 'La clave no coincide' });
  }
  return json(res, 200, { ok: true, name: row.display_name, save: row.save });
}
async function handleSaves(req, res, url) {
  if (req.method === 'GET') return await saveAvailable(req, res, url);
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });
  if (saveRateLimited(req)) return json(res, 429, { error: 'Demasiados intentos. Espera un momento.' });
  const body = await readBody(req, SAVE_MAX_BYTES + 2048);
  const action = body.action === 'load' ? 'load' : 'save';
  if (action === 'load') return await saveLoad(req, res, body);
  return await savePut(req, res, body);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400' }); return res.end(); }
    if (url.pathname === '/health' && req.method === 'GET') { await pool.query('select 1'); return json(res, 200, { ok: true }); }
    if (url.pathname === '/chat') {
      if (req.method === 'GET') return await chatList(req, res, url);
      if (req.method === 'POST') return await chatSend(req, res);
      return json(res, 405, { error: 'Método no permitido' });
    }
    if (url.pathname === '/saves') return await handleSaves(req, res, url);
    if (url.pathname !== '/leaderboard') return json(res, 404, { error: 'No encontrado' });
    if (req.method === 'GET') return await list(req, res, url);
    if (req.method === 'POST') return await submit(req, res);
    json(res, 405, { error: 'Método no permitido' });
  } catch (error) {
    console.error(error);
    json(res, error.message === 'body_too_large' ? 413 : 500, { error: 'No se pudo procesar la petición' });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`This is Money: ranking y chat mundial en 127.0.0.1:${PORT}`));
async function shutdown() { server.close(); await pool.end(); process.exit(0); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
