import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /function aboveWater\(zone, y\) \{ return !zone \|\| y > zone\.surface \+ PLAYER_EYE \+ \.55; \}/);
assert.match(html, /const swimming = !!zone && !aboveWater\(zone, player\.position\.y\)/);
assert.match(html, /const minY = zone\.bottom \+ \.35/);
assert.match(html, /const vertical = swimUp \? 5\.2 : \(swimDown \? -6\.2 : -3\.8\)/);
assert.match(html, /state\.underwater = player\.position\.y < zone\.surface/);
assert.match(html, /if \(flyWater\) minFlyY = Math\.max\(minFlyY, flyWater\.surface \+ PLAYER_EYE\)/);
assert.match(html, /const waterH = p\.surface - p\.bottom - \.18/);
assert.match(html, /mcFloor\(g, \(left \+ holeL\) \/ 2, cz, holeL - left, 60, 0x9fd3ea\)/);
assert.match(html, /const deep = 3\.2, tileMat = mat\(0xf8fafc\), wallMat = mat\(0x7dd3fc\)/);
assert.match(html, /obj\.poolZone = \{ surface: by \+ \.14, bottom: by - deep \}/);
assert.match(html, /Espacio sube · Ctrl se hunde · mira el vaso de la piscina/);
assert.doesNotMatch(html, /obj\.poolZone=\{surface:by\+\.55,bottom:by\}/);
console.log('water fall and pool dive: ok');
