import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /let buildScale = \{ x: 1, y: 1, z: 1 \}/);
assert.match(html, /function resizeBuild\(kind, delta\)/);
assert.match(html, /function resetBuildScale\(\)/);
assert.match(html, /const stackY = \(topWall\.baseY \|\| 0\) \+ 3 \* \(topWall\.scale\?\.y \|\| 1\)/);
assert.match(html, /if \(wallSnap\.stackY != null\) by = wallSnap\.stackY/);
assert.match(html, /bottom: by, top: by \+ 3 \* sc\.y/);
assert.match(html, /id="scalePlusBtn"/);
assert.match(html, /id="thickPlusBtn"/);
assert.match(html, /data-act="scalePlus"/);
assert.match(html, /data-act="thickPlus"/);
assert.match(html, /data-build-action="scalePlus"/);
assert.match(html, /data-build-action="thickPlus"/);
assert.match(html, /scale: o\.scale \|\| null/);
console.log('building stack and sizing: ok');
