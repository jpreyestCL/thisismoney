import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const server = readFileSync(new URL('../server/leaderboard.mjs', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /DINERO ACTUAL/);
assert.match(html, /money: state\.money, stage: state\.stage/);
assert.doesNotMatch(html, /money: state\.totalEarned/);
assert.match(server, /best_money = excluded\.best_money/);
assert.match(server, /best_stage = excluded\.best_stage/);
assert.doesNotMatch(server, /greatest\(leaderboard_scores\.best_money/);
assert.doesNotMatch(server, /greatest\(leaderboard_scores\.best_stage/);

assert.match(html, /function rankingIdFor\(/);
assert.match(html, /tim_rank_id_/);
assert.match(html, /function submitAllLeaderboards\(/);
assert.match(html, /function submitOneLeaderboard\(/);
assert.match(html, /function leaderboardStatsFor\(/);
assert.doesNotMatch(html, /if \(!leaderboardPlayerId \|\| !state\.running \|\| state\.creative\) return false/);
assert.match(html, /rankingIdKey\(oldName\)/);
assert.match(html, /limit=200/);
assert.match(html, /tú/);
assert.match(server, /Math\.min\(250,/);
assert.match(sw, /tim-v23/);

console.log('leaderboard current money: ok');
