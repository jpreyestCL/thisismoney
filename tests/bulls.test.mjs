import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /function makeBull\(/);
assert.match(html, /toro con 4 patas, pezuñas y cuernos grandes/);
assert.match(html, /CylinderGeometry\(\.11, \.15, 1\.12, 6\)/);
assert.match(html, /function makeBullArmored\(/);
assert.match(html, /make: makeBull,/);
assert.match(html, /make: makeBullArmored/);
assert.match(html, /const earthBulls = \[\]/);
assert.match(html, /spots = \[\[30, 36\], \[12, 48\], \[-8, 34\], \[38, 8\], \[52, 28\]\]/);
assert.match(html, /function updateEarthBulls\(/);
assert.match(html, /for \(let i = 0; i < 5; i\+\+\)/);
assert.match(html, /side = \(i - 2\) \* 3\.8/);
assert.match(html, /updateEarthBulls\(dt\)/);
assert.match(sw, /tim-v33/);

console.log('earth bulls: ok');
