import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /function livingRadius\(/);
assert.match(html, /function bodyIgnoresWalls\(/);
assert.match(html, /function obstacleAt\(/);
assert.match(html, /function resolveLivingWall\(/);
assert.match(html, /function placedBarrierNear\(/);
assert.match(html, /resolveLivingWall\(e\.position, px, pz, livingRadius\(e\)\)/);
assert.match(html, /Math\.ceil\(Math\.abs\(step\) \/ 0\.32\)/);
assert.match(html, /resolveCollisions\(\);/);
assert.match(html, /if \(resolveLivingWall\(b\.position, px, pz, 0\.8\) === 'stop'\)/);
assert.doesNotMatch(html, /if \(e\.userData\.type === 'bull'\) continue;/);

console.log('living wall collisions: ok');
