import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /function makeBull\(/);
assert.match(html, /toro con cuerpo redondo, 4 patas y cuernos/);
assert.match(html, /CylinderGeometry\(\.08, \.12, \.78, 6\)/);
assert.match(html, /const earthBulls = \[\]/);
assert.match(html, /function spawnEarthBullHerd\(/);
assert.match(html, /spots = \[\[46, 52\], \[56, 46\], \[64, 58\], \[50, 66\], \[58, 38\]\]/);
assert.match(html, /function updateEarthBulls\(/);
assert.match(html, /for \(let i = 0; i < 5; i\+\+\)/);
assert.match(html, /cinco toros en abanico/);
assert.match(html, /ud\.bullCd = 8/);
assert.match(html, /updateEarthBulls\(dt\)/);
assert.match(sw, /tim-v30/);

console.log('earth bulls: ok');
