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

test('con E se entra y se sale de los edificios (y los rascacielos suben a la azotea)', () => {
  assert.match(html, /const ENTRADAS = \[\]/);
  assert.match(html, /function tryEntrada\(/);
  assert.match(html, /if \(tryEntrada\(\)\) return;/);
  assert.match(html, /entradaAccion\(\)/);
  for (const nombre of ['Edificio Mirador', 'Banco Central', 'Penal La Roca']) assert.ok(html.includes("nombre: '" + nombre + "'"), nombre);
  assert.match(html, /nombre: 'rascacielos', azotea: true/);
});

test('pararte después de agacharte no te hace atravesar la losa', () => {
  assert.match(html, /if \(ojoAhora > ojoAntes && grounded\) player\.position\.y \+= ojoAhora - ojoAntes;/);
  assert.match(html, /pisoTorre: torreAdentro\(\) \? torreNivel\(\) : 0/);
});

test('bajo techo no llueve y en 1ª persona tu cuerpo solo sale en el espejo', () => {
  assert.match(html, /rainObj\.visible = !bajoTecho\(\)/);
  assert.match(html, /playerAvatar\.visible = cameraMode !== 0 && !state\.driving && !state\.riding;/);
  assert.equal((html.match(/\.add\(lunaConCuerpo\(luna\)\)/g) || []).length, 2);
});

test('el horno se apoya en el piso (no flota)', () => {
  assert.match(html, /oven: 0\.7/);
});

test('los muebles del depto se usan con E', () => {
  for (const t of ['tele', 'play', 'congelador', 'horno', 'lavamanos', 'ducha', 'lampara']) assert.match(html, new RegExp("objeto\\('" + t + "'"));
  for (const k of ['sofa', 'silla', 'bano', 'cama']) assert.match(html, new RegExp("asiento\\('" + k + "'"));
  assert.match(html, /if \(q\.tipo === 'objeto'\) return usarObjetoDepto\(q\.obj\)/);
  assert.match(html, /salida = sitOn\.salida/);   // te paras en un punto libre, no dentro del muro
});
