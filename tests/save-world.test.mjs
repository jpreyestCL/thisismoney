import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /function restoreWorldClock\(/);
assert.match(html, /function applyWeatherState\(/);
assert.match(html, /function snapSkyNow\(/);
assert.match(html, /function snapshotNightEnemies\(/);
assert.match(html, /phase: state\.phase === 'NIGHT' \? 'NIGHT' : 'DAY'/);
assert.match(html, /nightTime: state\.nightTime \|\| 0/);
assert.match(html, /weather: state\.weather \|\| 'clear'/);
assert.match(html, /eclipse: state\.eclipse \|\| 0/);
assert.match(html, /eclipseTimer: eclipseTimer/);
assert.match(html, /nightEnemies: state\.phase === 'NIGHT'/);
assert.match(html, /restoreWorldClock, applyWeatherState, startEclipse/);
assert.match(html, /d\.phase === 'NIGHT' \? 'NIGHT' : 'DAY'/);
assert.match(html, /startEclipse\(left, opts\)/);
assert.match(html, /startEclipse\(\+d\.eclipse, \{ silent: true \}\)/);
assert.match(html, /sigue de noche/);
assert.doesNotMatch(html, /el clima no se guarda/);
assert.match(html, /el clima no viaja contigo/);
assert.match(sw, /tim-v49/);

console.log('save world clock: ok');
