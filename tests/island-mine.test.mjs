import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /function islandMineLayout\(/);
assert.match(html, /function renderIslandMineTunnels\(/);
assert.match(html, /function islandMineCellOk\(/);
assert.match(html, /const ISLAND_MINE_ROOM_H = 4\.6/);
assert.match(html, /SALA DE ORO/);
assert.match(html, /Mina enorme/);
assert.match(html, /túneles con antorchas/);
assert.match(html, /MINA GRANDE/);
assert.match(html, /stampMineInstanced/);
assert.match(html, /new THREE\.InstancedMesh/);
assert.match(html, /mineTorchStickGeo/);
assert.match(html, /h\.islandMine \? \(dx < ISLAND_MINE_SHAFT && dz < ISLAND_MINE_SHAFT\)/);
assert.match(html, /const ISLAND_MINE_SHAFT = MINE_CELL \* 1\.48/);
assert.match(html, /const ISLAND_MINE_EXIT = 9/);
assert.match(html, /function islandMineExitSpot\(/);
assert.match(html, /function tryShelter\(/);
assert.match(html, /oreY=mineFloorY\(h\)\+\.7/);
assert.match(html, /rooms: layout\.rooms/);
assert.doesNotMatch(html, /for\(let x=-3;x<=3;x\+\+\)for\(let z=-3;z<=3;z\+\+\)cells\.push/);

function extractFunction(src, name) {
  const start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, 'falta ' + name);
  let i = src.indexOf('{', start), depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error('función sin cerrar: ' + name);
}

const TREASURE_ISLAND = { x: -1060, z: -155, w: 440, d: 400, surface: .72 };
const MINE_CELL = 3;
const ISLAND_MINE_SPOTS = [[-155, -55], [-80, 70], [80, 105], [145, -25], [25, -120], [-180, 150]];
const ISLAND_MINE_ROOM_NAMES = ['SALA DE ORO', 'SALA DE GEMAS', 'CÁMARA OCULTA', 'POZO HONDO', 'SALA DEL REY', 'DEPÓSITO', 'CÁMARA RARA', 'CRUCE HONDO'];
function inTreasureIsland(x, z) {
  return Math.abs(x - TREASURE_ISLAND.x) < TREASURE_ISLAND.w * .48 && Math.abs(z - TREASURE_ISLAND.z) < TREASURE_ISLAND.d * .46;
}
function tunnelKey(x, z) { return x + ',' + z; }

const ctx = { TREASURE_ISLAND, MINE_CELL, ISLAND_MINE_SPOTS, ISLAND_MINE_ROOM_NAMES, inTreasureIsland, tunnelKey };
const okFn = extractFunction(html, 'islandMineCellOk');
const layoutFn = extractFunction(html, 'islandMineLayout');
const fn = new Function('TREASURE_ISLAND', 'MINE_CELL', 'ISLAND_MINE_SPOTS', 'ISLAND_MINE_ROOM_NAMES', 'inTreasureIsland', 'tunnelKey',
  okFn + '\n' + layoutFn + '\nreturn { islandMineCellOk, islandMineLayout };');
const { islandMineLayout } = fn(TREASURE_ISLAND, MINE_CELL, ISLAND_MINE_SPOTS, ISLAND_MINE_ROOM_NAMES, inTreasureIsland, tunnelKey);

for (let i = 0; i < ISLAND_MINE_SPOTS.length; i++) {
  const [ox, oz] = ISLAND_MINE_SPOTS[i];
  const hx = TREASURE_ISLAND.x + ox, hz = TREASURE_ISLAND.z + oz;
  const layout = islandMineLayout(i * 19 + 7, hx, hz, i);
  assert.ok(layout.cells.length >= 180, 'la mina ' + i + ' debe ser mucho más grande que 7×7, tiene ' + layout.cells.length);
  assert.ok(layout.cells.length <= 520, 'la mina ' + i + ' no debe explotar de celdas: ' + layout.cells.length);
  assert.ok(layout.rooms.length >= 8, 'la mina ' + i + ' debe terminar en varias salas');
  const keys = new Set(layout.cells.map(([x, z]) => x + ',' + z));
  assert.ok(keys.has('0,0'), 'el pozo de entrada queda en el centro');
  for (const [cx, cz] of layout.cells) {
    assert.ok(inTreasureIsland(hx + cx * MINE_CELL, hz + cz * MINE_CELL), 'túnel fuera de la isla');
  }
  const hall = layout.cells.filter(([cx, cz]) => Math.abs(cx) <= 4 && Math.abs(cz) <= 4);
  assert.ok(hall.length >= 70, 'el hall de entrada debe ser amplio');
}

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
assert.match(sw, /tim-v32/);

const PLAYER_EYE = 1.7;
const ISLAND_MINE_SHAFT = MINE_CELL * 1.48;
const ISLAND_MINE_EXIT = 9;
const exitFn = extractFunction(html, 'islandMineExitSpot');
const exitFactory = new Function(
  'TREASURE_ISLAND', 'PLAYER_EYE', 'ISLAND_MINE_SHAFT', 'ISLAND_MINE_EXIT', 'inTreasureIsland',
  'let yaw = 0;\n' + exitFn + '\nreturn { islandMineExitSpot, setYaw(v) { yaw = v; } };'
);
const { islandMineExitSpot, setYaw } = exitFactory(TREASURE_ISLAND, PLAYER_EYE, ISLAND_MINE_SHAFT, ISLAND_MINE_EXIT, inTreasureIsland);

for (let i = 0; i < ISLAND_MINE_SPOTS.length; i++) {
  const hx = TREASURE_ISLAND.x + ISLAND_MINE_SPOTS[i][0];
  const hz = TREASURE_ISLAND.z + ISLAND_MINE_SPOTS[i][1];
  for (const facing of [0, 0.8, 1.6, 2.4, 3.2, 4.5, 5.5]) {
    setYaw(facing);
    const spot = islandMineExitSpot({ x: hx, z: hz });
    const dx = Math.abs(spot.x - hx), dz = Math.abs(spot.z - hz);
    assert.ok(!(dx < ISLAND_MINE_SHAFT && dz < ISLAND_MINE_SHAFT), 'la salida de la mina ' + i + ' sigue dentro del pozo');
    assert.ok(Math.hypot(spot.x - hx, spot.z - hz) + 1e-6 >= ISLAND_MINE_EXIT, 'la salida de la mina ' + i + ' no se alejó lo suficiente: ' + Math.hypot(spot.x - hx, spot.z - hz));
    assert.ok(inTreasureIsland(spot.x, spot.z), 'la salida de la mina ' + i + ' quedó fuera de la isla');
  }
}

console.log('island mine tunnels: ok');
