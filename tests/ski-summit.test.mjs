import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /function skiReadySpots\(\)/);
assert.match(html, /function toggleSkiing\(on, msg\)/);
assert.match(html, /function nearSkiLiftBoarding\(\)/);
assert.match(html, /const zOut = \(base\.z - distance\) \+ 26/);
assert.match(html, /toggleSkiing\(true, '🏔️ Zona plana · ya puedes bajar la pista/);
assert.match(html, /else if \(nextSnow > 40\) \{\s*toggleSkiing\(true\)/);
assert.doesNotMatch(html, /No puedes subir con los esquís puestos · usa un andarivel o el arrastre'\);\s*\n\s*\}/);
assert.match(html, /Largar \/ esquiar ahora/);
console.log('ski summit launch: ok');
