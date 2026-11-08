import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const ini = html.indexOf('const COL_MAX_FOTOS'), fin = html.indexOf('// ---- fin de la lógica pura');
assert.ok(ini > 0 && fin > ini, 'bloque de colección encontrado');
const ctx = vm.createContext({ PLANETS: [{ name: 'PLATUS' }, { name: 'ZORVAX' }], state: {} });
vm.runInContext(html.slice(ini, fin) + '\nglobalThis.api = { JEFES, JEFE_TITAN, MASCOTAS, jefeDeLaNoche, jefeProximo, premioInfo, colLimpiar, colVacio, colNombreLimpio, colNivelAfecto, colEstado, SOMBREROS, ESPADAS, PINTURAS_JEFE, COL_MAX_FOTOS };', ctx);
const a = ctx.api;

// jefes: cada 5 noches, uno distinto, con revancha al terminar la lista
assert.equal(a.jefeDeLaNoche(4), null);
assert.equal(a.jefeDeLaNoche(0), null);
assert.equal(a.jefeDeLaNoche(5).jefe.id, 'colmillo');
assert.equal(a.jefeDeLaNoche(10).jefe.id, 'garrote');
assert.equal(a.jefeDeLaNoche(5 * a.JEFES.length).jefe.id, a.JEFES.at(-1).id);
assert.equal(a.jefeDeLaNoche(5 * a.JEFES.length + 5).jefe.id, 'colmillo');
assert.equal(a.jefeDeLaNoche(5 * a.JEFES.length + 5).vuelta, 1);
assert.equal(a.jefeProximo(7).noche, 10);
assert.equal(a.jefeProximo(7).jefe.id, 'garrote');
for (const j of a.JEFES.concat([a.JEFE_TITAN])) {
  const p = a.premioInfo(j.premio);
  assert.ok(p && p.nombre, 'premio válido para ' + j.id);
  assert.ok(j.nombre && j.apodo && j.pista, 'textos en español para ' + j.id);
}
assert.equal(new Set(a.JEFES.map(j => j.id)).size, a.JEFES.length);
assert.equal(new Set(a.JEFES.map(j => JSON.stringify(j.premio))).size, a.JEFES.length, 'cada premio es único');

// nombres y afecto
assert.ok(!/[<>&"']/.test(a.colNombreLimpio('<img onerror="x">', 'x')));
assert.ok(a.colNombreLimpio('abcdefghijklmnopqrstuvwxyz', 'x').length <= 12);
assert.equal(a.colNombreLimpio('   ', 'Pepe'), 'Pepe');
assert.equal(a.colNivelAfecto(0), 1);
assert.equal(a.colNivelAfecto(10), 2);
assert.equal(a.colNivelAfecto(9999), 5);

// el save nunca confía en el JSON
const vacio = a.colLimpiar(null);
assert.deepEqual(JSON.parse(JSON.stringify(vacio)), JSON.parse(JSON.stringify(a.colVacio())));
const foto = 'data:image/jpeg;base64,/9j/4AAQ';
const sucio = a.colLimpiar({
  mascotas: { gato: { nombre: '<script>', afecto: -50, comida: 900 }, dragon: { nombre: 'x' }, perro: { nombre: 'Rocky', afecto: 25 } },
  jefes: { colmillo: { veces: 2, noche: 5 }, inventado: { veces: 9 } },
  puesto: { sombrero: 'mago', espada: 'roble' },
  piedras: { PLATUS: true, MARTE: true },
  fotos: [{ img: 'javascript:alert(1)' }, { img: foto, t: 'x'.repeat(200), n: 3 }, ...Array.from({ length: 10 }, (_, i) => ({ img: foto, n: i }))],
  marco: 'dorado', fotoN: 5,
});
assert.ok(!sucio.mascotas.dragon);
assert.ok(!/[<>]/.test(sucio.mascotas.gato.nombre));
assert.equal(sucio.mascotas.gato.afecto, 0);
assert.equal(sucio.mascotas.gato.comida, 100);
assert.equal(sucio.mascotas.perro.truco, true, 'con cariño suficiente ya sabe su truco');
assert.deepEqual(Object.keys(sucio.jefes), ['colmillo']);
assert.equal(sucio.premios['sombrero:copa'], true);
assert.equal(sucio.puesto.sombrero, null, 'no puedes llevar un sombrero que no ganaste');
assert.equal(sucio.puesto.espada, null);
assert.deepEqual(Object.keys(sucio.piedras), ['PLATUS']);
assert.ok(sucio.fotos.length <= a.COL_MAX_FOTOS);
assert.ok(sucio.fotos.every(f => f.img.startsWith('data:image/jpeg')));
assert.ok(sucio.fotos[0].t.length <= 60);
const lleno = a.colLimpiar({ jefes: { pelusa: { veces: 1 } }, puesto: { sombrero: 'mago' } });
assert.equal(lleno.puesto.sombrero, 'mago');
// ida y vuelta por el save
assert.deepEqual(JSON.parse(JSON.stringify(a.colLimpiar(JSON.parse(JSON.stringify(sucio))))), JSON.parse(JSON.stringify(sucio)));
// miniaturas: el save entero cabe holgado en la nube (1,5 MB)
assert.ok(JSON.stringify(a.colLimpiar({ fotos: Array.from({ length: 6 }, (_, i) => ({ img: 'data:image/jpeg;base64,' + 'A'.repeat(12000), n: i })) })).length < 100000);
console.log('coleccion OK');
