import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /id="questBtn"/);
assert.match(html, /📋 Misiones/);
assert.match(html, /id="questbox"/);
assert.match(html, /id="keypadbox"/);
assert.match(html, /id="blackbox"/);
assert.match(html, /id="alleyfx"/);
assert.match(html, /data-act="missions"/);

assert.match(html, /const ALLEY = /);
assert.match(html, /code: '4815'/);
assert.match(html, /const BLACK_MARKET = /);
assert.match(html, /const STORY_QUESTS = /);
assert.match(html, /id: 'alley'/);
assert.match(html, /El callejón oscuro/);
assert.match(html, /function buildDarkAlley\(/);
assert.match(html, /function makeDumpster\(/);
assert.match(html, /function makeTito\(/);
assert.match(html, /function tryAlleyInteract\(/);
assert.match(html, /function tryAlleyCode\(/);
assert.match(html, /function openBlackMarket\(/);
assert.match(html, /function openQuestPanel\(/);
assert.match(html, /function applyBlackMarketGadget\(/);
assert.match(html, /updateAlley\(dt\)/);
assert.match(html, /tryAlleyInteract\(\)/);
assert.match(html, /Bomba de humo/);
assert.match(html, /Capa de sombras/);
assert.match(html, /Gafas de noche/);
assert.match(html, /Gancho trepador/);
assert.match(html, /Granada de confeti/);
assert.match(html, /Dardos de dormir/);
assert.match(html, /Silenciador de globos/);
assert.match(html, /Tito/);
assert.match(html, /cuatro ocho uno cinco/);
assert.match(html, /MERCADO DEL CALLEJÓN/);
assert.match(html, /questbox.*keypadbox.*blackbox/);

assert.doesNotMatch(html, /coca[ií]na|hero[ií]na|metanfet|pistola 9mm|sicario/i);

assert.match(sw, /tim-v44/);
console.log('missions alley black market: ok');
