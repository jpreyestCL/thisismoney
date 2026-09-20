import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const server = readFileSync(new URL('../server/leaderboard.mjs', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../server/schema.sql', import.meta.url), 'utf8');
const nginx = readFileSync(new URL('../server/nginx-location.conf', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /id="saveKeyBox"/);
assert.match(html, /id="saveKeyPass"/);
assert.match(html, /id="saveKeyConfirm"/);
assert.match(html, /id="cloudLoginBox"/);
assert.match(html, /id="cloudLoginBtn"/);
assert.match(html, /id="pauseCloud"/);
assert.match(html, /CONTINUAR CON CLAVE/);
assert.match(html, /Confirma la clave/);
assert.match(html, /function openSaveKeyBox\(/);
assert.match(html, /function submitSaveKey\(/);
assert.match(html, /function submitCloudLogin\(/);
assert.match(html, /action: 'save'/);
assert.match(html, /action: 'load'/);
assert.match(html, /Las claves no coinciden/);
assert.match(html, /Ese nombre ya está ocupado/);
assert.match(html, /SAVES_API/);
assert.match(html, /accountNameKey/);
assert.match(html, /saveKeyBox.*cloudLoginBox|TYPING_BOXES = \[.*saveKeyBox/);

assert.match(server, /pathname === '\/saves'/);
assert.match(server, /scryptSync/);
assert.match(server, /timingSafeEqual/);
assert.match(server, /RESERVED_USERNAMES/);
assert.match(server, /action === 'load'/);
assert.match(server, /username_key/);
assert.doesNotMatch(server, /body\.password\s*,\s*parsed/);

assert.match(schema, /create table if not exists cloud_saves/);
assert.match(schema, /username_key text primary key/);
assert.match(schema, /password_hash text not null/);

assert.match(nginx, /location = \/api\/saves/);
assert.match(nginx, /client_max_body_size 2m/);

assert.match(sw, /tim-v50/);
assert.match(html, /chat\.js\?v=4/);

console.log('cloud save: ok');
