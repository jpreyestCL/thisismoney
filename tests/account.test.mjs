import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /id="startAccount"/);
assert.match(html, /id="accountbox"/);
assert.match(html, /id="accountPhotoBtn"/);
assert.match(html, /id="accountWallBtn"/);
assert.match(html, /id="accountFile"/);
assert.match(html, /accept="image\/\*"/);
assert.match(html, /id="pauseAccount"/);
assert.match(html, /has-wall/);
assert.match(html, /function renameProfile\(/);
assert.match(html, /function compressImageFile\(/);
assert.match(html, /tim_account_/);
assert.match(html, /function desiredAccountName\(/);
assert.match(html, /CHAT_NAME_MAX/);
assert.match(html, /Fondo de la sala/);
assert.match(html, /Elegir foto/);
assert.match(html, /Guardar nombre/);
assert.match(html, /accountbox.*TYPING_BOXES|TYPING_BOXES = \[.*accountbox/);
assert.match(html, /closeAccountBox/);
assert.doesNotMatch(html, /GREATEST\(leaderboard\.best_money/);
assert.match(sw, /tim-v32/);

assert.match(html, /id="nameInput"[^>]*maxlength="20"/);
assert.match(html, /id="netName"[^>]*maxlength="20"/);
assert.match(html, /id="accountName"[^>]*maxlength="20"/);

console.log('account: ok');
