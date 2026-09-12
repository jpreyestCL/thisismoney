import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /key: 'arco'/);
assert.match(html, /name: 'Arco y flechas'/);
assert.match(html, /bow: true/);
assert.match(html, /function makeVoxelBow\(/);
assert.match(html, /function makeArrowMesh\(/);
assert.match(html, /function shootBowArrow\(/);
assert.match(html, /function updatePlayerArrows\(/);
assert.match(html, /function updateBow\(/);
assert.match(html, /function startBowDraw\(/);
assert.match(html, /function releaseBow\(/);
assert.match(html, /function bowEquipped\(/);
assert.match(html, /n.includes\('arco'\) \? 'bow'/);
assert.match(html, /kind === 'bow' \? makeVoxelBow/);
assert.match(html, /id="bowcharge"/);
assert.match(html, /hasBow: false/);
assert.match(html, /hasBow: !!state\.hasBow/);
assert.match(html, /startBowDraw\('key'\)/);
assert.match(html, /bowDrawSrc === 'key'/);
assert.match(html, /ud\.vel\.y -= grav \* dt/);
assert.match(html, /speed = 16 \+ 38 \* power/);
assert.match(html, /mira hacia ARRIBA para llegar lejos/);
assert.match(html, /Mantén para tensar el arco/);
assert.match(html, /item\.bow \|\| item\.key === 'arco'/);
assert.match(html, /clearPlayerArrows\(\)/);
assert.doesNotMatch(html, /if \(e\.code === 'KeyE'\) \{ const alexaTarget=e\.shiftKey&&aimedFurniture\(\);if\(alexaTarget&&alexaTarget\.key==='alexa'\)\{useAlexaText\(alexaTarget\);return;\}if \(!tryRefuelCar/);
assert.match(sw, /tim-v23/);

console.log('bow and arrow: ok');
