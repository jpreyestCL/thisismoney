// El banco y la cárcel son edificios en los que se ENTRA: paredes huecas con hueco
// de puerta, gente adentro (la cajera / presos y guardias) y nada encima de la calle.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DISTRITOS, LUGARES, callesDelMapa, distritoEn, enCalle, rectCalle, rectDistrito, seCruzan } from '../src/city-map.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Mismas medidas que en index.html (BANK / JAIL). Si allá cambian, aquí también.
const BANCO = { x: LUGARES.banco.x, z: LUGARES.banco.z, w: 20, d: 11 };
const CARCEL = { x: LUGARES.carcel.x, z: LUGARES.carcel.z, w: 37, d: 35 };
const rect = (b, mx = 0, mz = mx) => ({
  minX: b.x - b.w / 2 - mx, maxX: b.x + b.w / 2 + mx,
  minZ: b.z - b.d / 2 - mz, maxZ: b.z + b.d / 2 + mz,
});

test('el banco y la cárcel caben en su manzana y no pisan la calle', () => {
  for (const [nombre, edificio, distritoId] of [['banco', BANCO, 'banco'], ['cárcel', CARCEL, 'carcel']]) {
    const r = rect(edificio, 1, 2);   // margen: cornisa a los lados, columnas/portón al frente
    const limite = rectDistrito(DISTRITOS.find(d => d.id === distritoId));
    assert.ok(r.minX >= limite.minX && r.maxX <= limite.maxX, `el ${nombre} se sale de su manzana en x`);
    assert.ok(r.minZ >= limite.minZ && r.maxZ <= limite.maxZ, `el ${nombre} se sale de su manzana en z`);
    for (const calle of callesDelMapa()) {
      assert.ok(!seCruzan(rectCalle(calle), rect(edificio)), `el ${nombre} se monta sobre ${calle.id}`);
    }
  }
});

test('el banco y el súper ya no se pisan', () => {
  const SUPER = { x: LUGARES.super.x, z: LUGARES.super.z, w: 23, d: 23 };   // makeStore: hw = hd = 11 + alero
  assert.ok(!seCruzan(rect(BANCO), rect(SUPER)), 'el banco quedó encima del súper');
  // La puerta del súper mira al norte: el toldo y los carritos quedan delante.
  const entrada = { x: LUGARES.super.x, z: LUGARES.super.z + 11 + 6, w: 24, d: 12 };
  assert.ok(!seCruzan(rect(BANCO, 2, 3), rect(entrada)), 'el banco tapa la entrada del súper');
  assert.equal(distritoEn(LUGARES.super.x, LUGARES.super.z)?.id, 'comercial');
  assert.equal(distritoEn(LUGARES.banco.x, LUGARES.banco.z)?.id, 'banco');
  assert.ok(!enCalle(LUGARES.banco.x, LUGARES.banco.z));
});

test('la puerta del banco mira a la avenida y la cajera atiende adentro', () => {
  assert.match(html, /function buildBank\(\)/);
  assert.match(html, /BANK\.frente = BANK\.z \+ BANK\.d \/ 2/);        // la entrada da al norte
  assert.match(html, /let bankTeller = null/);
  assert.match(html, /bankTeller = makePerson\(/);
  assert.match(html, /sentarPersona\(bankTeller/);                    // sentada detrás del escritorio
  assert.match(html, /function bankDeskNear\(\)/);
  assert.match(html, /dist2D\(player\.position, bankTeller\.position\) < 4\.2/);
  assert.match(html, /const donde = bankDeskNear\(\)/);               // E abre la libreta de siempre
  assert.match(html, /Hablar con la cajera/);
  assert.match(html, /bankAtms\.push/);                               // y los cajeros de la fachada
  // La fachada es de banco de verdad: columnas, frontón con reloj, bóveda y cúpula.
  for (const pieza of [/BANCO CENTRAL/, /BOVEDA/, /Columnas acanaladas/, /Frontón escalonado/, /Torre del reloj/]) {
    assert.match(html, pieza);
  }
});

test('la cárcel se puede recorrer: muro, patio, celdas, presos y guardias', () => {
  assert.match(html, /function buildJail\(\)/);
  assert.match(html, /function makePrisoner\(/);
  assert.match(html, /function makeGuard\(/);
  assert.match(html, /makePerson\(0xf97316/);      // uniforme naranja del preso
  assert.match(html, /makePerson\(0x1e3a8a/);      // uniforme azul del guardia
  assert.match(html, /PENAL LA ROCA/);
  assert.match(html, /PABELLON A/);
  assert.match(html, /function edifRejas\(/);      // barrotes de celdas y ventanas
  assert.match(html, /const jailFolk = \[\]/);
  assert.match(html, /function updateJailFolk\(dt\)/);
  assert.match(html, /updateJailFolk\(dt\);/);     // enganchado en el bucle
  assert.match(html, /const JAIL_GATE = /);
  assert.match(html, /p\.position\.set\(JAIL_GATE\.x/);   // los pacos salen por el portón, no dentro del muro
});

test('los dos edificios se construyen dentro del mundo de la Tierra', () => {
  const abre = html.indexOf('const _preEarthChildren');
  const cierra = html.indexOf('scene.children.forEach(o => { if (!_preEarthChildren.has(o)) earthMeshes.push(o); })');
  const llamadas = html.indexOf('buildBank();\nbuildJail();');
  assert.ok(abre > 0 && cierra > abre, 'no encontré las marcas del mundo terrestre');
  assert.ok(llamadas > abre && llamadas < cierra, 'el banco y la cárcel tienen que ocultarse al viajar de planeta');
});

test('el súper reparte TODOS sus productos en góndolas (ninguno queda en la calle)', () => {
  assert.match(html, /const filas = Math\.max\(1, Math\.ceil\(items\.length \/ cols\.length\)\)/);
  assert.doesNotMatch(html, /const rows = \[cz - 6, cz, cz \+ 6\]/);
});
