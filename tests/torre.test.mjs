// El Edificio Mirador: conserje en el hall, ascensor con botonera, escaleras y
// departamentos numerados de $3000 con living, cocina, baño y pieza.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DISTRITOS, LUGARES, callesDelMapa, rectCalle, rectDistrito, seCruzan, validarMapa } from '../src/city-map.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Mismas medidas que TORRE en index.html (w 32 × d 20, más la marquesina al frente).
const TORRE = { x: LUGARES.torre.x, z: LUGARES.torre.z, w: 32, d: 20 };
const rect = (b, mx = 0, mz = mx) => ({
  minX: b.x - b.w / 2 - mx, maxX: b.x + b.w / 2 + mx,
  minZ: b.z - b.d / 2 - mz, maxZ: b.z + b.d / 2 + mz,
});

test('el edificio cabe en su manzana y no pisa la calle', () => {
  const r = rect(TORRE, .5, 2);
  const limite = rectDistrito(DISTRITOS.find(d => d.id === 'torre'));
  assert.ok(r.minX >= limite.minX && r.maxX <= limite.maxX, 'se sale de la manzana en x');
  assert.ok(r.minZ >= limite.minZ && r.maxZ <= limite.maxZ, 'se sale de la manzana en z');
  for (const calle of callesDelMapa()) assert.ok(!seCruzan(rectCalle(calle), rect(TORRE)), `se monta sobre ${calle.id}`);
  assert.deepEqual(validarMapa(), []);
});

test('el departamento cuesta $3000 y se compra con la conserje', () => {
  assert.match(html, /const TORRE_PRECIO = 3000/);
  assert.match(html, /function comprarDepto\(/);
  assert.match(html, /torreConserje/);
});

test('el ascensor tiene botones para elegir el piso y hay escaleras', () => {
  assert.match(html, /function elegirPiso\(/);
  assert.match(html, /id="liftbox"/);
  assert.match(html, /data-lift=/);
  assert.match(html, /function updateTorreLift\(/);
  assert.match(html, /TORRE_HUECO/);
});

test('el horno se apoya en el piso (no flota)', () => {
  assert.match(html, /oven: 0\.7/);
});
