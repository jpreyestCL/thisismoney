// La skin dibujada es el personaje (fondo transparente). En reposo la malla
// es el lienzo entero. Al caminar se dobla con los pivotes y no se parte.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import {
  FIGURA_ALTO, FIGURA_BASE, FIGURA_Z, GOLPE_ADELANTE, LIENZO_H, LIENZO_W, POSE_MANO,
  anchoFigura, aplicarSkin, avanceDeGolpe, capaSobreSkin, cartelSeBusca, dentroDeSilueta, esDistinta, indiceDe, influenciaDe, lienzoNuevo,
  mallaEnReposo, mezclarSobreSkin, parteEn, pintar, posarDibujo, posarMalla, recorteManos, restaurar, serializar,
} from '../src/skin-dibujo.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

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

function pivote(mesh, x, y) {
  const p = {
    visible: true,
    position: { x, y, z: 0 },
    userData: {},
    children: [mesh],
    rotation: { x: 0, y: 0, z: 0, set(a, b, c) { this.x = a; this.y = b; this.z = c; } },
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
  const armL = pivote(piezas.brazoI, -0.5, 1.78);
  const armR = pivote(piezas.brazoD, 0.5, 1.78);
  const legL = pivote(piezas.piernaI, -0.2, 0.9);
  const legR = pivote(piezas.piernaD, 0.2, 0.9);
  const pelo = { visible: true, userData: { adorno: true }, children: [], material: null };
  const mano = { visible: true, userData: { doll: true, colorBase: 0xe0ac69 }, children: [], material: { map: null, skinPixels: null, color: { hex: 0xe0ac69, setHex(h) { this.hex = h; } } } };
  const ropa = { visible: true, userData: {}, children: [], material: { map: null, skinPixels: null, color: { hex: 0x111827, setHex(h) { this.hex = h; } } } };
  armL.children.push(mano);
  const persona = {
    visible: true,
    userData: { limbs: { armL, armR, legL, legR } },
    children: [piezas.cabeza, piezas.torso, pelo, armL, armR, legL, legR, ropa],
  };
  return { persona, piezas, armL, armR, legL, legR, pelo, mano, ropa };
}

function mallaFalsa(pixeles, reposo) {
  return {
    visible: true,
    userData: {},
    parent: null,
    children: [],
    material: { map: { id: 'lienzo' }, skinPixels: pixeles, dispose() {} },
    geometry: {
      attributes: { position: { array: reposo.posiciones.slice(), needsUpdate: false } },
      dispose() {},
    },
  };
}

function rotacion(x) {
  return { rotation: { x, y: 0, z: 0 } };
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

test('un dibujo libre, con fondo transparente, se serializa y vuelve igual', () => {
  const px = lienzoNuevo();
  assert.equal(esDistinta(px), false);
  assert.equal(px[3], 0);
  let cubiertos = 0;
  for (let y = 0; y < LIENZO_H; y++) for (let x = 0; x < LIENZO_W; x++) if (parteEn(x, y)) cubiertos++;
  assert.equal(cubiertos, LIENZO_W * LIENZO_H);
  assert.equal(parteEn(0, 0), 'cabeza');
  assert.equal(parteEn(-1, 0), null);
  pintar(px, 2, 2, 1.2, [255, 196, 48], false);
  assert.equal(esDistinta(px), true);
  const i = (2 * LIENZO_W + 2) * 4;
  assert.deepEqual([px[i], px[i + 1], px[i + 2], px[i + 3]], [255, 196, 48, 255]);
  pintar(px, 2, 2, 1.2, [0, 0, 0, 255], true);
  assert.equal(px[i + 3], 0);
  assert.equal(esDistinta(px), false);
  pintar(px, 40, 56, 4, [255, 176, 32, 255], false);
  const otra = restaurar(serializar(px));
  assert.ok(otra);
  const ai = (56 * LIENZO_W + 40) * 4;
  assert.deepEqual([otra[ai], otra[ai + 1], otra[ai + 2], otra[ai + 3]], [255, 176, 32, 255]);
  assert.equal(otra[3], 0);
  assert.equal(restaurar('no'), null);
  assert.equal(LIENZO_W, 80);
  assert.equal(LIENZO_H, 112);
});

test('la skin pintada tapa al muñeco con una sola malla y no se come la ropa', () => {
  const px = lienzoNuevo();
  pintar(px, 40, 54, 8, [250, 204, 21, 255], false);
  const { persona, piezas, pelo, mano, ropa, armL } = muneco();
  let creada = null;
  assert.equal(aplicarSkin(persona, px, {
    crearMalla: (pixeles, reposo) => { creada = mallaFalsa(pixeles, reposo); return creada; },
  }), true);
  assert.equal(persona.userData.dibujo.length, 1);
  assert.equal(creada.userData.dibujo, 'entero');
  assert.equal(creada.parent, persona);
  assert.equal(creada.material.skinPixels, px);
  assert.equal(creada.userData.reposo.indices.length, LIENZO_W * LIENZO_H * 6);
  for (const id of ['cabeza', 'torso', 'brazoI', 'brazoD', 'piernaI', 'piernaD']) {
    assert.equal(piezas[id].visible, false, id);
  }
  assert.equal(pelo.visible, false);
  assert.equal(mano.visible, false);
  assert.equal(ropa.visible, true);
  assert.equal(ropa.material.map, null);
  assert.equal(persona.children.includes(ropa), true);
  assert.equal(piezas.brazoI.parent, armL);
  assert.equal(armL.children.includes(creada), false);

  assert.equal(aplicarSkin(persona, null), false);
  assert.equal(piezas.torso.visible, true);
  assert.equal(piezas.torso.material.map, null);
  assert.equal(piezas.torso.material.color.hex, 0x3f6212);
  assert.equal(pelo.visible, true);
  assert.equal(mano.visible, true);
  assert.equal(ropa.visible, true);
  assert.equal(persona.userData.dibujo, null);
  assert.equal(creada.parent, null);
});

test('en reposo el dibujo es el lienzo y al caminar se dobla sin desarmarse', () => {
  const reposo = mallaEnReposo();
  const { cols, filas, posiciones, uvs } = reposo;
  const nv = (cols + 1) * (filas + 1);
  const ancho = anchoFigura();
  assert.equal(posiciones.length, nv * 3);
  assert.equal(uvs.length, nv * 2);
  const p = (i, j) => {
    const k = indiceDe(i, j, cols) * 3;
    return [posiciones[k], posiciones[k + 1], posiciones[k + 2]];
  };
  const arriba = p(0, 0), abajo = p(cols, filas);
  assert.ok(Math.abs(arriba[0] + ancho / 2) < 1e-5);
  assert.ok(Math.abs(arriba[1] - (FIGURA_BASE + FIGURA_ALTO)) < 1e-5);
  assert.ok(Math.abs(arriba[2] - FIGURA_Z) < 1e-5);
  assert.ok(Math.abs(abajo[0] - ancho / 2) < 1e-5);
  assert.ok(Math.abs(abajo[1] - FIGURA_BASE) < 1e-5);
  assert.ok(Math.abs(uvs[1] - 1) < 1e-6);
  const ult = indiceDe(cols, filas, cols) * 2;
  assert.ok(Math.abs(uvs[ult] - 1) < 1e-6);
  assert.ok(Math.abs(uvs[ult + 1]) < 1e-6);
  for (let v = 0; v < nv; v++) assert.ok(Math.abs(posiciones[v * 3 + 2] - FIGURA_Z) < 1e-5);

  for (const [x, y] of [[40, 54], [33, 46], [48, 50], [38, 64]]) {
    const w = influenciaDe(x, y);
    assert.ok(w.brazoI + w.brazoD + w.piernaI + w.piernaD < 1e-6, x + ',' + y);
  }
  assert.ok(influenciaDe(0, 50).brazoI > 0.99);
  assert.ok(influenciaDe(80, 50).brazoD > 0.99);
  assert.ok(influenciaDe(0, 112).piernaI > 0.99);
  assert.ok(influenciaDe(80, 112).piernaD > 0.99);
  assert.ok(influenciaDe(0, 0).brazoI < 1e-6);
  assert.ok(influenciaDe(40, 112).piernaI + influenciaDe(40, 112).piernaD < 1e-6);

  const quieto = { armL: rotacion(0), armR: rotacion(0), legL: rotacion(0), legR: rotacion(0) };
  const out = new Float32Array(posiciones.length);
  posarMalla(reposo, quieto, out);
  for (let i = 0; i < posiciones.length; i++) assert.ok(Math.abs(out[i] - posiciones[i]) < 1e-5);

  const paso = { armL: rotacion(-0.6), armR: rotacion(0.6), legL: rotacion(0.6), legR: rotacion(-0.6) };
  posarMalla(reposo, paso, out);
  const at = (i, j) => indiceDe(i, j, cols) * 3;
  const igual = (i, j) => {
    const k = at(i, j);
    assert.ok(Math.abs(out[k] - posiciones[k]) < 1e-4, 'x ' + i + ',' + j);
    assert.ok(Math.abs(out[k + 1] - posiciones[k + 1]) < 1e-4, 'y ' + i + ',' + j);
    assert.ok(Math.abs(out[k + 2] - posiciones[k + 2]) < 1e-4, 'z ' + i + ',' + j);
  };
  igual(40, 54);
  igual(33, 46);
  igual(48, 50);
  igual(38, 64);
  const dz = (i, j) => out[at(i, j) + 2] - posiciones[at(i, j) + 2];
  const brazo = dz(0, 50), pierna = dz(0, 112), otro = dz(80, 50), borde = dz(8, 54);
  assert.ok(Math.abs(brazo) > 0.15, 'el brazo da el paso');
  assert.ok(Math.abs(pierna) > 0.15, 'la pierna da el paso');
  assert.ok(brazo * pierna < 0);
  assert.ok(brazo * otro < 0);
  assert.ok(Math.abs(borde) > 0.04, 'el borde del dibujo acompaña el brazo');
  assert.ok(Math.abs(dz(22, 80)) > 0.08, 'la pierna del dibujo da el paso');

  let maxR = 1, maxCuerpo = 1;
  const largo = (arr, ia, ib) => Math.hypot(arr[ia] - arr[ib], arr[ia + 1] - arr[ib + 1], arr[ia + 2] - arr[ib + 2]);
  for (let j = 0; j <= filas; j++) {
    for (let i = 0; i <= cols; i++) {
      const k = at(i, j);
      const mira = (ii, jj) => {
        const r0 = largo(posiciones, k, at(ii, jj));
        const r = largo(out, k, at(ii, jj)) / r0;
        maxR = Math.max(maxR, r);
        if (i >= 28 && i <= 52 && j >= 36 && j <= 66) maxCuerpo = Math.max(maxCuerpo, r);
      };
      if (i < cols) mira(i + 1, j);
      if (j < filas) mira(i, j + 1);
    }
  }
  assert.ok(maxR < 3.2, 'estiramiento ' + maxR);
  assert.ok(maxCuerpo < 1.05, 'el centro del dibujo se estira ' + maxCuerpo);

  const { persona, armL, armR, legL, legR } = muneco();
  const px = lienzoNuevo();
  pintar(px, 8, 54, 3, [250, 204, 21, 255], false);
  pintar(px, 8, 100, 3, [250, 204, 21, 255], false);
  const mesh = aplicarSkin(persona, px, { crearMalla: mallaFalsa }) && persona.userData.dibujo[0];
  assert.equal(mesh.parent, persona);
  persona.position = vec(0, 0, 0);
  sandbox.swingLimbs(persona, 0.016);
  assert.ok(armL.rotation.x === 0);
  assert.ok(legL.rotation.x === 0);
  persona.position = vec(0.4, 0, 0);
  sandbox.swingLimbs(persona, 0.2);
  const s = Math.sin(0.2 * 9) * 0.6;
  assert.ok(Math.abs(s) > 0.4);
  assert.ok(Math.abs(armL.rotation.x - (-s)) < 1e-9);
  assert.ok(Math.abs(armR.rotation.x - s) < 1e-9);
  assert.ok(Math.abs(legL.rotation.x - s) < 1e-9);
  assert.ok(Math.abs(legR.rotation.x - (-s)) < 1e-9);
  assert.ok(armL.rotation.x * legL.rotation.x < 0);
  posarDibujo(persona);
  assert.equal(mesh.parent, persona);
  assert.equal(armL.children.includes(mesh), false);
  const arr = mesh.geometry.attributes.position.array;
  const kb = indiceDe(0, 50) * 3, kp = indiceDe(0, 112) * 3, kc = indiceDe(40, 54) * 3;
  const base = mesh.userData.reposo.posiciones;
  assert.ok(Math.abs(arr[kc] - base[kc]) < 1e-4);
  assert.ok(Math.abs(arr[kc + 2] - base[kc + 2]) < 1e-4);
  assert.ok(Math.abs(arr[kb + 2] - base[kb + 2]) > 0.05);
  assert.ok(Math.abs(arr[kp + 2] - base[kp + 2]) > 0.05);
  assert.ok((arr[kb + 2] - base[kb + 2]) * (arr[kp + 2] - base[kp + 2]) < 0);
  const primero = armL.rotation.x;
  persona.position = vec(0.9, 0, 0);
  sandbox.swingLimbs(persona, 0.35);
  assert.notEqual(armL.rotation.x, primero);
  posarDibujo(persona);
  assert.equal(mesh.parent, persona);
});

function queso() {
  const px = lienzoNuevo();
  pintar(px, 40, 56, 26, [250, 204, 21, 255], false);
  return px;
}

test('en la vista normal las manos son las del dibujo y van delante del cuerpo', () => {
  const px = queso();
  pintar(px, 32, 50, 5, [0, 0, 0, 0], true);
  const manos = recorteManos(px);
  assert.ok(manos.izquierda.n > 8, 'la mano izquierda sale del costado del queso');
  assert.ok(manos.derecha.n > 8, 'la mano derecha sale del otro costado');
  assert.ok(manos.izquierda.x < 40);
  assert.ok(manos.derecha.x > 40);
  assert.ok(manos.izquierda.x + manos.izquierda.w <= manos.derecha.x, 'no es un pedazo del centro');
  for (const mano of [manos.izquierda, manos.derecha]) {
    for (let y = 0; y < mano.h; y++) {
      for (let x = 0; x < mano.w; x++) {
        const d = (y * mano.w + x) * 4;
        if (mano.px[d + 3] === 0) continue;
        const sx = mano.x + x, sy = mano.y + y;
        const s = (sy * LIENZO_W + sx) * 4;
        assert.ok(px[s + 3] >= 102, 'la mano no sale de la silueta');
        assert.equal(mano.px[d], px[s]);
      }
    }
  }
  const D = POSE_MANO.derecha, I = POSE_MANO.izquierda;
  assert.ok(D.x > 0.2 && I.x < -0.15, 'una mano a cada lado');
  assert.ok(D.y < -0.3 && I.y < -0.3, 'delante del cuerpo, no al centro de la vista');
  assert.ok(D.z < -0.7 && I.z < -0.7, 'por delante de la cámara');
  assert.ok(D.tam < 0.5 && I.tam < 0.5, 'tamaño de mano, no un pedazo gigante');
  assert.match(html, /arm\.userData\.humano = true/);
  assert.match(html, /fist\.userData\.humano = true/);
  assert.match(html, /function ponerManosVista\(px\)/);
  assert.match(html, /mangaHumana\(false\)/);
  assert.match(html, /POSE_MANO\.derecha/);
  assert.match(html, /POSE_MANO\.izquierda/);
  assert.match(html, /camera\.add\(der\)/);
  assert.match(html, /camera\.add\(izq\)/);
  assert.doesNotMatch(html, /mesh\.position\.set\(0\.02, 0\.28, -0\.12\)/);
  assert.doesNotMatch(html, /function ponerBrazoVista/);
});

test('todos los colores del lienzo llegan al personaje', () => {
  const px = lienzoNuevo();
  const colores = [
    [220, 38, 38, 255],
    [34, 197, 94, 255],
    [37, 99, 235, 255],
    [250, 204, 21, 255],
    [168, 85, 247, 255],
    [14, 165, 233, 255],
  ];
  const puntos = [[10, 8], [40, 10], [70, 16], [6, 50], [40, 48], [70, 52], [12, 96], [58, 100]];
  puntos.forEach(([x, y], i) => pintar(px, x, y, 5, colores[i % colores.length]));
  const vistos = new Map();
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 102) continue;
    const k = px[i] + ',' + px[i + 1] + ',' + px[i + 2];
    vistos.set(k, (vistos.get(k) || 0) + 1);
  }
  assert.ok(vistos.size >= 6, 'el lienzo tiene muchos colores, no un par');
  const { persona } = muneco();
  let recibidos = null;
  assert.equal(aplicarSkin(persona, px, {
    crearMalla: (pixeles, reposo) => {
      recibidos = pixeles;
      return mallaFalsa(pixeles, reposo);
    },
  }), true);
  assert.ok(recibidos);
  assert.equal(recibidos.length, px.length);
  for (const [k, n] of vistos) {
    const [r, g, b] = k.split(',').map(Number);
    let llega = 0;
    for (let i = 0; i < recibidos.length; i += 4) {
      if (recibidos[i] === r && recibidos[i + 1] === g && recibidos[i + 2] === b && recibidos[i + 3] >= 102) llega++;
    }
    assert.equal(llega, n, k + ' tiene que llegar entero, no solo unas pocas piezas');
  }
  for (let i = 0; i < px.length; i += 4) {
    assert.equal(recibidos[i], px[i]);
    assert.equal(recibidos[i + 1], px[i + 1]);
    assert.equal(recibidos[i + 2], px[i + 2]);
    assert.equal(recibidos[i + 3], px[i + 3]);
  }
  const cabeza = (8 * LIENZO_W + 10) * 4;
  const torso = (48 * LIENZO_W + 40) * 4;
  const brazo = (52 * LIENZO_W + 70) * 4;
  const pierna = (100 * LIENZO_W + 58) * 4;
  assert.notEqual(px[cabeza], px[torso]);
  assert.notEqual(px[torso], px[brazo]);
  assert.notEqual(px[brazo], px[pierna]);
  assert.match(html, /crearMallaSkin\(visto, reposo\)/);
  assert.match(html, /toneMapped: false/);
  const materiales = html.match(/new THREE\.MeshBasicMaterial\(\{ map: tex, transparent: true, alphaTest: 0\.4, depthWrite: true, side: THREE\.DoubleSide, toneMapped: false \}\)/g);
  assert.ok(materiales && materiales.length >= 2, 'el cuerpo y las manos salen con el color pintado');
});

