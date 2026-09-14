import assert from 'node:assert/strict';
import { CHAT_BUBBLE_MS, CHAT_MAX_LEN, accountNameKey, chatSendWait, chatTime, cleanAccountName, cleanChatName, cleanChatText } from '../src/chat.js';

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

// Anti spam: hay que esperar entre mensaje y mensaje.
assert.equal(chatSendWait(0), 0, 'el primer mensaje sale al tiro');
assert.ok(chatSendWait(1000, 1200) > 0, 'dos mensajes seguidos deben esperar');
assert.equal(chatSendWait(1000, 99000), 0, 'después de la espera se puede escribir de nuevo');

// La hora corta del muro.
assert.match(chatTime(new Date(2026, 0, 1, 9, 5)), /^09:05$/);
assert.equal(chatTime('no es fecha'), '');

console.log('chat: ok');
