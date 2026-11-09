import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deslizarJugador } from '../src/jugador-solido.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

function cabeEnElPaso(x0, z0, x1, z1, dx, dz) {
  const mx = x1 - x0, mz = z1 - z0;
  const lim = (m, d) => d === 0 ? Math.abs(m) < 1e-6 : m / d >= -1e-6 && m / d <= 1 + 1e-6;
  assert.ok(lim(mx, dx) && lim(mz, dz), `se salió del paso: (${mx.toFixed(3)}, ${mz.toFixed(3)}) de (${dx}, ${dz})`);
  assert.ok(Math.hypot(mx, mz) <= Math.hypot(dx, dz) + 1e-6);
}

test('el jugador no entra en un muro y se desliza de lado', () => {
  const muro = (x, z) => z > 1.2 && z < 4 && Math.abs(x) < 40;
  let x = 0, z = 0;
  for (let i = 0; i < 40; i++) {
    const ax = x, az = z;
    const m = deslizarJugador(x, z, 0.22, 0.28, muro);
    cabeEnElPaso(ax, az, m.x, m.z, 0.22, 0.28);
    x = m.x; z = m.z;
    assert.ok(z <= 1.2, `entró en el muro: z=${z}`);
  }
  assert.ok(x > 1, 'no se deslizó a lo largo del muro');
});

test('un muro fino no se atraviesa con un paso largo', () => {
  const fino = (x) => x > 0.85 && x < 1.02;
  const m = deslizarJugador(0, 0, 3, 0, fino);
  cabeEnElPaso(0, 0, m.x, m.z, 3, 0);
  assert.ok(m.x <= 0.85, `atravesó: x=${m.x}`);
  assert.ok(m.x > 0.5, 'se quedó demasiado atrás');
});

test('una puerta cerrada frena y una abierta se cruza', () => {
  const hoja = (x, z) => x > 1.7 && x < 2.05 && Math.abs(z) < 0.85;
  let x = 0, z = 0;
  for (let i = 0; i < 24; i++) {
    const m = deslizarJugador(x, z, 0.3, 0, hoja);
    x = m.x; z = m.z;
  }
  assert.ok(x <= 1.7, `entró con la puerta cerrada: x=${x}`);

  const marco = (px, pz) => px > 1.7 && px < 2.05 && Math.abs(pz) >= 0.7 && Math.abs(pz) < 1.6;
  x = 0; z = 0;
  for (let i = 0; i < 20; i++) {
    const m = deslizarJugador(x, z, 0.3, 0, marco);
    x = m.x; z = m.z;
  }
  assert.ok(x > 2.05, `no cruzó el vano: x=${x}`);
});

test('el paso no teletransporta', () => {
  const libre = deslizarJugador(1, 2, 0.5, -0.3, () => false);
  assert.ok(Math.abs(libre.x - 1.5) < 1e-9 && Math.abs(libre.z - 1.7) < 1e-9);
  const caja = (x, z) => Math.abs(x) < 3 && Math.abs(z) < 3;
  const quieto = deslizarJugador(0, 0, -0.2, 0, caja);
  assert.equal(quieto.x, 0, 'desde el centro no debe aparecer afuera');
  const sale = deslizarJugador(-2.85, 0, -0.4, 0, caja);
  cabeEnElPaso(-2.85, 0, sale.x, sale.z, -0.4, 0);
  assert.ok(sale.x < -3, `no cruzó el borde en un paso: x=${sale.x}`);
});

test('el aire, el pasto y el humo no están en el choque del jugador', () => {
  assert.match(html, /deslizarJugador\(/);
  assert.match(html, /jugador-solido\.js\?v=1/);
  assert.match(html, /function jugadorOcupado\(/);
  assert.match(html, /const MUEBLE_SOLIDO = \{/);
  assert.match(html, /window: \[2\.6, 0\.28/);
  assert.doesNotMatch(html, /if \(Math\.abs\(px\) < Math\.abs\(pz\)\) p\.x \+= px/);
  assert.match(sw, /const VERSION = 'tim-v136'/);
  assert.match(sw, /jugador-solido\.js\?v=1/);
  assert.match(sw, /npc-solido\.js\?v=1/);
});
