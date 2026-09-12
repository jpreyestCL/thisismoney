import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /function buildIslandTemple\(/);
assert.match(html, /function worldWestLimit\(\)/);
assert.match(html, /function noteIslandArrival\(/);
assert.match(html, /function syncIslandSurfaceDecor\(\)/);
assert.match(html, /Se abrió el piso de lava/);
assert.match(html, /islandShade \? \.78/);
assert.match(html, /Llegaste volando a la ISLA DEL TESORO/);
assert.match(html, /wasIsland \? TREASURE_ISLAND\.surface/);
assert.match(html, /islandTempleAt\(player\.position\.x, player\.position\.z\)/);
assert.doesNotMatch(html, /copas densas y oscuras/);
console.log('island temples: ok');
