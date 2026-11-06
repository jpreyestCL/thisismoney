// La pantalla de inicio tiene que recibir el clic en todos sus botones.
// El canvas y el fundido (#fade, z-index 20) no pueden quedarse con el toque.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

const BOTONES = [
  'startBtn', 'creativeBtn', 'continueBtn', 'cloudLoginBtn', 'startSkin',
  'modoLadronBtn', 'startGuideBtn', 'startRankingBtn', 'friendsBtn', 'startChatBtn', 'startAccount',
];

test('el inicio queda encima de la capa que se comía los clics', () => {
  assert.match(html, /#game\s*\{[^}]*z-index:\s*0/);
  assert.match(html, /#start\s*\{[^}]*z-index:\s*23/);
  assert.match(html, /#start\s*\{[^}]*pointer-events:\s*auto/);
  assert.match(html, /#start::before\s*\{[^}]*z-index:\s*0[^}]*pointer-events:\s*none/);
  assert.match(html, /\.start-shell\s*\{[^}]*z-index:\s*1/);
  assert.match(html, /#start \.btn,\s*#startAccount,\s*#chatTeaser\s*\{[^}]*pointer-events:\s*auto/);
  assert.match(html, /body:has\(#start:not\(\.hidden\)\) #lookLayer/);
  assert.match(html, /id="netbox"[^>]*z-index:\s*32/);
  assert.match(html, /body:has\(#start:not\(\.hidden\)\) #help\s*\{[^}]*z-index:\s*28/);
  assert.match(sw, /const VERSION = 'tim-v128'/);
  for (const id of BOTONES) assert.match(html, new RegExp('id="' + id + '"'));
});

function tipo(ruta) {
  const ext = extname(ruta);
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js' || ext === '.mjs') return 'text/javascript; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.css') return 'text/css';
  return 'application/octet-stream';
}

function servir() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
      const file = join(root, rel === '/' ? 'index.html' : rel);
      if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
      const buf = await readFile(file);
      res.writeHead(200, { 'content-type': tipo(file), 'cache-control': 'no-store' });
      res.end(buf);
    } catch {
      res.writeHead(404); res.end();
    }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function esperar(url, listo) {
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    try {
      const r = await fetch(url);
      if (r.ok && (!listo || listo(await r.json()))) return await r.json();
    } catch { /* chrome todavía arranca */ }
    await new Promise(r => setTimeout(r, 80));
  }
  throw new Error('no arrancó ' + url);
}

test('los botones del inicio reciben el clic en celular y en PC', { timeout: 60000 }, async () => {
  const server = await servir();
  const puerto = server.address().port;
  const debug = 9400 + Math.floor(Math.random() * 500);
  const chrome = spawn('google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    `--remote-debugging-port=${debug}`,
    `--user-data-dir=/tmp/tim-inicio-${debug}`,
    'about:blank',
  ], { stdio: 'ignore' });
  try {
    const version = await esperar(`http://127.0.0.1:${debug}/json/version`);
    const b = new WebSocket(version.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    const send = (method, params = {}, sessionId) => {
      const msgId = ++id;
      return new Promise((resolve, reject) => {
        pending.set(msgId, { resolve, reject });
        const payload = { id: msgId, method, params };
        if (sessionId) payload.sessionId = sessionId;
        b.send(JSON.stringify(payload));
      });
    };
    b.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
    await new Promise(r => b.addEventListener('open', r));
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sessionId);
    await send('Runtime.enable', {}, sessionId);

    async function evaluar(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
      if (res.exceptionDetails) throw new Error(res.exceptionDetails.text + ' ' + (res.exceptionDetails.exception && res.exceptionDetails.exception.description));
      return res.result.value;
    }
    async function abrir(ancho, alto, mobile) {
      await send('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile }, sessionId);
      if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, sessionId);
      await send('Page.navigate', { url: `http://127.0.0.1:${puerto}/index.html` }, sessionId);
      const t0 = Date.now();
      let ultimo = '';
      while (Date.now() - t0 < 20000) {
        try {
          const listo = await evaluar(`(() => {
            const el = document.getElementById('startSkin');
            return { url: location.href, ok: !!(el && typeof el.onclick === 'function'), title: document.title };
          })()`);
          ultimo = JSON.stringify(listo);
          if (listo && listo.ok) return;
        } catch (e) { ultimo = String(e.message || e); }
        await new Promise(r => setTimeout(r, 150));
      }
      throw new Error('el juego no enganchó los botones del inicio: ' + ultimo);
    }
    async function tocar(id) {
      const punto = await evaluar(`(() => {
        const el = document.getElementById(${JSON.stringify(id)});
        el.scrollIntoView({ block: 'center', inline: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
      })()`);
      assert.ok(punto.w > 2 && punto.h > 2, id + ' no tiene tamaño');
      const hit = await evaluar(`(() => {
        const el = document.getElementById(${JSON.stringify(id)});
        const n = document.elementFromPoint(${punto.x}, ${punto.y});
        return !!(n && (n === el || el.contains(n)));
      })()`);
      assert.equal(hit, true, id + ' no recibe el punto ' + punto.x + ',' + punto.y);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: punto.x, y: punto.y, button: 'left', clickCount: 1 }, sessionId);
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: punto.x, y: punto.y, button: 'left', clickCount: 1 }, sessionId);
      await new Promise(r => setTimeout(r, 40));
    }
    async function cerrar() {
      await evaluar(`['skinbox','cloudLoginBox','namebox','accountbox','help','netbox','rankingBox','chatbox','profilebox'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });`);
    }

    await abrir(390, 844, true);
    // Aunque el fundido se ponga a capturar toques y el HUD de mirar esté visible,
    // el inicio sigue encima y el clic llega al botón.
    const bajoAtaque = await evaluar(`(() => {
      const fade = document.getElementById('fade');
      fade.style.pointerEvents = 'auto';
      fade.style.opacity = '0.2';
      document.body.classList.add('touch');
      document.getElementById('hud').style.display = 'block';
      const mal = [];
      for (const id of ${JSON.stringify(BOTONES)}) {
        const el = document.getElementById(id);
        if (getComputedStyle(el).display === 'none') continue;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        const n = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!(n && (n === el || el.contains(n)))) mal.push(id + '→' + (n && (n.id || n.tagName)));
      }
      fade.style.pointerEvents = 'none';
      fade.style.opacity = '0';
      document.getElementById('hud').style.display = 'none';
      return mal;
    })()`);
    assert.deepEqual(bajoAtaque, [], 'una capa se comió el toque: ' + bajoAtaque.join(', '));

    await tocar('startSkin');
    assert.equal(await evaluar(`document.getElementById('skinbox').style.display`), 'flex');
    await cerrar();
    await tocar('cloudLoginBtn');
    assert.equal(await evaluar(`document.getElementById('cloudLoginBox').style.display`), 'flex');
    await cerrar();
    await tocar('startBtn');
    assert.equal(await evaluar(`document.getElementById('namebox').style.display`), 'flex');
    await cerrar();
    await tocar('creativeBtn');
    assert.equal(await evaluar(`document.getElementById('namebox').style.display`), 'flex');
    await cerrar();
    await tocar('startAccount');
    assert.equal(await evaluar(`document.getElementById('accountbox').style.display`), 'flex');
    await cerrar();
    await tocar('startGuideBtn');
    assert.equal(await evaluar(`document.getElementById('help').style.display`), 'flex');
    await cerrar();
    await tocar('friendsBtn');
    assert.equal(await evaluar(`document.getElementById('netbox').style.display`), 'flex');
    await cerrar();
    await tocar('startRankingBtn');
    assert.equal(await evaluar(`document.getElementById('rankingBox').style.display`), 'flex');
    await cerrar();
    await tocar('startChatBtn');
    assert.equal(await evaluar(`document.getElementById('chatbox').style.display`), 'flex');
    await cerrar();
    await tocar('modoLadronBtn');
    assert.equal(await evaluar(`document.getElementById('modoLadronBtn').getAttribute('aria-pressed')`), 'true');
    await evaluar(`localStorage.setItem('tim_profiles', JSON.stringify(['Ana','Luis']));
      localStorage.setItem('tim_save_Ana', JSON.stringify({stage:2,money:10}));
      localStorage.setItem('tim_save_Luis', JSON.stringify({stage:3,money:20}));
      document.getElementById('continueBtn').style.display = '';`);
    await tocar('continueBtn');
    assert.equal(await evaluar(`document.getElementById('profilebox').style.display`), 'flex');
    await cerrar();

    await abrir(1280, 800, false);
    const pc = await evaluar(`(() => {
      const mal = [];
      for (const id of ${JSON.stringify(BOTONES)}) {
        const el = document.getElementById(id);
        if (getComputedStyle(el).display === 'none') continue;
        const r = el.getBoundingClientRect();
        const n = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!(n && (n === el || el.contains(n)))) mal.push(id);
      }
      return mal;
    })()`);
    assert.deepEqual(pc, []);
    await tocar('startSkin');
    assert.equal(await evaluar(`document.getElementById('skinbox').style.display`), 'flex');
    await send('Target.closeTarget', { targetId });
    b.close();
  } finally {
    chrome.kill();
    await new Promise(r => server.close(r));
  }
});
