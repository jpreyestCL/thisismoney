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
assert.match(html, /z\.userData\.speed = 0\.86/);
assert.doesNotMatch(html, /speed \*= 1\.55/);
assert.match(html, /if \(combatIsActive\(\)\) attack\(power \|\| 1\)/);
assert.match(html, /function combatIsActive\(\) \{ return state\.phase === 'NIGHT' \|\| state\.inCastle \|\| state\.inArena \|\| dirtZombiesAlive\(\); \}/);

assert.match(html, /zombie:\s*\{[^}]*spd: s => 0\.78 \+ s \* 0\.05/);
assert.match(html, /zombieArmored:\s*\{[^}]*spd: s => 0\.68 \+ s \* 0\.04/);
assert.match(html, /smart:\s*\{[^}]*spd: s => 0\.82 \+ s \* 0\.045/);
assert.match(html, /smartArmored:\s*\{[^}]*spd: s => 0\.72 \+ s \* 0\.04/);
assert.match(html, /bomber:\s*\{[^}]*spd: \(\) => 0\.95/);

const spdMatch = html.match(/zombie:\s*\{[^}]*spd: s => ([^,\n]+)/);
assert.ok(spdMatch, 'zombie spd formula missing');
const z = new Function('s', 'return ' + spdMatch[1]);
assert.ok(z(1) < 1.1, 'stage 1 zombie should shamble, got ' + z(1));
assert.ok(z(10) < 1.5, 'stage 10 zombie should stay slow, got ' + z(10));
assert.ok(z(20) < 2.0, 'late-game zombie should not sprint, got ' + z(20));
assert.ok(z(20) < 2.4, 'zombies must stay below scout-run threshold');

assert.match(sw, /tim-v46/);

console.log('dirt zombies: ok');
