import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const server = readFileSync(new URL('../server/leaderboard.mjs', import.meta.url), 'utf8');

assert.match(html, /DINERO ACTUAL/);
assert.match(html, /money: state\.money, stage: state\.stage/);
assert.doesNotMatch(html, /money: state\.totalEarned/);
assert.match(server, /best_money = excluded\.best_money/);
assert.match(server, /best_stage = excluded\.best_stage/);
assert.doesNotMatch(server, /greatest\(leaderboard_scores\.best_money/);
assert.doesNotMatch(server, /greatest\(leaderboard_scores\.best_stage/);
console.log('leaderboard current money: ok');
