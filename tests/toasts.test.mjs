import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /Avisos del juego: a un LADO/);
assert.match(html, /#toast \{ position: absolute; top: auto; left: auto; right: 14px; bottom: 26%/);
assert.doesNotMatch(html, /#toast \{ position: absolute; top: 50%; left: 50%; transform: translate\(-50%,-50%\)/);
assert.match(html, /#toastStack \{ position: absolute; top: auto; left: auto; right: 14px/);
assert.match(html, /#phase \{ position: absolute; top: auto; left: auto; right: 14px/);
assert.match(html, /#combo \{ position:absolute; top:auto; left:auto; right:14px/);
assert.match(html, /#fuelWarning \{ position:absolute; left:auto; right:14px/);
assert.match(html, /#escape \{ position:absolute; top:auto; left:auto; right:14px/);
assert.match(sw, /tim-v56/);

console.log('side toasts: ok');
