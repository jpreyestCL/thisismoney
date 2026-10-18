// Bajo un techo no cae lluvia ni nieve. Al escampar quedan charcos al aire
// libre. La nieve se queda en el suelo descubierto y sobre los techos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { avanzarPrecipitacion, charcosTrasLluvia, quedaNieve, techoEn } from '../src/clima-techo.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const techos = [
  { x: 0, z: 0, w: 8, d: 8, y: 3.2 },
  { x: 0, z: -203, w: 91, d: 39, y: 7.3 },
  { x: 130, z: -17, w: 20, d: 12, y: 6.4 },
];

function caerHastaElPiso(x, z, dy) {
  let y = 14;
  for (let i = 0; i < 50; i++) {
    const p = avanzarPrecipitacion(techos, { x, y, z }, dy);
    assert.equal(p.cae, true, 'un copo del cielo dejó de caer antes de tocar');
    assert.ok(p.y >= techoEn(techos, x, z) - 1e-6, 'la precipitación atravesó la cubierta');
    if (p.impacto) return p;
    y = p.y;
  }
  assert.fail('no llegó a tocar nada');
}

test('bajo un techo no cae lluvia ni nieve', () => {
  const interiores = [
    ['casa', 0.4, -0.6],
    ['mall', 3, -198],
    ['banco', 130, -17],
  ];
  for (const [nombre, x, z] of interiores) {
    const lluvia = avanzarPrecipitacion(techos, { x, y: 1.5, z }, 0.7);
    const nieve = avanzarPrecipitacion(techos, { x, y: 1.1, z }, 0.3);
    assert.equal(lluvia.cae, false, nombre + ': la lluvia entra');
    assert.equal(lluvia.bajoTecho, true, nombre);
    assert.equal(nieve.cae, false, nombre + ': la nieve entra');
    assert.equal(quedaNieve(techos, [{ x, y: 1.1, z }]).length, 0, nombre + ': la nieve se acumula adentro');
    const golpe = caerHastaElPiso(x, z, 0.45);
    assert.equal(golpe.donde, 'techo', nombre + ': no se detuvo en el techo');
    assert.ok(golpe.y >= techoEn(techos, x, z) - 1e-6);
  }
});

test('al terminar la lluvia hay charcos y no quedan dentro de la casa', () => {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const charcos = charcosTrasLluvia([{ x: 0, z: 0, w: 10, d: 10, y: 3.2 }], { x: 0.5, z: -0.4 }, rnd);
  assert.ok(charcos.length >= 4, 'escampó y casi no quedaron charcos');
  for (const c of charcos) {
    assert.equal(techoEn([{ x: 0, z: 0, w: 10, d: 10, y: 3.2 }], c.x, c.z), 0, 'hay un charco bajo techo');
    assert.ok(c.y < 0.2 && c.y >= 0);
  }
});

test('la nieve queda en el suelo descubierto y en el techo, no adentro', () => {
  const suelo = caerHastaElPiso(18, 6, 0.5);
  assert.equal(suelo.donde, 'suelo');
  const queda = quedaNieve(techos, [suelo, { x: 0, y: 3.2, z: 0 }, { x: 0.2, y: 1, z: 0.2 }]);
  assert.equal(queda.length, 2, 'se coló nieve del interior');
  const enSuelo = queda.find(n => n.donde === 'suelo');
  const enTecho = queda.find(n => n.donde === 'techo');
  assert.ok(enSuelo, 'no quedó nieve en el suelo descubierto');
  assert.equal(enSuelo.y, 0);
  assert.equal(techoEn(techos, enSuelo.x, enSuelo.z), 0);
  assert.ok(enTecho && enTecho.y >= 3.2, 'la nieve no se quedó sobre el techo');
});

test('el juego usa estas reglas en la lluvia y en la nieve', () => {
  assert.match(html, /from '\.\/src\/clima-techo\.js\?v=1'/);
  assert.match(html, /avanzarPrecipitacion\(techos,/);
  assert.match(html, /charcosTrasLluvia\(techos,/);
  assert.match(html, /quedaNieve\(techos,/);
  assert.match(html, /state\.weather === 'snow'/);
  assert.doesNotMatch(html, /rainObj\.visible = !bajoTecho\(\)/);
});
