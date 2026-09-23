import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import { CHAT_BUBBLE_MS, CHAT_CUSTOM_PREFIX, CHAT_EMOJIS, CHAT_MAX_LEN, CHAT_STICKERS, accountNameKey, accountRankingId, chatSendWait, chatTime, cleanAccountName, cleanChatName, cleanChatText, cleanStickerLabel, customStickerPayload, isJpegBase64, stickerFromText, stickerPayload } from '../src/chat.js';

// El globo del chat dura 7 segundos: es la promesa del juego, no un detalle suelto.
assert.equal(CHAT_BUBBLE_MS, 7000);

// Un mensaje normal llega tal cual, en una sola línea.
assert.equal(cleanChatText('  Hola   a todos\n desde Platus '), 'Hola a todos desde Platus');

// Nada de mensajes kilométricos ni de caracteres invisibles que rompan el muro.
assert.equal(cleanChatText('a'.repeat(500)).length, CHAT_MAX_LEN);
assert.ok(!/\p{Cc}/u.test(cleanChatText('hola' + String.fromCharCode(7) + 'mundo')), 'no deben quedar caracteres de control');

// Es un juego de niños: los enlaces se tapan y las groserías no se publican.
assert.equal(cleanChatText('mira esto https://sitio.malo/x'), 'mira esto (enlace)');
assert.equal(cleanChatText('entra a www.sitio.malo ahora'), 'entra a (enlace) ahora');
assert.equal(cleanChatText('eres un MARICÓN'), 'eres un ***');
assert.equal(cleanChatText('putas'), '***', 'los plurales también se tapan');
assert.equal(cleanChatText('computador conejo consola'), 'computador conejo consola', 'las palabras normales no se tocan');
// El filtro no puede comerse palabras que solo empiezan parecido.
for (const frase of ['conoce a mi papa', 'conoci a la mama', 'tengo 3 conos', 'se llama Vergara', 'que estupidez']) {
  assert.equal(cleanChatText(frase), frase, 'no debe tapar: ' + frase);
}

// Los emoji de familia se mandan enteros (el unidor invisible no se borra).
const familia = 'hola \u{1F468}\u200D\u{1F469}\u200D\u{1F467} familia';
assert.equal(cleanChatText(familia), familia, 'el emoji de familia no se debe partir');

// Los emoji de corazón y de conversación no se rompen (el selector de emoji se conserva).
assert.equal(cleanChatText('te quiero ❤️'), 'te quiero ❤️');
assert.equal(cleanChatText('hola 😀'), 'hola 😀');

assert.ok(CHAT_EMOJIS.includes('😀'));
assert.ok(CHAT_EMOJIS.includes('❤️'));
assert.ok(CHAT_STICKERS.length >= 12);
assert.equal(stickerPayload('gol'), 'sticker:gol');
assert.equal(stickerFromText('sticker:gol').emoji, '⚽');
assert.equal(cleanChatText('sticker:gol'), 'sticker:gol');
assert.equal(stickerFromText(cleanChatText('sticker:hola')).label, 'Hola');
assert.equal(stickerFromText('sticker:noexiste'), null);
assert.equal(stickerFromText('hola'), null);

const jpeg = Buffer.alloc(80, 1);
jpeg[0] = 0xff; jpeg[1] = 0xd8;
const jpegB64 = jpeg.toString('base64');
assert.equal(isJpegBase64(jpegB64), true);
assert.equal(cleanStickerLabel('  Mi perro!!  '), 'Mi perro');
assert.equal(cleanStickerLabel('<script>'), 'script');
const custom = customStickerPayload('Mi perro', jpegB64);
assert.ok(custom.startsWith(CHAT_CUSTOM_PREFIX + 'Mi perro:'));
assert.equal(cleanChatText(custom), custom, 'el sticker de foto se guarda entero');
assert.equal(stickerFromText(custom).custom, true);
assert.equal(stickerFromText(custom).label, 'Mi perro');
assert.match(stickerFromText(custom).src, /^data:image\/jpeg;base64,/);
assert.equal(cleanChatText('sticker:img:http://malo'), '', 'no se cuelan enlaces como sticker');
assert.equal(cleanChatText('sticker:img:Hola:abc'), '', 'no se acepta basura que no sea jpeg');
assert.equal(customStickerPayload('x', 'not-a-jpeg'), '');
assert.ok(cleanChatText('sticker:gol') === 'sticker:gol');

// Un mensaje que solo tiene espacios o controles no se guarda.
assert.equal(cleanChatText('    '), '');
assert.equal(cleanChatText(null), '');

// El nombre visible nunca queda vacío ni trae etiquetas HTML.
assert.equal(cleanChatName('  Benja  '), 'Benja');
assert.equal(cleanChatName(''), 'Jugador');
assert.equal(cleanChatName('<script>x</script>'), 'scriptxscript');
assert.ok(cleanChatName('N'.repeat(80)).length <= 20);

assert.equal(cleanAccountName('  José  '), 'José');
assert.equal(cleanAccountName(''), '');
assert.equal(accountNameKey('José'), accountNameKey('jose'));
assert.equal(accountNameKey('José'), 'jose');
assert.equal(accountNameKey('Jugador'), 'jugador');

// La cuenta con clave tiene un solo id de ranking, igual en cualquier aparato.
const joseId = accountRankingId('José');
assert.equal(joseId, accountRankingId('jose'));
assert.equal(joseId, accountRankingId('  JOSE  '));
assert.match(joseId, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
assert.notEqual(accountRankingId('Ana'), joseId);
assert.equal(accountRankingId('J'), null);
const sha = crypto.createHash('sha1').update('thisismoney.rank.v1:jose').digest('hex');
assert.equal(joseId.replace(/-/g, '').slice(0, 12), sha.slice(0, 12));

// Anti spam: hay que esperar entre mensaje y mensaje.
assert.equal(chatSendWait(0), 0, 'el primer mensaje sale al tiro');
assert.ok(chatSendWait(1000, 1200) > 0, 'dos mensajes seguidos deben esperar');
assert.equal(chatSendWait(1000, 99000), 0, 'después de la espera se puede escribir de nuevo');

// La hora corta del muro.
assert.match(chatTime(new Date(2026, 0, 1, 9, 5)), /^09:05$/);
assert.equal(chatTime('no es fecha'), '');

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const server = readFileSync(new URL('../server/leaderboard.mjs', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../server/schema.sql', import.meta.url), 'utf8');
const nginx = readFileSync(new URL('../server/nginx-location.conf', import.meta.url), 'utf8');
assert.match(html, /id="chatEmojiPad"/);
assert.match(html, /id="chatStickerPad"/);
assert.match(html, /id="stickerMake"/);
assert.match(html, /id="stickerMakePhoto"/);
assert.match(html, /function insertChatEmoji\(/);
assert.match(html, /function sendChatSticker\(/);
assert.match(html, /function openStickerMake\(/);
assert.match(html, /function sendCustomChatSticker\(/);
assert.match(html, /stickerFromText/);
assert.match(html, /src\/chat\.js\?v=5/);
assert.match(html, /stickerMake.*TYPING_BOXES|TYPING_BOXES = \[.*stickerMake/);
assert.match(server, /CHAT_POST_MAX/);
assert.match(schema, /char_length\(body\) between 1 and 14000/);
assert.match(nginx, /location = \/api\/chat/);
assert.match(nginx, /client_max_body_size 20k/);

console.log('chat: ok');
