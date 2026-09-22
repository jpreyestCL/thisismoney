import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /const billboards = \[\]/);
assert.match(html, /function trackBillboard\(/);
assert.match(html, /function updateBillboards\(dt\) \{\s*for \(let i = billboards\.length - 1/);
assert.doesNotMatch(html, /function updateBillboards\(dt\) \{\s*scene\.traverse/);
assert.match(html, /if \(document\.hidden\) return;/);
assert.match(html, /if \(!state\.running\) \{/);
assert.match(html, /function syncFarWorld\(/);
assert.match(html, /function nearSkiNow\(/);
assert.match(html, /if \(nearSkiNow\(\)\) updateSkiVisitors/);
assert.match(html, /if \(onEarth\) updateOceanExpedition/);
assert.match(html, /if \(onPlatus\) \{/);
assert.match(html, /preferLowPerf/);
assert.match(html, /antialias: !preferLowPerf/);
assert.match(html, /sun\.shadow\.mapSize\.set\(preferLowPerf \? 512 : 2048/);
assert.match(html, /const CELL = o\.cell \|\| \(o\.ski \? 4\.2 : 2\.8\)/);
assert.match(html, /im\.castShadow = false/);
assert.match(html, /oceanFxGroup/);
assert.match(html, /fps < 28/);
assert.match(html, /if \(fpsLento < 2\) return/);
assert.match(html, /light\.visible = false/);
assert.match(html, /shaftLight\.visible = false/);
assert.match(sw, /tim-v52/);

console.log('perf lod and startup: ok');
