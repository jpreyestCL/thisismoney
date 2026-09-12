import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /function resolveMountainSolid\(pos, fromX, fromZ, fromY, eye\)/);
assert.match(html, /La montaña es SÓLIDA/);
assert.match(html, /resolveMountainSolid\(player\.position, fromX, fromZ, fromY, PLAYER_EYE\)/);
assert.match(html, /resolveMountainSolid\(car\.group\.position, prevX, prevZ, prevY, 1\.4\)/);
assert.match(html, /if \(pos\.y < fromY - \.02 && floorY <= fromY \+ 3\)/);
assert.match(html, /if \(state\.creative && creativeFlying\) \{ updateCreativeFlight\(dt\); return; \}/);
console.log('fly mountain solid: ok');
