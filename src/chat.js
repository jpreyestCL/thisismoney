// Reglas del CHAT MUNDIAL. Las usan el navegador (index.html) y la API del
// servidor (server/leaderboard.mjs) para que el mensaje que se ve en pantalla
// sea exactamente el que queda guardado: mismo largo, misma limpieza y el
// mismo filtro de groserías. El juego lo juegan niños: por eso los enlaces se
// tapan y las palabras feas se reemplazan antes de llegar al muro.

export const CHAT_MAX_LEN = 140;        // un mensaje corto se lee de una pasada
export const CHAT_BUBBLE_MS = 7000;     // el globo en pantalla dura 7 segundos y se va solo
export const CHAT_SEND_GAP_MS = 2500;   // espera mínima entre dos mensajes del mismo jugador
export const CHAT_HISTORY = 40;         // cuántos mensajes muestra el muro
export const CHAT_NAME_MAX = 20;
export const CHAT_STICKER_PREFIX = 'sticker:';

// Emojis del teclado del muro (se meten en el texto que estás escribiendo).
export const CHAT_EMOJIS = [
  '😀', '😂', '😍', '🤩', '😎', '🥳', '😭', '😡', '😱', '😴', '🤔', '🙃',
  '👍', '👎', '❤️', '🔥', '✨', '🎉', '🙏', '💪', '👋', '👀', '💀', '🧟',
  '⚽', '🏆', '🚗', '🚀', '🌍', '💰', '🏠', '👨', '👩', '🐶', '🌟', '🍕',
  '🎮', '☀️', '🌙', '❄️', '🌈', '👻', '🛡️', '❤️‍🔥',
];

// Stickers: un toque manda el dibujo grande (no se mezcla con el texto).
export const CHAT_STICKERS = [
  { id: 'hola', emoji: '👋', label: 'Hola' },
  { id: 'risa', emoji: '😂', label: 'Risa' },
  { id: 'love', emoji: '❤️', label: 'Corazón' },
  { id: 'fuego', emoji: '🔥', label: 'Fuego' },
  { id: 'gol', emoji: '⚽', label: 'Gol' },
  { id: 'plata', emoji: '💰', label: 'Plata' },
  { id: 'casa', emoji: '🏠', label: 'Casa' },
  { id: 'zombi', emoji: '🧟', label: 'Zombi' },
  { id: 'cohete', emoji: '🚀', label: 'Cohete' },
  { id: 'ok', emoji: '👍', label: 'Ok' },
  { id: 'wow', emoji: '🤩', label: 'Wow' },
  { id: 'gg', emoji: '🏆', label: 'GG' },
  { id: 'noche', emoji: '🌙', label: 'Noche' },
  { id: 'planeta', emoji: '🪐', label: 'Planeta' },
  { id: 'perro', emoji: '🐶', label: 'Perro' },
  { id: 'juego', emoji: '🎮', label: 'Play' },
];
export function stickerPayload(id) {
  const s = CHAT_STICKERS.find(x => x.id === id);
  return s ? CHAT_STICKER_PREFIX + s.id : '';
}
export function stickerFromText(text) {
  const raw = String(text || '');
  if (!raw.startsWith(CHAT_STICKER_PREFIX)) return null;
  return CHAT_STICKERS.find(s => s.id === raw.slice(CHAT_STICKER_PREFIX.length)) || null;
}

// Raíces de groserías (sin tildes ni mayúsculas). Se tapan también sus plurales
// y su género: "putas" y "culiaos" caen con "puta" y "culiao". Las terminaciones
// permitidas son solo esas, para no tapar palabras normales que empiezan igual
// ("conocí", "Vergara", "estupidez" no son groserías).
const BAD_ROOTS = [
  'conchetumadre', 'conchetumare', 'ctm', 'culiao', 'culia', 'maricon', 'maraco',
  'puta', 'puto', 'mierda', 'verga', 'pendejo', 'pichula', 'zorra',
  'joder', 'gilipollas', 'chupalo', 'imbecil', 'estupido',
];
const BAD_SUFFIXES = ['', 's', 'es', 'a', 'as', 'o', 'os'];
const LINKS = /\b(?:https?:\/\/|www\.)\S+/gi;
const CONTROL = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;
// El "unidor" invisible arma los emoji de familia (👨‍👩‍👧). El selector de
// emoji (❤️) y las etiquetas de banderas (🏴󠁧󠁢󠁳󠁣󠁴󠁿) también tienen que quedar.
const ZWJ = String.fromCharCode(0x200d);
function keepChatFormat(c) {
  const cp = c.codePointAt(0);
  return c === ZWJ || cp === 0xfe0e || cp === 0xfe0f || (cp >= 0xe0020 && cp <= 0xe007f);
}
function clipChatChars(text, max) {
  const chars = Array.from(text);
  return chars.length <= max ? text : chars.slice(0, max).join('');
}

// "Culiaoo" y "CULIAO" son la misma palabra: comparamos sin tildes ni signos.
function fold(word) {
  return word.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase().replace(/[^a-z]/g, '');
}
function isBad(word) {
  const w = fold(word);
  if (!w) return false;
  return BAD_ROOTS.some(root => w.startsWith(root) && BAD_SUFFIXES.includes(w.slice(root.length)));
}

export function maskBadWords(text) {
  return String(text).replace(/[\p{L}\p{N}]+/gu, w => (isBad(w) ? '***' : w));
}

// Deja el mensaje listo para guardar: sin caracteres de control, sin enlaces,
// en una sola línea y recortado. Devuelve '' si no queda nada que decir.
export function cleanChatText(value) {
  const text = clipChatChars(String(value ?? '')
    .normalize('NFKC')
    .replace(CONTROL, c => (keepChatFormat(c) ? c : ' '))
    .replace(LINKS, '(enlace)')
    .replace(/\s+/g, ' ')
    .trim(), CHAT_MAX_LEN);
  const sticker = stickerFromText(text);
  if (sticker) return stickerPayload(sticker.id);
  return maskBadWords(text).trim();
}

// Nombre visible: letras, números y separadores simples. Nunca queda vacío.
export function cleanChatName(value) {
  return String(value || '').normalize('NFKC').replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, CHAT_NAME_MAX) || 'Jugador';
}

// Nombre de cuenta para guardar en la nube: puede quedar vacío (así el cliente pide uno).
export function cleanAccountName(value) {
  return String(value || '').normalize('NFKC').replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, CHAT_NAME_MAX);
}
// Clave única: sin tildes ni mayúsculas, para que "José" y "jose" sean el mismo usuario.
export function accountNameKey(value) {
  return cleanAccountName(value).normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
}

// Milisegundos que faltan para poder mandar otro mensaje (0 = puede escribir ya).
export function chatSendWait(lastSentAt, now = Date.now()) {
  if (!lastSentAt) return 0;
  return Math.max(0, CHAT_SEND_GAP_MS - (now - lastSentAt));
}

// Hora corta (14:05) para la lista del muro.
export function chatTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
