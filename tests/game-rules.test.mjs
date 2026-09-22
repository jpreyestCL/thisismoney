import assert from 'node:assert/strict';
import { CHAPTERS, GAME_RULES, dayDuration, dayPart, houseRatings, monsterKillReward, nightDuration, roadmapFor } from '../src/game-config.js';

assert.equal(GAME_RULES.morningSeconds, 60, 'la mañana dura 1 minuto');
assert.equal(GAME_RULES.daySeconds, 180, 'el día dura 3 minutos');
assert.equal(GAME_RULES.afternoonSeconds, 150, 'la tarde dura 2 minutos y medio');
assert.equal(nightDuration(1), 120, 'la noche dura 2 minutos');
assert.equal(nightDuration(4), 120, 'todas las noches duran 2 minutos');
assert.equal(dayDuration(0), 390, 'mañana + día + tarde');
assert.equal(dayDuration(3), 390);
assert.ok(dayDuration(2) > nightDuration(2), 'hay más tiempo de día que de noche');
assert.equal(dayPart(0).id, 'morning');
assert.equal(dayPart(59).name, 'Mañana');
assert.equal(dayPart(60).id, 'midday');
assert.equal(dayPart(239).name, 'Día');
assert.equal(dayPart(240).id, 'afternoon');
assert.equal(dayPart(389).name, 'Tarde');
assert.ok(dayPart(30).left > 0 && dayPart(30).left <= 60);

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

assert.equal(monsterKillReward(1), 1, 'un monstruo inicial debe entregar solo una moneda');
assert.ok(monsterKillReward(100, 20) <= 10, 'ni una etapa muy alta debe convertir monstruos normales en una gran fuente de dinero');

console.log('game rules: ok');