test('al pegar la mano avanza y vuelve', () => {
  assert.equal(avanceDeGolpe(0), 0);
  assert.ok(Math.abs(avanceDeGolpe(1)) < 1e-9, 'al empezar y al terminar está atrás');
  assert.ok(avanceDeGolpe(0.5) > 0.9, 'a la mitad del swing va del todo adelante');
  assert.ok(GOLPE_ADELANTE > 0.3);
  const D = POSE_MANO.derecha;
  const zDe = (sw) => D.z - avanceDeGolpe(sw) * GOLPE_ADELANTE;
  assert.equal(zDe(0), D.z);
  assert.ok(Math.abs(zDe(1) - D.z) < 1e-9);
  assert.ok(zDe(0.5) < D.z - 0.3, 'a mitad del golpe la mano del dibujo está más adelante que en reposo');
  assert.ok(zDe(0.25) < D.z && zDe(0.25) > zDe(0.5), 'sale y vuelve, no se queda adelante');
  const humana = (sw) => -0.9 - avanceDeGolpe(sw) * GOLPE_ADELANTE;
  assert.ok(humana(0.5) < humana(0) - 0.3, 'sin skin la mano normal también sale adelante');
  assert.ok(Math.abs(humana(1) - humana(0)) < 1e-9);
  assert.match(html, /D\.z - avanceDeGolpe\(sw\) \* GOLPE_ADELANTE/);
  assert.match(html, /kind === 'gun' \|\| kind === 'bow'\) \? 0 : avanceDeGolpe\(sw\) \* GOLPE_ADELANTE/);
  assert.match(html, /-0\.9 - adelanta \+ kick \* \.12/);
  assert.match(html, /I\.z\)/);
});

