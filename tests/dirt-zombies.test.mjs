import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /userData\.dirtZombie = true/);
assert.match(html, /function dirtZombiesAlive\(/);
assert.match(html, /function updateDirtZombies\(/);
assert.match(html, /function tryCombatStrike\(/);
assert.match(html, /function hostileInStrikeRange\(/);
assert.match(html, /updateDirtZombies\(dt\)/);
assert.match(html, /tryCombatStrike\(power\)/);
assert.match(html, /dirtZombiesAlive\(\)/);
assert.match(html, /Pégale ya/);
assert.match(html, /z\.userData\.attackCd = 0/);
assert.match(sw, /tim-v56/);

console.log('dirt zombies: ok');
