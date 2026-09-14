import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /id: 'futbol', name: 'Fútbol Champions'/);
assert.match(html, /function startFutbol\(game\)/);
assert.match(html, /showMiniHud\('⚽ Fútbol Champions'/);
assert.match(html, /Primero en llegar a 3 goles/);

assert.match(html, /function gpOnAsphalt\(/);
assert.match(html, /function gpOvalPoint\(/);
assert.match(html, /function drawMiniCar\(/);
assert.match(html, /function startGranPrix\(game\)/);
assert.match(html, /const bots = \[/);
assert.match(html, /W acelera, S frena, A\/D gira, ESPACIO turbo/);
assert.match(html, /gpOnAsphalt\(s\.x, s\.y\)/);
assert.match(html, /s\.boostCd <= 0/);
assert.match(html, /drawMiniCar\(ctx, s\.x, s\.y, s\.heading/);

assert.match(html, /function startHeroes\(game\)/);
assert.match(html, /lives: 3/);
assert.match(html, /s\.flag/);
assert.match(html, /s\.coins >= 4/);
assert.match(html, /s\.coyote/);
assert.match(html, /Junta 4 monedas para izar la bandera/);
assert.match(html, /Te quedaste sin vidas/);
assert.match(html, /Caíste al vacío/);
assert.match(html, /Pisa enemigos desde arriba/);
assert.doesNotMatch(html, /Gemas ' \+ s\.gems \+ '\/3'/);

assert.match(sw, /tim-v40/);
console.log('play games granprix and heroes: ok');
