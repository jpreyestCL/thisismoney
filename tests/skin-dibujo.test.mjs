// La skin dibujada es el personaje (fondo transparente). En reposo la malla
// es el lienzo entero. Al caminar se dobla con los pivotes y no se parte.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import {
  CORRER_BRAZO, FIGURA_ALTO, FIGURA_BASE, FIGURA_Z, GOLPE_ADELANTE, LIENZO_H, LIENZO_W, PASO_BRAZO, POSE_MANO, VIBRA_ATERRIZAJE,
  anchoFigura, aplicarPesosDeDibujo, aplicarSkin, avanceDeGolpe, capaSobreSkin, cartelSeBusca, dentroDeSilueta, esDistinta, giroDeGolpe, indiceDe, influenciaDe, lienzoNuevo,
  mallaEnReposo, mezclarSobreSkin, parteEn, pintar, posarDibujo, posarMalla, poseCorrer, poseSaltar, recorteBrazoBlanco, recorteManos, restaurar, serializar,
  vestirSobreSkin, vibrarBrazos,
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
  assert.match(html, /skin-dibujo\.js\?v=10/);
  assert.match(sw, /skin-dibujo\.js\?v=10/);
  assert.match(sw, /const VERSION = 'tim-v120'/);
  assert.match(html, /m\.userData\.parte = parte; m\.userData\.superficie = true/);
  assert.match(html, /\{ parte: 'torso', superficie: true \}/);
  assert.match(html, /\{ parte: 'cabeza', superficie: true \}/);
  assert.match(html, /m\.userData\.doll = true/);
  assert.match(html, /g\.userData\.limbs = \{ armL, armR, legL, legR \}/);
  assert.match(html, /swingLimbs\(playerAvatar, dt \|\| 0\.016\);\n  poseJugador\(\);\n  poseCuerpoJugador\(dt \|\| 0\.016\);\n  poseGolpeCuerpo\(\);\n  posarDibujo\(playerAvatar\);/);
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

test('al pegar, la mano sale en frontal, tercera y primera', () => {
  assert.ok(Math.abs(giroDeGolpe(0).x) < 1e-9, 'en reposo el brazo no está adelantado');
  assert.ok(Math.abs(giroDeGolpe(1).x) < 1e-9, 'al terminar el golpe vuelve');
  assert.ok(giroDeGolpe(0.5).x < -1.2, 'a la mitad la mano va adelante');
  const medio = giroDeGolpe(0.25).x;
  assert.ok(medio < -0.4 && medio > giroDeGolpe(0.5).x, 'sale y vuelve, no se queda adelante');
  const desde = html.indexOf('function poseGolpeCuerpo()');
  const hasta = html.indexOf('function updatePlayerCamera(dt)');
  assert.ok(desde > 0 && hasta > desde);
  const fn = html.slice(desde, hasta);
  assert.doesNotMatch(fn, /cameraMode/, 'el puñetazo del cuerpo no depende de la cámara');
  assert.match(fn, /const golpe = giroDeGolpe\(sw\)/);
  assert.match(fn, /l\.armR\.rotation\.x = golpe\.x/);
  assert.match(html, /poseGolpeCuerpo\(\);\n  posarDibujo\(playerAvatar\);/);
  assert.match(html, /D\.z - avanceDeGolpe\(sw\) \* GOLPE_ADELANTE/);
});

test('la ropa se dibuja como prenda y no como un tinte plano', () => {
  const px = queso();
  let opacos = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] >= 102) opacos++;
  const prendas = [
    { tipo: 'chaqueta', color: [17, 24, 39], borde: [11, 18, 32] },
    { tipo: 'poleron', color: [107, 114, 128], borde: [55, 65, 81] },
    { tipo: 'gorra', color: [220, 38, 38] },
    { tipo: 'camuflaje', color: [74, 92, 42] },
  ];
  for (const puesto of prendas) {
    const capa = capaSobreSkin(px, puesto);
    const tonos = new Set();
    let n = 0;
    for (let i = 0; i < capa.length; i += 4) {
      if (capa[i + 3] === 0) continue;
      n++;
      tonos.add(capa[i] + ',' + capa[i + 1] + ',' + capa[i + 2]);
    }
    assert.ok(tonos.size >= 4, puesto.tipo + ' tiene trama, costuras o cierres');
    assert.ok(n > 40 && n < opacos * 0.92, puesto.tipo + ' no recolorea el dibujo entero');
    assert.equal(dentroDeSilueta(capa, px), true, puesto.tipo);
  }
  const chaqueta = capaSobreSkin(px, prendas[0]);
  let claros = 0;
  for (let i = 0; i < chaqueta.length; i += 4) {
    if (chaqueta[i + 3] > 0 && chaqueta[i] > 180 && chaqueta[i + 1] > 170) claros++;
  }
  assert.ok(claros > 8, 'la chaqueta muestra cierre o botones');
});

