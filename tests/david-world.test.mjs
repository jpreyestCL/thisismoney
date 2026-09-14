import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /function davidRestoredSave\(/);
assert.match(html, /function ensureDavidWorld\(/);
assert.match(html, /profileKey\('David'\)/);
assert.match(html, /money: 20000/);
assert.match(html, /planet: 'platus'/);
assert.match(html, /meleeName: 'Espada obsidiana'/);
assert.match(html, /armorFactor: 0\.3/);
assert.match(html, /hasBow: true/);
assert.match(html, /weaponName: 'Arco y flechas'/);
assert.match(html, /function isDavidAccount\(/);
assert.match(html, /function davidKeyOk\(/);
assert.match(html, /function openDavidLockBox\(/);
assert.match(html, /function enterSavedProfile\(/);
assert.match(html, /DAVID_GATE_KEY = '5757'/);
assert.match(html, /Esa cuenta está reservada/);
assert.match(html, /La cuenta David pide clave/);
assert.match(html, /ensureDavidWorld\(\)/);
assert.doesNotMatch(html, /setProfile\('David'\);   \/\/ queda en tu cuenta David/);
assert.match(html, /miners: \[/);
assert.match(html, /crop: 'apple', grow: 1, produce: 3/);
assert.match(html, /for \(let i = 0; i < 8; i\+\+\) for \(let j = 0; j < 6; j\+\+\)/);
assert.match(sw, /tim-v35/);

console.log('david restored world: ok');
