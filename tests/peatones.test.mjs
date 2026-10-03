import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  EJE_VEREDA, SEMAFOROS,
  avanzarPorTramo, caminoPorVereda, corregirAVereda, enAsfalto, enCalle, enCrucePeatonal, sobreVereda,
} from '../src/city-map.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function muestras(a, b) {
  const pts = [];
  const largo = Math.hypot(b.x - a.x, b.z - a.z);
  const n = Math.max(1, Math.ceil(largo / 0.4));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
  }
  return pts;
}

function legal(x, z) {
  return !enAsfalto(x, z) || enCrucePeatonal(x, z);
}

test('la vereda no es asfalto y la cebra sí se puede pisar', () => {
  assert.equal(enAsfalto(EJE_VEREDA, 27), false);
  assert.equal(enAsfalto(0, 27), true);
  assert.equal(enCrucePeatonal(0, EJE_VEREDA), true);
  assert.equal(legal(0, EJE_VEREDA), true);
});

test('un destino en la calzada se corre a la vereda', () => {
  for (const [x, z] of [[0, 27], [20, 0], [-10, 55], [55, 12], [150, 40]]) {
    const p = corregirAVereda(x, z);
    assert.equal(legal(p.x, p.z), true, `corregir (${x},${z}) → (${p.x},${p.z})`);
  }
  const esquina = corregirAVereda(EJE_VEREDA, 27);
  assert.ok(Math.hypot(esquina.x - EJE_VEREDA, esquina.z - 27) < 0.01);
});

test('el camino entre veredas no pisa la calzada fuera de la cebra', () => {
  const A = EJE_VEREDA;
  const esquinas = [];
  for (const c of SEMAFOROS) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) esquinas.push({ x: c.x + sx * A, z: c.z + sz * A });
  }
  for (let i = 0; i < esquinas.length; i += 3) {
    const a = esquinas[i], b = esquinas[(i * 5 + 7) % esquinas.length];
    const camino = caminoPorVereda(a.x, a.z, b.x, b.z);
    assert.ok(camino.length >= 1);
    const fin = camino[camino.length - 1];
    assert.ok(Math.hypot(fin.x - b.x, fin.z - b.z) < 1.2, `no llega a ${b.x},${b.z}`);
    for (let k = 1; k < camino.length; k++) {
      for (const p of muestras(camino[k - 1], camino[k])) {
        assert.equal(legal(p.x, p.z), true, `paso ilegal (${p.x.toFixed(1)},${p.z.toFixed(1)}) en ${a.x},${a.z} → ${b.x},${b.z}`);
      }
    }
  }
});

test('cada tramo del camino va por la vereda o la cebra, sin diagonal', () => {
  const A = EJE_VEREDA;
  const pares = [
    [A, 27.5, -A, 27.5],
    [27.5, A, 27.5, -A],
    [-49.2, 49.2, 49.2, -49.2],
    [A, -20, 40, -A],
  ];
  let huboCebra = false;
  for (const [x0, z0, x1, z1] of pares) {
    const camino = caminoPorVereda(x0, z0, x1, z1);
    assert.ok(camino.length >= 3, 'cruzar pide más de un tramo');
    for (let k = 1; k < camino.length; k++) {
      const a = camino[k - 1], b = camino[k];
      assert.ok(Math.abs(a.x - b.x) < 0.2 || Math.abs(a.z - b.z) < 0.2, 'tramo diagonal');
      for (const p of muestras(a, b)) {
        assert.equal(sobreVereda(p.x, p.z), true, `se sale (${p.x.toFixed(1)},${p.z.toFixed(1)})`);
        if (enCrucePeatonal(p.x, p.z) && enAsfalto(p.x, p.z)) huboCebra = true;
        assert.equal(enCalle(p.x, p.z) || enCrucePeatonal(p.x, p.z), true);
      }
    }
  }
  assert.equal(huboCebra, true);
});

test('un paso largo sigue el tramo y no se abre al pasto', () => {
  const a = { x: EJE_VEREDA, z: 8 }, b = { x: EJE_VEREDA, z: 40 };
  let x = a.x, z = a.z + 1;
  for (let i = 0; i < 12; i++) {
    const r = avanzarPorTramo(x, z, a.x, a.z, b.x, b.z, 2.2);
    assert.ok(Math.abs(r.x - EJE_VEREDA) < 0.05);
    assert.equal(sobreVereda(r.x, r.z), true);
    assert.ok(r.z >= z - 0.01);
    x = r.x; z = r.z;
  }
  assert.ok(z > 20);
});

test('la gente de la ciudad camina a un destino y no sale vestida igual', () => {
  assert.match(html, /caminoPorVereda\(/);
  assert.match(html, /seguirVereda\(/);
  assert.match(html, /avanzarPorTramo\(/);
  assert.match(html, /corregirAVereda\(/);
  assert.match(html, /poleron/);
  assert.match(html, /capucha/);
  assert.doesNotMatch(html, /b\.home\.x \+ Math\.cos\(a\) \* r/);
});
