// Las casas del barrio: que NINGUNA sea igual a la de al lado y que NINGUNA
// se atraviese con su vecina ni se salga de la manzana.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { CONDOMINIO, DISTRITOS, rectDistrito, rectLote, seCruzan } from '../src/city-map.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Sacamos del juego los planos y el repartidor de manzanas (no usan THREE):
// así la prueba corre el MISMO código que construye la ciudad.
const desde = html.indexOf('const HOUSE_WALLS = [');
const hasta = html.indexOf('// Techos con personalidad');
assert.ok(desde > 0 && hasta > desde, 'no encontré los planos de casa en index.html');
const sandbox = { Math };
vm.createContext(sandbox);
vm.runInContext(html.slice(desde, hasta) +
  '\nsalida = { HOUSE_PLANS, planDeCasa, repartirManzana };', sandbox);
const { HOUSE_PLANS, planDeCasa, repartirManzana } = sandbox.salida;

const caja = l => ({
  minX: l.x - l.plan.w / 2, maxX: l.x + l.plan.w / 2,
  minZ: l.z - l.plan.d / 2, maxZ: l.z + l.plan.d / 2,
});

test('hay hartos planos distintos y todos tienen medidas sensatas', () => {
  assert.ok(HOUSE_PLANS.length >= 8, 'muy pocas formas de casa');
  const techos = new Set(HOUSE_PLANS.map(p => p.techo));
  assert.ok(techos.size >= 4, 'los techos se repiten demasiado');
  const anchos = HOUSE_PLANS.flatMap(p => p.w);
  assert.ok(Math.min(...anchos) <= 5, 'falta alguna casa chica');
  assert.ok(Math.max(...anchos) >= 11, 'falta alguna casa grande');
  for (const p of HOUSE_PLANS) {
    assert.ok(p.w[0] < p.w[1] && p.d[0] < p.d[1], `${p.id} tiene medidas al revés`);
    assert.ok(p.peso > 0, `${p.id} nunca saldría sorteado`);
  }
});

test('el plano siempre cabe en el hueco que se le pide', () => {
  for (let i = 0; i < 400; i++) {
    const maxW = 4 + Math.random() * 12, maxD = 4 + Math.random() * 8;
    const plan = planDeCasa(maxW, maxD);
    if (!plan) continue;
    assert.ok(plan.w <= maxW + 1e-9, `un plano de ${plan.w} no cabe en ${maxW}`);
    assert.ok(plan.d <= maxD + 1e-9, `un plano de ${plan.d} no cabe en ${maxD}`);
  }
  assert.equal(planDeCasa(2, 2), null, 'en un hueco diminuto no debería caber ninguna casa');
});

test('en 200 barrios sorteados NINGUNA casa se atraviesa con otra', () => {
  const manzanas = DISTRITOS.filter(d => d.tipo === 'casas');
  assert.ok(manzanas.length >= 6, 'el mapa perdió los barrios');
  for (let vuelta = 0; vuelta < 200; vuelta++) {
    for (const d of manzanas) {
      const r = rectDistrito(d, -2.5);
      const fondoFila = Math.min(10.5, (r.maxZ - r.minZ) / 2 - 2.5);
      const lotes = repartirManzana(r, fondoFila);
      assert.ok(lotes.length >= 4, `la manzana ${d.id} quedó casi vacía (${lotes.length} casas)`);
      for (let i = 0; i < lotes.length; i++) {
        const a = caja(lotes[i]);
        assert.ok(a.minX >= r.minX - 1e-9 && a.maxX <= r.maxX + 1e-9, `una casa de ${d.id} se sale en x`);
        assert.ok(a.minZ >= r.minZ - 1e-9 && a.maxZ <= r.maxZ + 1e-9, `una casa de ${d.id} se sale en z`);
        for (let j = i + 1; j < lotes.length; j++) {
          assert.ok(!seCruzan(a, caja(lotes[j])), `dos casas de ${d.id} se atraviesan`);
        }
      }
    }
  }
});

test('un barrio tiene casas de varias formas y tamaños', () => {
  const d = DISTRITOS.find(o => o.id === 'barrioOesteNorte');
  const r = rectDistrito(d, -2.5);
  const formas = new Set(), anchos = [];
  for (let vuelta = 0; vuelta < 40; vuelta++) {
    for (const l of repartirManzana(r, 10.5)) { formas.add(l.plan.tipo); anchos.push(l.plan.w); }
  }
  assert.ok(formas.size >= 6, `salieron muy pocas formas distintas: ${[...formas]}`);
  assert.ok(Math.max(...anchos) - Math.min(...anchos) > 4, 'todas las casas terminaron del mismo porte');
});

test('la casa del vecino cabe dentro de su lote del condominio', () => {
  for (const l of CONDOMINIO.lotes.filter(o => !o.venta)) {
    const reja = rectLote(l, -.2);
    for (let i = 0; i < 200; i++) {
      const plan = planDeCasa(l.w - 1.2, l.d - 5);
      assert.ok(plan, `no cabe ninguna casa en el lote ${l.id}`);
      const norte = l.z > CONDOMINIO.pasaje.z;
      const frente = norte ? l.z - l.d / 2 : l.z + l.d / 2;
      const z = frente + (norte ? 1 : -1) * (plan.d / 2 + 1.6);
      const casa = { minX: l.x - plan.w / 2, maxX: l.x + plan.w / 2, minZ: z - plan.d / 2, maxZ: z + plan.d / 2 };
      assert.ok(casa.minX >= reja.minX && casa.maxX <= reja.maxX, `la casa de ${l.id} pasa la reja de al lado`);
      assert.ok(casa.minZ >= reja.minZ && casa.maxZ <= reja.maxZ, `la casa de ${l.id} se sale al pasaje`);
    }
  }
});

test('index.html usa los planos en el barrio y en el condominio', () => {
  assert.match(html, /function planDeCasa\(/);
  assert.match(html, /function repartirManzana\(/);
  assert.match(html, /const lotes = repartirManzana\(r, fondoFila\)/);
  assert.match(html, /function techoCasa\(/);
  assert.match(html, /const plan = planDeCasa\(l\.w - 1\.2, l\.d - 5\)/);   // vecinos del condominio
  assert.match(html, /const grupo = 'casa' \+ \(\+\+houseSerial\)/);        // cada casa tiene su propio grupo de choque
});