test('la armadura y la ropa quedan dentro de la silueta de la skin', () => {
  const px = queso();
  const hueco = (50 * LIENZO_W + 32) * 4;
  pintar(px, 32, 50, 5, [0, 0, 0, 0], true);
  assert.equal(px[hueco + 3], 0);
  const tipos = [
    { tipo: 'armadura', color: [215, 221, 229], borde: [154, 164, 178] },
    { tipo: 'chaqueta', color: [17, 24, 39], borde: [11, 18, 32] },
    { tipo: 'poleron', color: [107, 114, 128], borde: [55, 65, 81] },
    { tipo: 'gorra', color: [220, 38, 38] },
    { tipo: 'camuflaje', color: [74, 92, 42] },
  ];
  for (const puesto of tipos) {
    const capa = capaSobreSkin(px, puesto);
    assert.equal(capa.length, px.length);
    assert.equal(dentroDeSilueta(capa, px), true, puesto.tipo);
    assert.equal(capa[hueco + 3], 0, puesto.tipo + ' no tapa el agujero');
    let n = 0;
    for (let i = 3; i < capa.length; i += 4) if (capa[i] > 0) n++;
    assert.ok(n > 0, puesto.tipo + ' pinta el dibujo');
    const visto = mezclarSobreSkin(px, capa, 0.8);
    for (let i = 3; i < px.length; i += 4) assert.equal(visto[i], px[i]);
  }
  const gorra = capaSobreSkin(px, { tipo: 'gorra', color: [220, 38, 38] });
  const arriba = (40 * LIENZO_W + 40) * 4;
  const abajo = (70 * LIENZO_W + 40) * 4;
  assert.equal(gorra[arriba + 3], 255);
  assert.equal(gorra[abajo + 3], 0);
  const centro = (56 * LIENZO_W + 40) * 4;
  const armadura = capaSobreSkin(px, { tipo: 'armadura', color: [215, 221, 229], borde: [154, 164, 178] });
  assert.equal(armadura[centro + 3], 255);
  const puesto = mezclarSobreSkin(px, armadura, 0.8);
  assert.notEqual(puesto[centro], 250);
  const manos = recorteManos(puesto);
  assert.ok(manos.derecha.n > 0);
  let teñida = 0;
  for (let i = 0; i < manos.derecha.px.length; i += 4) {
    if (manos.derecha.px[i + 3] === 0) continue;
    assert.ok(manos.derecha.px[i + 3] >= 102);
    if (manos.derecha.px[i] !== 250) teñida++;
  }
  assert.ok(teñida > 0, 'lo que lleva el brazo se ve en la mano de la skin');
  assert.match(html, /function pixelesVisibles/);
  assert.match(html, /function refrescarTexturaPuesta/);
  assert.match(html, /capaSobreSkin/);
  assert.match(html, /applyMinecraftArmor\(playerAvatar, null\)/);
  assert.match(html, /viewmodel\.userData\.bracer\) viewmodel\.userData\.bracer\.visible = false/);
});

