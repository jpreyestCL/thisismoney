// Skin dibujada a mano. El lienzo es un muñeco de papel (cabeza, torso,
// dos brazos y dos piernas). El juego pega cada recorte en la pieza
// correspondiente del cuerpo que ya camina: no es una malla nueva.

export const LIENZO_W = 80;
export const LIENZO_H = 112;
export const PARTES = Object.freeze(['cabeza', 'torso', 'brazoI', 'brazoD', 'piernaI', 'piernaD']);

export const REGIONES = Object.freeze({
  cabeza: Object.freeze({ x: 32, y: 4, w: 16, h: 16 }),
  brazoI: Object.freeze({ x: 8, y: 24, w: 14, h: 40 }),
  torso: Object.freeze({ x: 24, y: 24, w: 32, h: 40 }),
  brazoD: Object.freeze({ x: 58, y: 24, w: 14, h: 40 }),
  piernaI: Object.freeze({ x: 26, y: 68, w: 14, h: 40 }),
  piernaD: Object.freeze({ x: 42, y: 68, w: 14, h: 40 }),
});

// Los mismos tonos del jugador (polera verde, piel, pantalón oscuro).
export const COLOR_BASE = Object.freeze({
  cabeza: Object.freeze([0xe0, 0xac, 0x69, 255]),
  torso: Object.freeze([0x3f, 0x62, 0x12, 255]),
  brazoI: Object.freeze([0x3f, 0x62, 0x12, 255]),
  brazoD: Object.freeze([0x3f, 0x62, 0x12, 255]),
  piernaI: Object.freeze([0x1f, 0x29, 0x37, 255]),
  piernaD: Object.freeze([0x1f, 0x29, 0x37, 255]),
});

const PIXELES = LIENZO_W * LIENZO_H * 4;
let baseCache = null;

function idx(x, y) { return (y * LIENZO_W + x) * 4; }

function poner(px, x, y, rgba) {
  if (!rgba || x < 0 || y < 0 || x >= LIENZO_W || y >= LIENZO_H) return;
  const i = idx(x, y);
  px[i] = rgba[0]; px[i + 1] = rgba[1]; px[i + 2] = rgba[2];
  px[i + 3] = rgba[3] == null ? 255 : rgba[3];
}

function rellenar(px, r, rgba) {
  for (let y = r.y; y < r.y + r.h; y++) {
    for (let x = r.x; x < r.x + r.w; x++) poner(px, x, y, rgba);
  }
}

function rect(px, x, y, w, h, rgba) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) poner(px, xx, yy, rgba);
}

function crearBase() {
  const px = new Uint8ClampedArray(PIXELES);
  for (const id of PARTES) rellenar(px, REGIONES[id], COLOR_BASE[id]);
  const c = REGIONES.cabeza;
  rect(px, c.x + 3, c.y + 5, 3, 3, [248, 250, 252, 255]);
  rect(px, c.x + c.w - 6, c.y + 5, 3, 3, [248, 250, 252, 255]);
  rect(px, c.x + 4, c.y + 6, 1, 2, [31, 41, 55, 255]);
  rect(px, c.x + c.w - 5, c.y + 6, 1, 2, [31, 41, 55, 255]);
  rect(px, c.x + 4, c.y + c.h - 4, c.w - 8, 2, [127, 58, 53, 255]);
  return px;
}

export function lienzoNuevo() {
  if (!baseCache) baseCache = crearBase();
  return baseCache.slice();
}

export function parteEn(x, y) {
  const ix = x | 0, iy = y | 0;
  for (const id of PARTES) {
    const r = REGIONES[id];
    if (ix >= r.x && iy >= r.y && ix < r.x + r.w && iy < r.y + r.h) return id;
  }
  return null;
}

// Lápiz (rgba) o goma (vuelve al color base de esa pieza). Fuera del muñeco no pinta.
export function pintar(px, x, y, radio, rgba, goma) {
  const r = Math.max(0.5, Number(radio) || 0.5);
  const r2 = r * r;
  const x0 = Math.floor(x - r), x1 = Math.ceil(x + r);
  const y0 = Math.floor(y - r), y1 = Math.ceil(y + r);
  for (let yy = y0; yy <= y1; yy++) {
    for (let xx = x0; xx <= x1; xx++) {
      const dx = xx + 0.5 - x, dy = yy + 0.5 - y;
      if (dx * dx + dy * dy > r2) continue;
      const id = parteEn(xx, yy);
      if (!id) continue;
      poner(px, xx, yy, goma ? COLOR_BASE[id] : rgba);
    }
  }
  return px;
}