test('la armadura y la ropa se ven puestas encima de la skin', () => {
  const px = queso();
  pintar(px, 32, 50, 5, [0, 0, 0, 0], true);
  const hueco = (50 * LIENZO_W + 32) * 4;
  const cara = (34 * LIENZO_W + 40) * 4;
  const centro = (56 * LIENZO_W + 40) * 4;
  const chaqueta = capaSobreSkin(px, { tipo: 'chaqueta', color: [17, 24, 39], borde: [11, 18, 32] });
  const armadura = capaSobreSkin(px, { tipo: 'armadura', color: [215, 221, 229], borde: [154, 164, 178] });
  const conChaqueta = vestirSobreSkin(px, chaqueta);
  const conArmadura = vestirSobreSkin(px, armadura);
  assert.equal(conChaqueta[hueco + 3], 0, 'el agujero sigue vacío con la chaqueta');
  assert.equal(conArmadura[hueco + 3], 0, 'el agujero sigue vacío con la armadura');
  assert.deepEqual([conChaqueta[cara], conChaqueta[cara + 1], conChaqueta[cara + 2], conChaqueta[cara + 3]], [250, 204, 21, 255]);
  assert.notEqual(conChaqueta[centro], 250, 'el torso lleva la chaqueta');
  assert.notEqual(conArmadura[centro], 250, 'el torso lleva la placa');
  assert.notEqual(conChaqueta[centro], conArmadura[centro]);
  let amarilloRopa = 0, amarilloPlaca = 0, distintos = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (conChaqueta[i] === 250 && conChaqueta[i + 1] === 204 && conChaqueta[i + 2] === 21 && conChaqueta[i + 3] >= 102) amarilloRopa++;
    if (conArmadura[i] === 250 && conArmadura[i + 1] === 204 && conArmadura[i + 2] === 21 && conArmadura[i + 3] >= 102) amarilloPlaca++;
    if (conChaqueta[i] !== conArmadura[i] || conChaqueta[i + 1] !== conArmadura[i + 1] || conChaqueta[i + 2] !== conArmadura[i + 2]) distintos++;
  }
  assert.ok(amarilloRopa > 400, 'un queso con chaqueta sigue siendo queso');
  assert.ok(amarilloPlaca > 400, 'un queso con armadura sigue siendo queso');
  assert.ok(distintos > 800, 'la armadura y la ropa se distinguen');
  assert.match(html, /vestirSobreSkin\(out, capaSobreSkin/);
  assert.doesNotMatch(html, /mezclarSobreSkin\(out/);
});

test('correr, saltar y el aterrizaje mueven los brazos', () => {
  const correr = poseCorrer(Math.PI / 2);
  assert.ok(Math.abs(correr.armR) > PASO_BRAZO + 0.4, 'correr abre más los brazos que caminar');
  assert.ok(correr.armR * correr.armL < 0);
  assert.ok(correr.legR * correr.armR < 0);
  assert.equal(CORRER_BRAZO, 1.25);
  const salto = poseSaltar(8);
  assert.ok(salto.armR < -2, 'al saltar los brazos suben');
  assert.ok(salto.legR < -0.8, 'al saltar las rodillas se encogen');
  const caida = poseSaltar(-6);
  assert.ok(caida.armR > salto.armR, 'caer no es la misma pose que subir');
  assert.ok(Math.abs(vibrarBrazos(0, VIBRA_ATERRIZAJE)) > 0.2, 'al tocar el suelo los brazos vibran');
  assert.equal(vibrarBrazos(VIBRA_ATERRIZAJE, VIBRA_ATERRIZAJE), 0, 'la vibración dura un momento');
  assert.equal(vibrarBrazos(-0.01, VIBRA_ATERRIZAJE), 0);
  assert.match(html, /poseCorrer\(cuerpoFase\)/);
  assert.match(html, /poseSaltar\(vy\)/);
  assert.match(html, /cuerpoVibra = VIBRA_ATERRIZAJE/);
  assert.match(html, /vibrarBrazos\(VIBRA_ATERRIZAJE - cuerpoVibra, VIBRA_ATERRIZAJE\)/);
});

function rayaConPalo() {
  const px = lienzoNuevo();
  for (let y = 12; y <= 102; y++) pintar(px, 36, y, 5.2, [192, 48, 48, 255], false);
  pintar(px, 36, 78, 6, [240, 192, 64, 255], false);
  // El palo nace DENTRO de la raya (más angosta que ella) y sube hacia la punta roja.
  for (let t = 0; t <= 24; t++) pintar(px, 34 + t * 1.05, 52 - t * 0.62, 2.3, [248, 250, 252, 255], false);
  pintar(px, 61, 35, 3.1, [192, 48, 48, 255], false);
  return px;
}

test('el palo blanco con punta roja es el brazo y el dibujo no se desarma', () => {
  const px = rayaConPalo();
  const quesoPx = queso();
  const reposoQueso = mallaEnReposo();
  const pesosQueso = reposoQueso.pesos.slice();
  assert.equal(aplicarPesosDeDibujo(reposoQueso, quesoPx), false);
  assert.equal(reposoQueso.brazoBlanco, undefined);
  for (let i = 0; i < pesosQueso.length; i++) assert.equal(reposoQueso.pesos[i], pesosQueso[i]);

  const reposo = mallaEnReposo();
  assert.equal(aplicarPesosDeDibujo(reposo, px), true);
  assert.equal(reposo.brazoBlanco, true);
  const mano = recorteBrazoBlanco(px);
  assert.ok(mano && mano.n > 8, 'la mano de primera persona es el palo');
  let blancos = 0, rojos = 0;
  for (let i = 0; i < mano.px.length; i += 4) {
    if (mano.px[i + 3] < 102) continue;
    if (mano.px[i] > 200 && mano.px[i + 1] > 200 && mano.px[i + 2] > 200) blancos++;
    if (mano.px[i] > 140 && mano.px[i + 1] < 110 && mano.px[i + 2] < 110) rojos++;
  }
  assert.ok(blancos > 8, 'el palo es blanco');
  assert.ok(rojos > 2, 'la punta es roja');

  const out = new Float32Array(reposo.posiciones.length);
  posarMalla(reposo, { armR: { rotation: { x: 0, y: 0, z: 0 } } }, out);
  for (let i = 0; i < reposo.posiciones.length; i++) assert.ok(Math.abs(out[i] - reposo.posiciones[i]) < 1e-5);

  const golpe = giroDeGolpe(0.5);
  posarMalla(reposo, { armR: { rotation: { x: golpe.x, y: 0, z: golpe.z } } }, out);
  const dist = (arr, a, b) => Math.hypot(arr[a] - arr[b], arr[a + 1] - arr[b + 1], arr[a + 2] - arr[b + 2]);
  let brazo = -1;
  for (let v = 0; v < reposo.pesos.length / 4; v++) {
    if (reposo.pesos[v * 4 + 1] === 1) { brazo = v; break; }
  }
  assert.ok(brazo > 0);
  const largo0 = dist(reposo.posiciones, brazo * 3, (brazo + 1) * 3);
  const largo1 = dist(out, brazo * 3, (brazo + 1) * 3);
  assert.ok(Math.abs(largo1 - largo0) < 1e-4, 'el palo gira entero, no se estira');
  const cuerpo = indiceDe(36, 90) * 3;
  assert.ok(Math.abs(out[cuerpo + 2] - reposo.posiciones[cuerpo + 2]) < 1e-4, 'la raya roja se queda');
  assert.ok(Math.abs(out[cuerpo + 1] - reposo.posiciones[cuerpo + 1]) < 1e-4);
  const jx = -anchoFigura() / 2 + (reposo.articulacion.x / LIENZO_W) * anchoFigura();
  const jy = FIGURA_BASE + FIGURA_ALTO * (1 - reposo.articulacion.y / LIENZO_H);
  let cerca = 1e9, movio = 1e9;
  for (let v = 0; v < reposo.pesos.length / 4; v++) {
    if (reposo.pesos[v * 4 + 1] !== 1) continue;
    const o = v * 3;
    const d = Math.hypot(reposo.posiciones[o] - jx, reposo.posiciones[o + 1] - jy);
    if (d < cerca) {
      cerca = d;
      movio = Math.hypot(out[o] - reposo.posiciones[o], out[o + 1] - reposo.posiciones[o + 1], out[o + 2] - reposo.posiciones[o + 2]);
    }
  }
  assert.ok(movio < 0.2, 'el arranque del palo sigue pegado a la raya ' + movio);
  posarMalla(reposo, { armR: { rotation: { x: 1.25, y: 0, z: 0 } } }, out);
  let minY = 99, minY0 = 99;
  for (let v = 0; v < reposo.pesos.length / 4; v++) {
    if (reposo.pesos[v * 4 + 1] !== 1) continue;
    const o = v * 3;
    if (out[o + 1] < minY) minY = out[o + 1];
    if (reposo.posiciones[o + 1] < minY0) minY0 = reposo.posiciones[o + 1];
  }
  assert.ok(minY > minY0 - 0.25, 'al correr el palo no cae al suelo');
  posarMalla(reposo, { armR: { rotation: { x: golpe.x, y: 0, z: golpe.z } } }, out);
  const puesto = { tipo: 'chaqueta', color: [17, 24, 39], borde: [11, 18, 32] };
  const placa = { tipo: 'armadura', color: [215, 221, 229], borde: [154, 164, 178] };
  const conChaqueta = vestirSobreSkin(px, capaSobreSkin(px, puesto));
  const conArmadura = vestirSobreSkin(px, capaSobreSkin(px, placa));
  let blancoRopa = 0, rojoRopa = 0, amarilloRopa = 0, tela = 0, distintos = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 102) continue;
    const orig = px[i] > 200 && px[i + 1] > 200 && px[i + 2] > 200;
    const rojo = px[i] > 140 && px[i + 1] < 110 && px[i + 2] < 110;
    const amarillo = px[i] > 180 && px[i + 1] > 140 && px[i + 2] < 140;
    if (orig && conChaqueta[i] > 200 && conChaqueta[i + 1] > 200) blancoRopa++;
    if (rojo && conChaqueta[i] > 140 && conChaqueta[i + 1] < 110) rojoRopa++;
    if (amarillo && conChaqueta[i] > 180 && conChaqueta[i + 1] > 140) amarilloRopa++;
    if (conChaqueta[i] !== px[i] || conChaqueta[i + 1] !== px[i + 1]) tela++;
    if (conChaqueta[i] !== conArmadura[i] || conChaqueta[i + 1] !== conArmadura[i + 1]) distintos++;
  }
  assert.ok(blancoRopa > 20, 'el palo blanco se sigue viendo con la chaqueta');
  assert.ok(rojoRopa > 4, 'la punta roja se sigue viendo');
  assert.ok(amarilloRopa > 4, 'el amarillo del dibujo se sigue viendo');
  assert.ok(tela > 12 && tela < px.length / 16, 'la ropa tapa una franja, no el dibujo entero');
  assert.ok(distintos > 8, 'la armadura y la chaqueta se distinguen');
  let dzPunta = 0, dzJunta = 0;
  const junta = reposo.articulacion, punta = reposo.punta;
  for (let v = 0; v < reposo.pesos.length / 4; v++) {
    const o = v * 3;
    const dx = reposo.posiciones[o] - (-anchoFigura() / 2 + (punta.x / LIENZO_W) * anchoFigura());
    const dy = reposo.posiciones[o + 1] - (FIGURA_BASE + FIGURA_ALTO * (1 - punta.y / LIENZO_H));
    if (reposo.pesos[v * 4 + 1] === 1 && dx * dx + dy * dy < dzPunta * 0 + 0.02) dzPunta = out[o + 2] - reposo.posiciones[o + 2];
  }
  const j = indiceDe(Math.round(junta.x), Math.round(junta.y)) * 3;
  dzJunta = out[j + 2] - reposo.posiciones[j + 2];
  assert.ok(dzPunta > dzJunta + 0.4, 'la punta roja sale más que la articulación ' + dzPunta + ' ' + dzJunta);
  assert.match(html, /aplicarPesosDeDibujo\(reposo, pixeles\)/);
  assert.match(html, /recorteBrazoBlanco\(crudo\)/);
  assert.match(html, /body\.touch\.recuadro #hud\s*\{[^}]*z-index:\s*20/);
});
