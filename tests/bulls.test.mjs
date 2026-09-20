import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /function makeBull\(/);
assert.match(html, /toro con 4 patas, pezuñas y cuernos grandes/);
assert.match(html, /CylinderGeometry\(\.11, \.15, 1\.12, 6\)/);
assert.match(html, /function makeBullArmored\(/);
assert.match(html, /make: makeKnight,/);
assert.match(html, /make: makeKnightArmored/);
assert.match(html, /const earthBulls = \[\]/);
assert.match(html, /spots = \[\[16, 124\], \[30, 123\], \[40, 127\], \[21, 137\], \[36, 137\]\]/);   // potrero del norte, fuera del condominio
assert.match(html, /function updateEarthBulls\(/);
assert.match(html, /for \(let i = 0; i < 3; i\+\+\)/);
assert.match(html, /side = \(i - 1\) \* 3\.8/);
assert.match(html, /hp: 18, maxhp: 18, speed: 4\.3/);
assert.match(html, /ud\.bullCd = 16/);
assert.match(html, /data\.bullCd = 12/);
assert.match(html, /function resolveLivingWall\(/);
assert.match(html, /function obstacleAt\(/);
assert.match(html, /function placedBarrierNear\(/);
assert.doesNotMatch(html, /hp: 9999, speed: 16/);
assert.match(html, /updateEarthBulls\(dt\)/);
assert.match(sw, /tim-v50/);

console.log('earth bulls: ok');
