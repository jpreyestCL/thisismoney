import assert from 'node:assert/strict';
import { CHAPTERS, GAME_RULES, houseRatings, nightDuration, roadmapFor } from '../src/game-config.js';

assert.equal(nightDuration(1), 90, 'la primera noche debe ser breve');
assert.equal(nightDuration(2), 180, 'las noches normales deben durar tres minutos');
assert.ok(GAME_RULES.daySeconds < 300, 'el día no debe alargar demasiado el ciclo principal');

const early = roadmapFor(0);
assert.equal(early.now.name, 'Primer hogar');
assert.equal(early.next.at, 2500);
assert.equal(roadmapFor(1000000).next, null, 'la ruta debe poder completarse al alcanzar el horizonte espacial');

const sturdyHome = houseRatings({ wallRock: 4, roof: 1, cama: 1, oven: 1 });
assert.ok(sturdyHome.protection >= 60);
assert.ok(sturdyHome.comfort > 0);
assert.ok(sturdyHome.production > 0);
assert.ok(sturdyHome.score > sturdyHome.protection);
assert.equal(CHAPTERS.length, 8);
assert.ok(CHAPTERS.every(chapter => chapter.goal && chapter.reward > 0 && chapter.blueprint));

console.log('game rules: ok');
