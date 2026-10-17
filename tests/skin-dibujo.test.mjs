// La skin dibujada se pega en la cabeza, el torso y las cuatro extremidades,
// y esas extremidades siguen siendo pivotes que swingLimbs mueve al caminar.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import {
  COLOR_BASE, LIENZO_H, LIENZO_W, PARTES, REGIONES,
  aplicarSkin, esDistinta, lienzoNuevo, parteEn, pintar, recorte, restaurar, serializar,
} from '../src/skin-dibujo.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

function colorDe(px, region, lx, ly) {
  const i = (ly * region.w + lx) * 4;
  return [px[i], px[i + 1], px[i + 2], px[i + 3]];
}

function malla(parte, colorBase) {
  return {
    visible: true,
    parent: null,
    userData: { superficie: true, parte, colorBase },
    material: {
      map: null, skinPixels: null, skinParte: null, needsUpdate: false, userData: {},
      color: { hex: colorBase, setHex(h) { this.hex = h; } },
    },
    children: [],
  };
}

function pivote(mesh) {
  const p = {
    visible: true,
    userData: {},
    children: [mesh],
    rotation: { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
  };
  mesh.parent = p;
  return p;
}

function muneco() {
  const piezas = {
    cabeza: malla('cabeza', 0xe0ac69),
    torso: malla('torso', 0x3f6212),
    brazoI: malla('brazoI', 0x3f6212),
    brazoD: malla('brazoD', 0x3f6212),
    piernaI: malla('piernaI', 0x1f2937),
    piernaD: malla('piernaD', 0x1f2937),
  };
  const armL = pivote(piezas.brazoI);
  const armR = pivote(piezas.brazoD);
  const legL = pivote(piezas.piernaI);
  const legR = pivote(piezas.piernaD);
  const pelo = { visible: true, userData: { adorno: true }, children: [], material: null };
  const mano = { visible: true, userData: { colorBase: 0xe0ac69 }, children: [], material: { map: null, skinPixels: null, color: { hex: 0xe0ac69, setHex(h) { this.hex = h; } } } };
  const ropa = { visible: true, userData: {}, children: [], material: { map: null, skinPixels: null, color: { hex: 0x111827, setHex(h) { this.hex = h; } } } };
  armL.children.push(mano);
  const persona = {
    visible: true,
    userData: { limbs: { armL, armR, legL, legR } },
    children: [piezas.cabeza, piezas.torso, pelo, armL, armR, legL, legR, ropa],
  };
  return { persona, piezas, armL, armR, legL, legR, pelo, mano, ropa };
}

function vec(x, y, z) {
  return {
    x, y, z,
    clone() { return vec(this.x, this.y, this.z); },
    copy(o) { this.x = o.x; this.y = o.y; this.z = o.z; return this; },
    distanceTo(o) { return Math.hypot(this.x - o.x, this.y - o.y, this.z - o.z); },
  };
}

const desde = html.indexOf('function swingLimbs(o, dt) {');
const hasta = html.indexOf('function dadWalkBob(dt) {');
assert.ok(desde > 0 && hasta > desde, 'no encontré swingLimbs');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(html.slice(desde, hasta) + '\nthis.swingLimbs = swingLimbs;', sandbox);

test('un dibujo distinto del muñeco base se serializa y vuelve igual', () => {
  const px = lienzoNuevo();
  assert.equal(esDistinta(px), false);
  assert.equal(parteEn(0, 0), null);
  const t = REGIONES.torso;
  pintar(px, t.x + t.w / 2, t.y + 8, 2, [255, 0, 0], false);
  assert.equal(esDistinta(px), true);
  const otra = restaurar(serializar(px));
  assert.ok(otra);
  const ax = (t.x + t.w / 2) | 0, ay = t.y + 8;
  const ai = (ay * LIENZO_W + ax) * 4;
  assert.deepEqual([otra[ai], otra[ai + 1], otra[ai + 2], otra[ai + 3]], [255, 0, 0, 255]);
  assert.equal(restaurar('no'), null);
  assert.equal(LIENZO_W, 80);
  assert.equal(LIENZO_H, 112);
});

test('la skin pintada queda en cada pieza y no se come la ropa ni las manos', () => {
  const px = lienzoNuevo();
  const marcas = {
    cabeza: [250, 204, 21, 255],
    torso: [220, 38, 38, 255],
    brazoI: [37, 99, 235, 255],
    brazoD: [14, 165, 233, 255],
    piernaI: [168, 85, 247, 255],
    piernaD: [236, 72, 153, 255],
  };
  for (const id of PARTES) {
    const r = REGIONES[id];
    pintar(px, r.x + 2.5, r.y + 2.5, 1.2, marcas[id], false);
  }
  const { persona, piezas, pelo, mano, ropa, armL } = muneco();
  assert.equal(aplicarSkin(persona, px), true);
  for (const id of PARTES) {
    const mat = piezas[id].material;
    assert.equal(mat.skinParte, id, id);
    assert.equal(mat.color.hex, 0xffffff, id);
    assert.deepEqual(colorDe(mat.skinPixels, { w: REGIONES[id].w }, 2, 2), marcas[id]);
    assert.notDeepEqual(colorDe(mat.skinPixels, { w: REGIONES[id].w }, 2, 2), [...COLOR_BASE[id]]);
  }
  assert.equal(piezas.brazoI.parent, armL);
  assert.equal(armL.children[0], piezas.brazoI);
  assert.equal(pelo.visible, false);
  assert.equal(mano.visible, true);
  assert.equal(mano.material.skinPixels, null);
  assert.equal(ropa.visible, true);
  assert.equal(ropa.material.map, null);
  assert.equal(persona.children.includes(ropa), true);

  assert.equal(aplicarSkin(persona, null), false);
  assert.equal(piezas.torso.material.map, null);
  assert.equal(piezas.torso.material.color.hex, 0x3f6212);
  assert.equal(pelo.visible, true);
  assert.equal(ropa.visible, true);
  assert.equal(piezas.brazoI.parent, armL);
});

test('al caminar los brazos y las piernas se articulan, cada uno por su lado', () => {
  const { persona, piezas, armL, armR, legL, legR } = muneco();
  const px = lienzoNuevo();
  pintar(px, REGIONES.torso.x + 4, REGIONES.torso.y + 4, 1, [255, 0, 0, 255], false);
  aplicarSkin(persona, px);
  persona.position = vec(0, 0, 0);
  sandbox.swingLimbs(persona, 0.016);
  assert.ok(armL.rotation.x === 0);
  assert.ok(legL.rotation.x === 0);

  persona.position = vec(0.4, 0, 0);
  sandbox.swingLimbs(persona, 0.2);
  const s = Math.sin(0.2 * 9) * 0.6;
  assert.ok(Math.abs(s) > 0.4, 'el paso de prueba tiene que notarse');
  assert.ok(Math.abs(armL.rotation.x - (-s)) < 1e-9);
  assert.ok(Math.abs(armR.rotation.x - s) < 1e-9);
  assert.ok(Math.abs(legL.rotation.x - s) < 1e-9);
  assert.ok(Math.abs(legR.rotation.x - (-s)) < 1e-9);
  assert.ok(armL.rotation.x * armR.rotation.x < 0);
  assert.ok(legL.rotation.x * legR.rotation.x < 0);
  assert.ok(armL.rotation.x * legL.rotation.x < 0);

  const primero = armL.rotation.x;
  persona.position = vec(0.9, 0, 0);
  sandbox.swingLimbs(persona, 0.35);
  assert.notEqual(armL.rotation.x, primero);
  assert.equal(piezas.brazoI.parent, armL);
  assert.equal(piezas.brazoD.parent, armR);
  assert.equal(piezas.piernaI.parent, legL);
  assert.equal(piezas.piernaD.parent, legR);
  assert.equal(piezas.brazoI.material.skinParte, 'brazoI');
  assert.equal(piezas.piernaI.material.skinParte, 'piernaI');
  assert.equal(recorte(px, REGIONES.brazoI).length, REGIONES.brazoI.w * REGIONES.brazoI.h * 4);
});

test('el juego pinta al jugador, guarda la skin y no cambia el balanceo', () => {
  assert.match(html, /skin-dibujo\.js\?v=2/);
  assert.match(sw, /skin-dibujo\.js\?v=2/);
  assert.match(sw, /const VERSION = 'tim-v107'/);
  assert.match(html, /m\.userData\.parte = parte; m\.userData\.superficie = true/);
  assert.match(html, /\{ parte: 'torso', superficie: true \}/);
  assert.match(html, /\{ parte: 'cabeza', superficie: true \}/);
  assert.match(html, /g\.userData\.limbs = \{ armL, armR, legL, legR \}/);
  assert.match(html, /swingLimbs\(playerAvatar, dt \|\| 0\.016\);\n  poseJugador\(\);/);
  assert.match(html, /skinDibujo: typeof state\.skinDibujo === 'string' \? state\.skinDibujo : null/);
  assert.match(html, /state\.skinDibujo = typeof d\.skinDibujo === 'string' \? d\.skinDibujo : null;\n  aplicarSkinJugador\(\);\n  aplicarRopaPuesta\(\);/);
  assert.match(html, /id="skinbox"/);
  assert.match(html, /id="skinCanvas"/);
  assert.match(html, /data-act="skin"/);
  assert.match(html, /id="pauseSkin"/);
  assert.doesNotMatch(html, /function swingLimbs\(o, dt\) \{\n  return;/);
});
