import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /function livingIgnoresWater\(/);
assert.match(html, /function applyLivingY\(/);
assert.match(html, /function updateLivingWater\(/);
assert.match(html, /updateLivingWater\(dt\)/);
assert.match(html, /se hunden como el jugador/);
assert.match(html, /else if \(!waterZoneAt\(e\.position\.x, e\.position\.z\) \|\| livingIgnoresWater\(e\)\)/);
assert.match(html, /e\.position\.y \+ \(ud\.barY \|\| 2\.6\)/);
assert.match(html, /updateLivingWater\(step\)/);
assert.doesNotMatch(html, /e\.position\.y = mountainHeightAt\(e\.position\.x, e\.position\.z\);/);
assert.doesNotMatch(html, /n\.position\.set\(nx, mountainHeightAt\(nx, nz\), nz\)/);
assert.match(sw, /tim-v48/);

console.log('living water sink: ok');
