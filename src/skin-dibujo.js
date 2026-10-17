// Skin dibujada a mano. Un solo lienzo, fondo transparente: lo que se
// pinta es el personaje entero (un queso se ve como un queso). En pose
// quieta esa malla es el rectángulo del lienzo, píxel a píxel. Al caminar,
// los vértices de los brazos y las piernas giran alrededor de los mismos
// pivotes que swingLimbs, con un peso que se apaga hacia el centro: el
// dibujo se dobla y no se desarma. Los píxeles vacíos no se dibujan.

export const LIENZO_W = 80;
export const LIENZO_H = 112;
export const PARTES = Object.freeze(['cabeza', 'torso', 'brazoI', 'brazoD', 'piernaI', 'piernaD']);

// El lienzo entero se puede pintar: no hay borde donde el lápiz no entre.
export const REGIONES = Object.freeze({
  cabeza: Object.freeze({ x: 0, y: 0, w: 80, h: 32 }),
  brazoI: Object.freeze({ x: 0, y: 32, w: 18, h: 44 }),
  torso: Object.freeze({ x: 18, y: 32, w: 44, h: 44 }),
  brazoD: Object.freeze({ x: 62, y: 32, w: 18, h: 44 }),
  piernaI: Object.freeze({ x: 0, y: 76, w: 40, h: 36 }),
  piernaD: Object.freeze({ x: 40, y: 76, w: 40, h: 36 }),
});

// Alto del dibujo en el muñeco (unidades del makePerson, antes de achicarlo).
export const FIGURA_ALTO = 2.2;
export const FIGURA_BASE = 0.02;
export const FIGURA_Z = 0.12;
// Una celda por píxel: en reposo el dibujo calza con el lienzo.
export const MALLA_COLS = LIENZO_W;
export const MALLA_FILAS = LIENZO_H;

// Pivotes de makePerson (limb): el dibujo gira ahí, no en el origen.
export const PIVOTES = Object.freeze({
  brazoI: Object.freeze({ x: -0.5, y: 1.78, z: 0 }),
  brazoD: Object.freeze({ x: 0.5, y: 1.78, z: 0 }),
  piernaI: Object.freeze({ x: -0.2, y: 0.9, z: 0 }),
  piernaD: Object.freeze({ x: 0.2, y: 0.9, z: 0 }),
});

const PIXELES = LIENZO_W * LIENZO_H * 4;
const VACIO = new Uint8ClampedArray(PIXELES);
const HUESOS = Object.freeze([
  ['armL', 'brazoI', 0],
  ['armR', 'brazoD', 1],
  ['legL', 'piernaI', 2],
  ['legR', 'piernaD', 3],
]);

function idx(x, y) { return (y * LIENZO_W + x) * 4; }

function poner(px, x, y, rgba) {
  if (!rgba || x < 0 || y < 0 || x >= LIENZO_W || y >= LIENZO_H) return;
  const i = idx(x, y);
  px[i] = rgba[0]; px[i + 1] = rgba[1]; px[i + 2] = rgba[2];
  px[i + 3] = rgba[3] == null ? 255 : rgba[3];
}

function rampa(t) {
  const x = t <= 0 ? 0 : t >= 1 ? 1 : t;
  return x * x * (3 - 2 * x);
}

export function anchoFigura() {
  return FIGURA_ALTO * (LIENZO_W / LIENZO_H);
}

export function lienzoNuevo() {
  return VACIO.slice();
}

export function parteEn(x, y) {
  const ix = x | 0, iy = y | 0;
  if (ix < 0 || iy < 0 || ix >= LIENZO_W || iy >= LIENZO_H) return null;
  for (const id of PARTES) {
    const r = REGIONES[id];
    if (ix >= r.x && iy >= r.y && ix < r.x + r.w && iy < r.y + r.h) return id;
  }
  return null;
}

// Lápiz (rgba) en cualquier pixel. La goma deja el fondo transparente.
export function pintar(px, x, y, radio, rgba, goma) {
  const r = Math.max(0.5, Number(radio) || 0.5);
  const r2 = r * r;
  const x0 = Math.floor(x - r), x1 = Math.ceil(x + r);
  const y0 = Math.floor(y - r), y1 = Math.ceil(y + r);
  const tinta = goma ? [0, 0, 0, 0] : rgba;
  for (let yy = y0; yy <= y1; yy++) {
    for (let xx = x0; xx <= x1; xx++) {
      const dx = xx + 0.5 - x, dy = yy + 0.5 - y;
      if (dx * dx + dy * dy > r2) continue;
      if (!parteEn(xx, yy)) continue;
      poner(px, xx, yy, tinta);
    }
  }
  return px;
}

