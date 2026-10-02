import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /function skiReadySpots\(\)/);
assert.match(html, /function toggleSkiing\(on, msg\)/);
assert.match(html, /function nearSkiLiftBoarding\(\)/);
assert.match(html, /const topZ = base\.z - distance, zOut = topZ \+ 4/);
assert.match(html, /state\.skiing = false; stopSkiCarve\(\); faceSkiDownhill\(\)/);
assert.match(html, /toast\('🏔️ Zona plana · camina o pulsa E para bajar la pista'\)/);
assert.match(html, /else if \(nextSnow > 40\) \{\s*toggleSkiing\(true\)/);
assert.doesNotMatch(html, /const zOut = \(base\.z - distance\) \+ 26/);
assert.doesNotMatch(html, /toggleSkiing\(true, '🏔️ Zona plana · ya puedes bajar la pista/);
assert.doesNotMatch(html, /No puedes subir con los esquís puestos · usa un andarivel o el arrastre'\);\s*\n\s*\}/);
assert.match(html, /Largar \/ esquiar ahora/);
// El cerro nevado se ve desde lejos: silueta sin niebla que cabe dentro de camera.far.
assert.match(html, /function updateSkiFar\(dt\)/);
assert.match(html, /function hideSkiFogged\(dt\)/);
assert.match(html, /fog: false, depthWrite: false/);
assert.match(html, /camera\.far \* \.9 \/ \(dc \+ SKI_RESORT\.r \* 1\.9\)/);
assert.match(html, /skiResortGroup\.visible = skiRealNear\(\)/);
assert.match(html, /\n  updateSkiFar\(dt\);/);
// La bruma depende de la distancia y el cerro de verdad no se borra con la niebla común.
assert.match(html, /function skiHaze\(dist\)/);
assert.match(html, /skiRealMountain\.material\.fog = false/);
assert.match(html, /lerp\(scene\.fog\.color, \.08 \+ haze \* \.3\)/);
console.log('ski summit launch: ok');
