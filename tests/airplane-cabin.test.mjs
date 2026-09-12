import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /function flightSkin\(/);
assert.match(html, /function flightGlass\(/);
assert.match(html, /CABINA DE MANDO/);
assert.match(html, /parabrisas/);
assert.match(html, /g\.userData\.pilots/);
assert.match(html, /alas/);
assert.match(html, /CIELO ABIERTO/);
assert.match(html, /if \(state\.inFlight\) \{\s*const side = cameraMode === 1 \? 1 : -1/);
assert.match(html, /FLIGHT\.z - 11\.05/);
assert.match(html, /flight\.cockpitSeen/);
assert.match(html, /canvasWidth = 640|cv\.width = 640/);
console.log('airplane wings cockpit movie: ok');