export function esDistinta(px) {
  if (!px || px.length !== PIXELES) return false;
  for (let i = 3; i < PIXELES; i += 4) if (px[i] !== 0) return true;
  return false;
}

// Peso de cada pivote en un píxel. El centro (torso, agujeros del queso)
// queda en cero. La cabeza no se va con el brazo. La cintura reparte el
// peso de a poco, así dos vértices vecinos no salen disparados.
export function influenciaDe(px, py) {
  const cabeza = 1 - rampa((py - 4) / 28);
  const arriba = (1 - rampa((py - 58) / 20)) * (1 - cabeza);
  // Debajo de los agujeros, los costados del dibujo son las piernas.
  // El centro queda quieto para que el bajo no se abra en dos.
  const abajo = rampa((py - 70) / 12);
  return {
    brazoI: rampa((24 - px) / 24) * arriba,
    brazoD: rampa((px - 56) / 24) * arriba,
    piernaI: rampa((36 - px) / 14) * abajo,
    piernaD: rampa((px - 44) / 14) * abajo,
  };
}

export function indiceDe(i, j, cols = MALLA_COLS) {
  return j * (cols + 1) + i;
}

// Rectángulo del lienzo, de frente. La fila 0 del canvas queda arriba.
export function mallaEnReposo(cols = MALLA_COLS, filas = MALLA_FILAS) {
  const nv = (cols + 1) * (filas + 1);
  const posiciones = new Float32Array(nv * 3);
  const uvs = new Float32Array(nv * 2);
  const pesos = new Float32Array(nv * 4);
  const indices = new Uint16Array(cols * filas * 6);
  const ancho = anchoFigura();
  let t = 0;
  for (let j = 0; j <= filas; j++) {
    const py = (j / filas) * LIENZO_H;
    const y = FIGURA_BASE + FIGURA_ALTO * (1 - j / filas);
    const v = 1 - j / filas;
    for (let i = 0; i <= cols; i++) {
      const px = (i / cols) * LIENZO_W;
      const k = indiceDe(i, j, cols);
      posiciones[k * 3] = -ancho / 2 + (i / cols) * ancho;
      posiciones[k * 3 + 1] = y;
      posiciones[k * 3 + 2] = FIGURA_Z;
      uvs[k * 2] = i / cols;
      uvs[k * 2 + 1] = v;
      const w = influenciaDe(px, py);
      pesos[k * 4] = w.brazoI;
      pesos[k * 4 + 1] = w.brazoD;
      pesos[k * 4 + 2] = w.piernaI;
      pesos[k * 4 + 3] = w.piernaD;
      if (i < cols && j < filas) {
        const a = k, b = k + 1, c = k + cols + 1, d = c + 1;
        indices[t++] = a; indices[t++] = d; indices[t++] = b;
        indices[t++] = a; indices[t++] = c; indices[t++] = d;
      }
    }
  }
  return { cols, filas, posiciones, uvs, pesos, indices };
}

// Euler XYZ, el mismo orden que Object3D de Three.js.
function giroXYZ(rx, ry, rz, x, y, z) {
  const a = Math.cos(rx), b = Math.sin(rx);
  const c = Math.cos(ry), d = Math.sin(ry);
  const e = Math.cos(rz), f = Math.sin(rz);
  const te0 = c * e, te4 = -c * f, te8 = d;
  const te1 = a * f + b * d * e, te5 = a * e - b * d * f, te9 = -b * c;
  const te2 = b * f - a * d * e, te6 = b * e + a * d * f, te10 = a * c;
  return {
    x: te0 * x + te4 * y + te8 * z,
    y: te1 * x + te5 * y + te9 * z,
    z: te2 * x + te6 * y + te10 * z,
  };
}

