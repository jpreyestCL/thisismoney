// Ritmo de hambre: la mitad quieto y al correr; la heladera, la mitad de ese ritmo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

function numero(nombre) {
  const m = html.match(new RegExp(`const ${nombre} = ([0-9.]+);`));
  assert.ok(m, nombre);
  return Number(m[1]);
}

const quieto = numero('HAMBRE_QUIETO');
const heladera = numero('HAMBRE_HELADERA');
const correr = numero('HAMBRE_CORRER');

test('quieto y corriendo gastan la mitad, y la heladera un cuarto del ritmo viejo', () => {
  assert.equal(quieto, 0.119);       // antes 0.238/s
  assert.equal(quieto * 2, 0.238);
  assert.equal(correr, 0.4);         // extra al correr; antes 0.8/s
  assert.equal(correr * 2, 0.8);
  assert.equal(heladera, 0.0595);    // antes 0.119/s
  assert.equal(heladera * 2, quieto);
  assert.equal(heladera * 4, 0.238);
});

test('el juego usa esas constantes y el creativo no muere de hambre', () => {
  assert.match(html, /const drain = placed\.some\(o => o\.key === 'heladera'\) \? HAMBRE_HELADERA : HAMBRE_QUIETO;/);
  assert.match(html, /state\.hunger - drain \* dt/);
  assert.match(html, /state\.hunger - HAMBRE_CORRER \* dt/);
  assert.match(html, /if \(state\.creative\) \{ state\.hp = 100; state\.dadHp = 100; if \(state\.hunger < 20\) state\.hunger = 20; \}/);
  assert.doesNotMatch(html, /hunger - 0\.238|hunger - 0\.8 \* dt/);
});

test('un segundo quieto, corriendo y con heladera', () => {
  const baja = (conHeladera, corriendo) => (conHeladera ? heladera : quieto) + (corriendo ? correr : 0);
  assert.equal(baja(false, false), 0.119);
  assert.equal(baja(false, true), 0.519);
  assert.equal(baja(true, false), 0.0595);
  assert.equal(baja(true, true), 0.4595);
});

test('el service worker sube al tocar el juego', () => {
  assert.match(sw, /const VERSION = 'tim-v102'/);
});
