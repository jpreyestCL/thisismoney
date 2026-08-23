import http from 'node:http';
import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
const PORT = Number(process.env.PORT || 8788);
const pool = new Pool({
  ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : { host: '/var/run/postgresql', database: 'thisismoney', user: 'timleaderboard' }),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
const attempts = new Map();

function quarter() {
  const now = new Date();
  return `${now.getUTCFullYear()}-Q${Math.floor(now.getUTCMonth() / 3) + 1}`;
}
function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'content-length': Buffer.byteLength(data) });
  res.end(data);
}
function cleanName(value) {
  return String(value || '').normalize('NFKC').replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 20) || 'Jugador';
}
function clientKey(req) {
  return String(req.headers['cf-connecting-ip'] || req.socket.remoteAddress || 'unknown');
}
function rateLimited(req) {
  const key = clientKey(req), now = Date.now(), recent = (attempts.get(key) || []).filter(t => now - t < 60_000);
  recent.push(now); attempts.set(key, recent);
  return recent.length > 30;
}
async function readBody(req) {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 4096) throw new Error('body_too_large'); }
  return JSON.parse(raw || '{}');
}
async function list(req, res, url) {
  const sort = ['money', 'stage', 'players'].includes(url.searchParams.get('sort')) ? url.searchParams.get('sort') : 'money';
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 50));
  const order = sort === 'stage' ? 'best_stage desc, best_money desc' : sort === 'players' ? 'updated_at desc' : 'best_money desc, best_stage desc';
  const q = quarter();
  const [rows, count] = await Promise.all([
    pool.query(`select display_name, best_money, best_stage, creative, updated_at from leaderboard_scores where quarter = $1 and creative = false order by ${order} limit $2`, [q, limit]),
    pool.query('select count(*)::int as total from leaderboard_scores where quarter = $1 and creative = false', [q]),
  ]);
  json(res, 200, { quarter: q, totalPlayers: count.rows[0].total, sort, players: rows.rows });
}
async function submit(req, res) {
  if (rateLimited(req)) return json(res, 429, { error: 'Demasiadas actualizaciones' });
  const body = await readBody(req);
  const playerId = String(body.playerId || '');
  if (!/^[a-f0-9-]{36}$/i.test(playerId)) return json(res, 400, { error: 'Jugador inválido' });
  const money = Math.min(1_000_000_000_000, Math.max(0, Math.floor(Number(body.money) || 0)));
  const stage = Math.min(10_000, Math.max(1, Math.floor(Number(body.stage) || 1)));
  const creative = body.creative === true;
  const fingerprint = crypto.createHash('sha256').update(clientKey(req)).digest('hex').slice(0, 24);
  await pool.query(
    `insert into leaderboard_scores (quarter, player_id, display_name, best_money, best_stage, creative, source_hash)
     values ($1, $2::uuid, $3, $4, $5, $6, $7)
     on conflict (quarter, player_id) do update set
       display_name = excluded.display_name,
       best_money = greatest(leaderboard_scores.best_money, excluded.best_money),
       best_stage = greatest(leaderboard_scores.best_stage, excluded.best_stage),
       creative = excluded.creative,
       source_hash = excluded.source_hash,
       updated_at = now()`,
    [quarter(), playerId, cleanName(body.name), money, stage, creative, fingerprint],
  );
  json(res, 200, { ok: true, quarter: quarter() });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400' }); return res.end(); }
    if (url.pathname === '/health' && req.method === 'GET') { await pool.query('select 1'); return json(res, 200, { ok: true }); }
    if (url.pathname !== '/leaderboard') return json(res, 404, { error: 'No encontrado' });
    if (req.method === 'GET') return await list(req, res, url);
    if (req.method === 'POST') return await submit(req, res);
    json(res, 405, { error: 'Método no permitido' });
  } catch (error) {
    console.error(error);
    json(res, error.message === 'body_too_large' ? 413 : 500, { error: 'No se pudo procesar el ranking' });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`This is Money leaderboard en 127.0.0.1:${PORT}`));
async function shutdown() { server.close(); await pool.end(); process.exit(0); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