// Escribe la pose en `out`. Con los pivotes en cero, `out` queda igual al reposo.
export function posarMalla(reposo, limbs, out) {
  const pos = reposo.posiciones;
  const pesos = reposo.pesos;
  const nv = (reposo.cols + 1) * (reposo.filas + 1);
  const L = limbs || {};
  for (let v = 0; v < nv; v++) {
    const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
    let sx = 0, sy = 0, sz = 0, sw = 0;
    for (let h = 0; h < HUESOS.length; h++) {
      const w = pesos[v * 4 + HUESOS[h][2]];
      if (w <= 0) continue;
      const nodo = L[HUESOS[h][0]];
      const rot = (nodo && nodo.rotation) || ceroRot;
      const piv = PIVOTES[HUESOS[h][1]];
      const g = giroXYZ(rot.x || 0, rot.y || 0, rot.z || 0, x - piv.x, y - piv.y, z - piv.z);
      sx += w * (piv.x + g.x);
      sy += w * (piv.y + g.y);
      sz += w * (piv.z + g.z);
      sw += w;
    }
    const o = v * 3;
    if (sw <= 0) { out[o] = x; out[o + 1] = y; out[o + 2] = z; }
    else if (sw < 1) {
      const r = 1 - sw;
      out[o] = sx + r * x; out[o + 1] = sy + r * y; out[o + 2] = sz + r * z;
    } else {
      out[o] = sx / sw; out[o + 1] = sy / sw; out[o + 2] = sz / sw;
    }
  }
  return out;
}

const ceroRot = { x: 0, y: 0, z: 0 };

export function posarDibujo(persona) {
  const lista = persona && persona.userData && persona.userData.dibujo;
  const mesh = lista && lista[0];
  const reposo = mesh && mesh.userData && mesh.userData.reposo;
  const attr = mesh && mesh.geometry && mesh.geometry.attributes && mesh.geometry.attributes.position;
  if (!reposo || !attr || !attr.array || attr.array === reposo.posiciones) return;
  posarMalla(reposo, (persona.userData && persona.userData.limbs) || {}, attr.array);
  attr.needsUpdate = true;
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

function soltarDibujo(persona, opt) {
  const lista = persona.userData && persona.userData.dibujo;
  if (!lista) return;
  for (const m of lista) {
    const padre = m.parent;
    if (padre && padre.children) {
      const i = padre.children.indexOf(m);
      if (i >= 0) padre.children.splice(i, 1);
    }
    m.parent = null;
    if (m.material && m.material.map && opt.alLiberar) opt.alLiberar(m.material.map);
    if (m.geometry && m.geometry.dispose) m.geometry.dispose();
    if (m.material && m.material.dispose) m.material.dispose();
  }
  persona.userData.dibujo = null;
}

// Esconde el muñeco y cuelga UNA malla del cuerpo. swingLimbs sigue
// moviendo los pivotes; posarDibujo dobla esa malla. No toca la ropa
// del ladrón. Devuelve true si quedó una skin propia.
export function aplicarSkin(persona, pixeles, opciones) {
  const opt = opciones || {};
  const custom = !!(pixeles && esDistinta(pixeles) && opt.crearMalla);
  if (!persona.userData) persona.userData = {};
  soltarDibujo(persona, opt);
  const vistos = new Set();
  recorrer(persona, (obj) => {
    const ud = obj.userData || {};
    if (ud.dibujo) return;
    if (ud.adorno || ud.doll) obj.visible = !custom;
    if (!ud.superficie || !obj.material) return;
    obj.visible = !custom;
    const mat = obj.material;
    if (vistos.has(mat)) return;
    vistos.add(mat);
    mat.map = null;
    if (mat.userData) mat.userData.skinMap = null;
    mat.skinPixels = null;
    mat.skinParte = null;
    mat.needsUpdate = true;
    if (!custom && mat.color && mat.color.setHex && ud.colorBase != null) mat.color.setHex(ud.colorBase);
  });
  if (!custom) return false;
  const reposo = mallaEnReposo();
  const mesh = opt.crearMalla(pixeles, reposo);
  if (!mesh) return false;
  if (!persona.children) persona.children = [];
  persona.children.push(mesh);
  mesh.parent = persona;
  if (!mesh.userData) mesh.userData = {};
  mesh.userData.dibujo = 'entero';
  mesh.userData.reposo = reposo;
  persona.userData.dibujo = [mesh];
  return true;
}