export function esDistinta(px) {
  if (!px || px.length !== PIXELES) return false;
  if (!baseCache) baseCache = crearBase();
  for (let i = 0; i < PIXELES; i++) if (px[i] !== baseCache[i]) return true;
  return false;
}

export function recorte(px, region) {
  const out = new Uint8ClampedArray(region.w * region.h * 4);
  for (let y = 0; y < region.h; y++) {
    const src = idx(region.x, region.y + y);
    out.set(px.subarray(src, src + region.w * 4), y * region.w * 4);
  }
  return out;
}

function aBase64(px) {
  let s = '';
  const paso = 4096;
  for (let i = 0; i < px.length; i += paso) {
    const trozo = px.subarray(i, Math.min(px.length, i + paso));
    s += String.fromCharCode.apply(null, trozo);
  }
  return btoa(s);
}

function deBase64(texto) {
  const bin = atob(texto);
  const px = new Uint8ClampedArray(bin.length);
  for (let i = 0; i < bin.length; i++) px[i] = bin.charCodeAt(i);
  return px;
}

export function serializar(px) {
  if (!px || px.length !== PIXELES) return null;
  return 'sk1:' + aBase64(px);
}

export function restaurar(texto) {
  if (typeof texto !== 'string' || texto.slice(0, 4) !== 'sk1:') return null;
  try {
    const px = deBase64(texto.slice(4));
    if (px.length !== PIXELES) return null;
    return px;
  } catch (e) { return null; }
}

function recorrer(obj, fn) {
  if (!obj) return;
  fn(obj);
  const hijos = obj.children;
  if (!hijos) return;
  for (let i = 0; i < hijos.length; i++) recorrer(hijos[i], fn);
}

function quitarTextura(mat, opt) {
  const anterior = mat.userData && mat.userData.skinMap;
  if (anterior && opt.alLiberar) opt.alLiberar(anterior);
  if (mat.userData) mat.userData.skinMap = null;
  mat.map = null;
  mat.skinPixels = null;
  mat.skinParte = null;
  mat.needsUpdate = true;
}

// Pega el dibujo en las mallas marcadas superficie (cabeza, torso, brazos, piernas).
// No borra otras piezas: la ropa del ladrón, las manos y los zapatos se quedan.
// Devuelve true si quedó una skin propia.
export function aplicarSkin(persona, pixeles, opciones) {
  const opt = opciones || {};
  const custom = !!(pixeles && esDistinta(pixeles));
  const cache = {};
  if (custom) for (const id of PARTES) cache[id] = recorte(pixeles, REGIONES[id]);
  const vistos = new Set();
  recorrer(persona, (obj) => {
    const ud = obj.userData || {};
    if (ud.adorno) obj.visible = !custom;
    if (!ud.superficie || !ud.parte || !obj.material) return;
    const mat = obj.material;
    if (vistos.has(mat)) return;
    vistos.add(mat);
    if (!custom || !cache[ud.parte]) {
      quitarTextura(mat, opt);
      if (mat.color && mat.color.setHex && ud.colorBase != null) mat.color.setHex(ud.colorBase);
      return;
    }
    const tex = opt.textura ? opt.textura(cache[ud.parte], REGIONES[ud.parte]) : cache[ud.parte];
    const anterior = mat.userData && mat.userData.skinMap;
    if (anterior && anterior !== tex && opt.alLiberar) opt.alLiberar(anterior);
    mat.map = tex;
    if (!mat.userData) mat.userData = {};
    mat.userData.skinMap = tex;
    mat.skinPixels = cache[ud.parte];
    mat.skinParte = ud.parte;
    if (mat.color && mat.color.setHex) mat.color.setHex(0xffffff);
    mat.needsUpdate = true;
  });
  return custom;
}
