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

const BOTONES = [
  'startBtn', 'creativeBtn', 'continueBtn', 'cloudLoginBtn', 'startSkin',
  'modoLadronBtn', 'startGuideBtn', 'startRankingBtn', 'friendsBtn', 'startChatBtn', 'startAccount',
];

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

test('se puede volver al modo computador desde reloj y táctil, también con la preferencia guardada', { timeout: 280000 }, async () => {
  const server = await servir();
  const puerto = server.address().port;
  const debug = 9400 + Math.floor(Math.random() * 500);
  const chrome = spawn('google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    `--remote-debugging-port=${debug}`,
    `--user-data-dir=/tmp/tim-computador-${debug}`,
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
            const el = document.getElementById('desktopStartBtn');
            return { url: location.href, ok: !!(el && typeof el.onclick === 'function'), title: document.title };
          })()`);
          ultimo = JSON.stringify(listo);
          if (listo && listo.ok) return;
        } catch (e) { ultimo = String(e.message || e); }
        await new Promise(r => setTimeout(r, 150));
      }
      throw new Error('el juego no enganchó los botones del inicio: ' + ultimo);
    }
    
    const consola = [];
    b.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.method === 'Runtime.exceptionThrown') consola.push(JSON.stringify(m.params.exceptionDetails.exception || m.params.exceptionDetails.text));
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consola.push(m.params.args.map(a => a.value || a.description).join(' '));
    });
    const estado = () => evaluar(`({ touch: document.body.classList.contains('touch'), watch: document.body.classList.contains('watch'),
      lt: localStorage.getItem('tim_touch'), lw: localStorage.getItem('tim_watch') })`);
    async function clicEn(id) {
      const p = await evaluar(`(() => {
        const el = document.getElementById(${JSON.stringify(id)});
        el.scrollIntoView({ block: 'center', inline: 'center' });
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const n = document.elementFromPoint(x, y);
        return { x, y, visible: getComputedStyle(el).display !== 'none', tapa: !(n && (n === el || el.contains(n))) ? (n && (n.id || n.tagName)) : null };
      })()`);
      assert.ok(p.visible, id + ' no se ve');
      assert.equal(p.tapa, null, id + ' tapado por ' + p.tapa);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1 }, sessionId);
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', clickCount: 1 }, sessionId);
      await new Promise(r => setTimeout(r, 150));
    }
    async function conPreferencia(touch, watch) {
      await send('Page.navigate', { url: `http://127.0.0.1:${puerto}/index.html` }, sessionId);
      await new Promise(r => setTimeout(r, 300));
      await evaluar(`localStorage.setItem('tim_touch', '${touch}'); localStorage.setItem('tim_watch', '${watch}')`);
    }

    for (const [nombre, ancho, alto, mobile] of [['celular', 740, 360, true], ['reloj', 240, 240, true], ['PC', 1280, 800, false]]) {
      for (const [touch, watch] of [['1', '1'], ['1', '0']]) {
        await abrir(ancho, alto, mobile);
        await conPreferencia(touch, watch);
        await abrir(ancho, alto, mobile);
        const antes = await estado();
        assert.equal(antes.touch, true, nombre + ': la preferencia guardada debe activar táctil');
        assert.equal(antes.watch, watch === '1');
        // inicio
        await clicEn('desktopStartBtn');
        let d = await estado();
        assert.deepEqual(d, { touch: false, watch: false, lt: '0', lw: '0' }, nombre + ' inicio');
        // preferencia sobrevive al recargar
        await abrir(ancho, alto, mobile);
        d = await estado();
        assert.deepEqual([d.touch, d.watch], [false, false], nombre + ' tras recargar');
        // pausa
        await evaluar(`localStorage.setItem('tim_touch', '${touch}'); localStorage.setItem('tim_watch', '${watch}')`);
        await abrir(ancho, alto, mobile);
        await evaluar(`document.getElementById('start').classList.add('hidden'); document.getElementById('hud').style.display = 'block'; document.getElementById('pause').style.display = 'flex'`);
        await clicEn('pauseDesktop');
        d = await estado();
        assert.deepEqual([d.touch, d.watch, d.lt, d.lw], [false, false, '0', '0'], nombre + ' pausa');
        assert.equal(await evaluar(`getComputedStyle(document.getElementById('pauseDesktop')).display`), 'none');
      }
    }

    // El interruptor táctil de la ayuda también apaga el reloj.
    await abrir(740, 360, true);
    await evaluar(`document.getElementById('pauseWatch').click()`);
    assert.equal((await estado()).watch, true);
    await evaluar(`document.getElementById('touchToggle').click()`);
    assert.deepEqual([(await estado()).touch, (await estado()).watch], [false, false]);

    assert.deepEqual(consola, [], 'errores de consola: ' + consola.join(' | '));
    await send('Target.closeTarget', { targetId });
    b.close();
  } finally {
    chrome.kill();
    await new Promise(r => server.close(r));
  }
});