test('el cartel SE BUSCA muestra la skin y no la cara humana', () => {
  const entero = queso();
  const px = queso();
  pintar(px, 40, 56, 6, [0, 0, 0, 0], true);
  const cara = cartelSeBusca(null);
  const poster = cartelSeBusca(entero);
  const conHueco = cartelSeBusca(px);
  assert.equal(cara.length, poster.length);
  const contar = (buf, r, g, b) => {
    let n = 0;
    for (let i = 0; i < buf.length; i += 4) if (buf[i] === r && buf[i + 1] === g && buf[i + 2] === b && buf[i + 3] === 255) n++;
    return n;
  };
  assert.ok(contar(cara, 224, 172, 105) > 100, 'sin skin queda la cara humana');
  assert.equal(contar(poster, 224, 172, 105), 0, 'con skin no hay cara humana');
  assert.ok(contar(poster, 250, 204, 21) > 40, 'el queso está en el cartel');
  const papel = (20 * 256 + 20) * 4;
  assert.equal(poster[papel], 247);
  assert.equal(poster[papel + 1], 241);
  assert.ok(contar(conHueco, 250, 204, 21) < contar(poster, 250, 204, 21));
  assert.match(html, /cartelSeBusca\(px\)/);
  assert.match(html, /function refrescarCarteles/);
  assert.match(html, /refrescarCarteles\(\)/);
});

