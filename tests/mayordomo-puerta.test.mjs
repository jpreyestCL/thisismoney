import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const position = { x: 0, y: 0, z: 0, copy(p) { Object.assign(this, { x: p.x, y: p.y, z: p.z }); }, set(x, y, z) { Object.assign(this, { x, y, z }); } };
const butler = { position, rotation: { y: 0 }, userData: { task: 'idle', order: null, hired: true }, visible: true };
const state = { running: true, planet: 'tierra', money: 5000, totalEarned: 0, inv: { food: 0 }, creative: false };
let answer = '';
const pasos = [];
function pieza(key, x, z, rot) {
  return { key, hp: 100, open: false, hinge: { rotation: { y: 0 } }, mesh: { position: { x, y: 0, z }, rotation: { y: rot || 0 } } };
}
const casa = [
  pieza('wallWood', 0, -2, 0),
  pieza('wallWood', -2, 0, Math.PI / 2),
  pieza('wallWood', 2, 0, Math.PI / 2),
  pieza('wallDoor', 0, 2, 0),
  pieza('door', 0, 2, 0)
];
const puerta = casa[4];
const context = vm.createContext({
  butler, state, player: { position: { x: 0, y: 0, z: 4 } },
  platusKeepers: [], countryKeepers: [], effectivePrice: i => i.price, typing: false,
  BUTLER_HOME: { x: 0, z: 0 }, BUTLER_SUPER: { x: 0, z: -28 }, butlerSpaceTaps: [],
  mountainHeightAt: () => 0, releaseLock() {}, prompt: () => answer, toast() {}, saveGame() {}, tone() {}, setTimeout() {}, swingLimbs() {},
  dist2D: (a, b) => Math.hypot(a.x - b.x, a.z - b.z), placed: casa, obstacles: [], puedeComprarRopa: () => false,
  setDoorOpen(o, abierta) { o.open = !!abierta; },
  moveToward(e, t, step) {
    const d = Math.hypot(t.x - e.position.x, t.z - e.position.z) || 1;
    const s = Math.min(Math.max(0, step), d);
    e.position.x += (t.x - e.position.x) / d * s;
    e.position.z += (t.z - e.position.z) / d * s;
    pasos.push({ x: e.position.x, z: e.position.z, abierto: puerta.open });
  }
});
vm.runInContext(html.slice(html.indexOf('const STORE_A ='), html.indexOf('// Mayordomo:')), context);
vm.runInContext(html.slice(html.indexOf('const STORE_B'), html.indexOf('// Dibuja un producto')), context);
vm.runInContext(html.slice(html.indexOf('function normalizeButlerText'), html.indexOf('function payButlerWeeklyWage')), context);
const run = code => vm.runInContext(code, context);
const order = text => { answer = text; run('requestButlerOrder()'); };

assert.equal(run('mayordomoChocaMuro(0, -2, piezasDelMayordomo({x:0,z:0},{x:0,z:0}).find(p => p.key === "wallWood"), 0.34)'), true, 'la pared de atrás tapa');
assert.equal(run('mayordomoChocaMuro(0, 0, piezasDelMayordomo({x:0,z:0},{x:0,z:0}).find(p => p.key === "wallWood"), 0.34)'), false, 'el centro de la casa está libre');
assert.equal(run('mayordomoEnVano(0, 2, piezasDelMayordomo({x:0,z:0},{x:0,z:0}).find(p => p.key === "door"))'), true, 'el vano es el hueco de la puerta');

order('compra comida');
assert.equal(butler.userData.task, 'toStore');
assert.equal(puerta.open, false, 'la puerta sigue cerrada hasta que llega');

const camino = run('caminoDelMayordomo(butler.position, butlerDestination())');
assert.ok(camino.length >= 2, 'el pedido arma un rumbo');
const muestras = [];
for (let i = 1; i < camino.length; i++) {
  const a = camino[i - 1], b = camino[i];
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.15));
  for (let k = 0; k <= n; k++) muestras.push({ x: a.x + (b.x - a.x) * k / n, z: a.z + (b.z - a.z) * k / n });
}
context.muestras = muestras;
const porPuerta = run('muestras.some(p => mayordomoEnVano(p.x, p.z, piezasDelMayordomo({x:0,z:0},{x:0,z:-28}).find(d => d.key === "door")))');
const porMuro = run('muestras.some(p => piezasDelMayordomo({x:0,z:0},{x:0,z:-28}).filter(m => m.muro).some(m => mayordomoChocaMuro(p.x, p.z, m, 0.45)))');
assert.equal(porPuerta, true, 'al pedirle algo, el camino pasa por la puerta');
assert.equal(porMuro, false, 'el camino no atraviesa la pared');
assert.ok(camino.some(p => p.puerta), 'el rumbo marca la puerta para abrirla');

for (let i = 0; i < 90; i++) run('updateButler(.05)');
assert.equal(puerta.open, true, 'abre la puerta cerrada antes de salir');
assert.ok(pasos.some(p => p.z > 2.15 && Math.abs(p.x) < 0.85), 'sale por el vano, hacia afuera');
assert.ok(pasos.some(p => p.z > 1.15 && p.z < 2.7 && Math.abs(p.x) < 0.7), 'los pasos cruzan el vano');
context.pasos = pasos;
const pisa = run('pasos.some(p => piezasDelMayordomo({x:0,z:0},{x:0,z:-28}).filter(m => m.muro).some(m => mayordomoChocaMuro(p.x, p.z, m, 0.45)))');
assert.equal(pisa, false, 'al caminar no atraviesa la pared');
console.log('mayordomo puerta: ok');