test('el juego pinta al jugador desde el inicio, guarda la skin y no cambia el balanceo', () => {
  assert.match(html, /skin-dibujo\.js\?v=9/);
  assert.match(sw, /skin-dibujo\.js\?v=9/);
  assert.match(sw, /const VERSION = 'tim-v114'/);
  assert.match(html, /m\.userData\.parte = parte; m\.userData\.superficie = true/);
  assert.match(html, /\{ parte: 'torso', superficie: true \}/);
  assert.match(html, /\{ parte: 'cabeza', superficie: true \}/);
  assert.match(html, /m\.userData\.doll = true/);
  assert.match(html, /g\.userData\.limbs = \{ armL, armR, legL, legR \}/);
  assert.match(html, /swingLimbs\(playerAvatar, dt \|\| 0\.016\);\n  poseJugador\(\);\n  posarDibujo\(playerAvatar\);/);
  assert.match(html, /skinDibujo: typeof state\.skinDibujo === 'string' \? state\.skinDibujo : null/);
  assert.match(html, /state\.skinDibujo = skinAlEntrar\(d\.skinDibujo\);\n  aplicarSkinJugador\(\);\n  aplicarRopaPuesta\(\);/);
  assert.match(html, /state\.skinDibujo = leerSkinInicio\(\); aplicarSkinJugador\(\);/);
  assert.match(html, /id="startSkin"/);
  assert.match(html, /ui\('startSkin'\)\.onclick = \(\) => abrirEditorSkin\(\)/);
  assert.match(html, /id="skinbox"/);
  assert.match(html, /id="skinCanvas"/);
  assert.match(html, /alphaTest: 0\.4/);
  assert.match(html, /crearMalla: crearMallaSkin/);
  assert.match(html, /data-act="skin"/);
  assert.match(html, /id="pauseSkin"/);
  assert.doesNotMatch(html, /crearPlanoSkin/);
  assert.doesNotMatch(html, /function swingLimbs\(o, dt\) \{\n  return;/);
  assert.doesNotMatch(html, /function abrirEditorSkin\(\) \{\n  if \(!state\.running\) return;/);
});
