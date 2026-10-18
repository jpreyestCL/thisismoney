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
// Lo que se ve delante en primera persona: el brazo derecho del dibujo,
// no el muñeco. En un queso, es el costado derecho de ese queso.
export const VISTA_BRAZO = Object.freeze({ x: 56, y: 22, w: 24, h: 68 });

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

export function recorteDe(px, region) {
  const out = new Uint8ClampedArray(region.w * region.h * 4);
  if (!px) return out;
  for (let y = 0; y < region.h; y++) {
    const sy = region.y + y;
    if (sy < 0 || sy >= LIENZO_H) continue;
    for (let x = 0; x < region.w; x++) {
      const sx = region.x + x;
      if (sx < 0 || sx >= LIENZO_W) continue;
      const s = idx(sx, sy);
      const d = (y * region.w + x) * 4;
      out[d] = px[s]; out[d + 1] = px[s + 1]; out[d + 2] = px[s + 2]; out[d + 3] = px[s + 3];
    }
  }
  return out;
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
// Un palo blanco con punta roja no gira en el hombro del muñeco: se traslada
// entero, y el resto del dibujo se queda donde se pintó.
export function posarMalla(reposo, limbs, out) {
  if (reposo && reposo.brazoBlanco) return posarBrazoBlanco(reposo, limbs, out);
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

// El palo gira en el punto donde se une a la raya. La punta sale hacia
// adelante y el arranque se queda pegado: no se traslada ni cae al suelo.
function posarBrazoBlanco(reposo, limbs, out) {
  const pos = reposo.posiciones;
  const pesos = reposo.pesos;
  const nv = pos.length / 3;
  const rot = (limbs && limbs.armR && limbs.armR.rotation) || ceroRot;
  const junta = reposo.articulacion || { x: LIENZO_W * 0.5, y: LIENZO_H * 0.45 };
  const punta = reposo.punta || { x: junta.x + 12, y: junta.y };
  const ancho = anchoFigura();
  const Jx = -ancho / 2 + (junta.x / LIENZO_W) * ancho;
  const Jy = FIGURA_BASE + FIGURA_ALTO * (1 - junta.y / LIENZO_H);
  const Jz = FIGURA_Z;
  let sx = ((punta.x - junta.x) / LIENZO_W) * ancho;
  let sy = -((punta.y - junta.y) / LIENZO_H) * FIGURA_ALTO;
  const sl = Math.hypot(sx, sy) || 1;
  sx /= sl; sy /= sl;
  const hx = sy, hy = -sx;
  let ang = -(rot.x || 0) * 0.62;
  if (ang > 0.95) ang = 0.95;
  if (ang < -0.95) ang = -0.95;
  const c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
  for (let v = 0; v < nv; v++) {
    const o = v * 3;
    const x = pos[o], y = pos[o + 1], z = pos[o + 2];
    if (pesos[v * 4 + 1] <= 0 || ang === 0) {
      out[o] = x; out[o + 1] = y; out[o + 2] = z;
      continue;
    }
    const dx = x - Jx, dy = y - Jy, dz = z - Jz;
    out[o] = Jx + (t * hx * hx + c) * dx + (t * hx * hy) * dy + (s * hy) * dz;
    out[o + 1] = Jy + (t * hx * hy) * dx + (t * hy * hy + c) * dy - (s * hx) * dz;
    out[o + 2] = Jz - (s * hy) * dx + (s * hx) * dy + c * dz;
  }
  return out;
}

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

// Lo que se pone encima (armadura, chaqueta, polerón, gorra, camuflaje)
// se pinta solo donde el dibujo es opaco. Un queso sigue siendo un queso:
// los agujeros quedan vacíos y nada flota fuera del trazo.
const UMBRAL = 102;

function opacoEn(px, x, y) {
  if (!px || x < 0 || y < 0 || x >= LIENZO_W || y >= LIENZO_H) return false;
  return px[(y * LIENZO_W + x) * 4 + 3] >= UMBRAL;
}

function cajaOpaca(px) {
  let minX = LIENZO_W, minY = LIENZO_H, maxX = -1, maxY = -1, n = 0;
  for (let y = 0; y < LIENZO_H; y++) {
    for (let x = 0; x < LIENZO_W; x++) {
      if (!opacoEn(px, x, y)) continue;
      n++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return n ? { minX, minY, maxX, maxY, n } : null;
}

// El palo del dibujo: blanco, alargado, con un puntito rojo en una punta.
// El otro extremo es la articulación. El cuerpo (la raya roja, el amarillo)
// no entra en la máscara, así que no se estira con el hombro del muñeco.
function esBlanco(px, x, y) {
  if (!opacoEn(px, x, y)) return false;
  const i = (y * LIENZO_W + x) * 4;
  const r = px[i], g = px[i + 1], b = px[i + 2];
  const max = r > g ? (r > b ? r : b) : (g > b ? g : b);
  const min = r < g ? (r < b ? r : b) : (g < b ? g : b);
  return min > 200 && max - min < 36;
}

function esRojo(px, x, y) {
  if (!opacoEn(px, x, y)) return false;
  const i = (y * LIENZO_W + x) * 4;
  const r = px[i], g = px[i + 1], b = px[i + 2];
  return r > 140 && g < 110 && b < 110 && r > g + 50 && r > b + 50;
}

function componentesBlancos(px) {
  const N = LIENZO_W * LIENZO_H;
  const visto = new Uint8Array(N);
  const grupos = [];
  let opacos = 0;
  for (let y = 0; y < LIENZO_H; y++) {
    for (let x = 0; x < LIENZO_W; x++) {
      if (!opacoEn(px, x, y)) continue;
      opacos++;
      const i = y * LIENZO_W + x;
      if (!esBlanco(px, x, y) || visto[i]) continue;
      const comp = [];
      const stack = [i];
      visto[i] = 1;
      while (stack.length) {
        const p = stack.pop();
        comp.push(p);
        const cx = p % LIENZO_W, cy = (p / LIENZO_W) | 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= LIENZO_W || ny >= LIENZO_H) continue;
            const ni = ny * LIENZO_W + nx;
            if (visto[ni] || !esBlanco(px, nx, ny)) continue;
            visto[ni] = 1;
            stack.push(ni);
          }
        }
      }
      grupos.push(comp);
    }
  }
  return { grupos, opacos };
}

function extremosDe(comp) {
  let sx = 0, sy = 0;
  for (const p of comp) { sx += p % LIENZO_W; sy += (p / LIENZO_W) | 0; }
  const mx = sx / comp.length, my = sy / comp.length;
  let cxx = 0, cyy = 0, cxy = 0;
  for (const p of comp) {
    const x = p % LIENZO_W - mx, y = ((p / LIENZO_W) | 0) - my;
    cxx += x * x; cyy += y * y; cxy += x * y;
  }
  let vx, vy;
  if (Math.abs(cxy) < 1e-8) {
    if (cxx >= cyy) { vx = 1; vy = 0; }
    else { vx = 0; vy = 1; }
  } else {
    const tr = cxx + cyy;
    const det = cxx * cyy - cxy * cxy;
    const l1 = tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - det));
    vx = l1 - cyy; vy = cxy;
  }
  const n = Math.hypot(vx, vy) || 1;
  vx /= n; vy /= n;
  let minT = Infinity, maxT = -Infinity, ia = comp[0], ib = comp[0];
  for (const p of comp) {
    const x = p % LIENZO_W, y = (p / LIENZO_W) | 0;
    const t = (x - mx) * vx + (y - my) * vy;
    if (t < minT) { minT = t; ia = p; }
    if (t > maxT) { maxT = t; ib = p; }
  }
  return {
    a: { x: ia % LIENZO_W, y: (ia / LIENZO_W) | 0 },
    b: { x: ib % LIENZO_W, y: (ib / LIENZO_W) | 0 },
  };
}

function rojosTocando(px, x, y) {
  const N = LIENZO_W * LIENZO_H;
  const visto = new Uint8Array(N);
  const stack = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy > 8) continue;
      const nx = x + dx, ny = y + dy;
      if (!esRojo(px, nx, ny)) continue;
      const ni = ny * LIENZO_W + nx;
      if (visto[ni]) continue;
      visto[ni] = 1;
      stack.push(ni);
    }
  }
  const out = [];
  while (stack.length) {
    const p = stack.pop();
    out.push(p);
    if (out.length > 56) return out;
    const cx = p % LIENZO_W, cy = (p / LIENZO_W) | 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= LIENZO_W || ny >= LIENZO_H) continue;
        const ni = ny * LIENZO_W + nx;
        if (visto[ni] || !esRojo(px, nx, ny)) continue;
        visto[ni] = 1;
        stack.push(ni);
      }
    }
  }
  return out;
}

function detectarBrazoBlanco(px) {
  if (!px || px.length !== PIXELES) return null;
  const { grupos, opacos } = componentesBlancos(px);
  if (opacos < 12) return null;
  let mejor = null;
  for (const comp of grupos) {
    if (comp.length < 8 || comp.length > opacos * 0.62) continue;
    const ext = extremosDe(comp);
    if (Math.hypot(ext.a.x - ext.b.x, ext.a.y - ext.b.y) < 6) continue;
    const ca = rojosTocando(px, ext.a.x, ext.a.y);
    const cb = rojosTocando(px, ext.b.x, ext.b.y);
    const vale = (c) => c.length >= 1 && c.length <= 56;
    let tipPix = null, joint = null;
    if (vale(ca) && (!vale(cb) || ca.length <= cb.length)) { tipPix = ca; joint = ext.b; }
    else if (vale(cb)) { tipPix = cb; joint = ext.a; }
    if (!tipPix) continue;
    if (!mejor || comp.length > mejor.comp.length) mejor = { comp, tipPix, joint };
  }
  if (!mejor) return null;
  const mask = new Uint8Array(LIENZO_W * LIENZO_H);
  for (const p of mejor.comp) mask[p] = 1;
  let sx = 0, sy = 0;
  for (const p of mejor.tipPix) {
    mask[p] = 1;
    sx += p % LIENZO_W;
    sy += (p / LIENZO_W) | 0;
  }
  return {
    mask,
    joint: mejor.joint,
    tip: { x: sx / mejor.tipPix.length, y: sy / mejor.tipPix.length },
  };
}

// El palo (blanco + punta roja) es una copia rígida que gira en su unión
// con la raya. El resto del dibujo no se estira.
export function aplicarPesosDeDibujo(reposo, px) {
  const info = detectarBrazoBlanco(px);
  if (!info || !reposo || !reposo.posiciones) return false;
  if (reposo.cols !== LIENZO_W || reposo.filas !== LIENZO_H) return false;
  const cols = reposo.cols, filas = reposo.filas;
  const baseN = (cols + 1) * (filas + 1);
  const brazos = [];
  for (let y = 0; y < LIENZO_H; y++) {
    for (let x = 0; x < LIENZO_W; x++) {
      if (info.mask[y * LIENZO_W + x]) brazos.push(x, y);
    }
  }
  if (!brazos.length) return false;
  const nPix = brazos.length / 2;
  const extra = nPix * 4;
  const posiciones = new Float32Array((baseN + extra) * 3);
  const uvs = new Float32Array((baseN + extra) * 2);
  const pesos = new Float32Array((baseN + extra) * 4);
  posiciones.set(reposo.posiciones.subarray(0, baseN * 3));
  uvs.set(reposo.uvs.subarray(0, baseN * 2));
  const cuerpo = [];
  for (let j = 0; j < filas; j++) {
    for (let i = 0; i < cols; i++) {
      if (!opacoEn(px, i, j) || info.mask[j * LIENZO_W + i]) continue;
      const a = indiceDe(i, j, cols);
      const b = a + 1, c = a + cols + 1, d = c + 1;
      cuerpo.push(a, d, b, a, c, d);
    }
  }
  let e = baseN;
  const tris = [];
  for (let p = 0; p < brazos.length; p += 2) {
    const i = brazos[p], j = brazos[p + 1];
    const esq = [[i, j], [i + 1, j], [i, j + 1], [i + 1, j + 1]];
    const ids = [];
    for (let c = 0; c < 4; c++) {
      const src = indiceDe(esq[c][0], esq[c][1], cols);
      posiciones[e * 3] = reposo.posiciones[src * 3];
      posiciones[e * 3 + 1] = reposo.posiciones[src * 3 + 1];
      posiciones[e * 3 + 2] = reposo.posiciones[src * 3 + 2];
      uvs[e * 2] = reposo.uvs[src * 2];
      uvs[e * 2 + 1] = reposo.uvs[src * 2 + 1];
      pesos[e * 4 + 1] = 1;
      ids.push(e);
      e++;
    }
    tris.push(ids[0], ids[3], ids[1], ids[0], ids[2], ids[3]);
  }
  const indices = new Uint16Array(cuerpo.length + tris.length);
  indices.set(cuerpo, 0);
  indices.set(tris, cuerpo.length);
  reposo.posiciones = posiciones;
  reposo.uvs = uvs;
  reposo.pesos = pesos;
  reposo.indices = indices;
  reposo.brazoBlanco = true;
  reposo.articulacion = info.joint;
  reposo.punta = info.tip;
  return true;
}

function rgbDe(color) {
  if (Array.isArray(color)) return [color[0] | 0, color[1] | 0, color[2] | 0];
  const n = color >>> 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function clamp8(n) {
  n = Math.round(n);
  return n < 0 ? 0 : n > 255 ? 255 : n;
}
function escalaColor(col, k) {
  return [clamp8(col[0] * k), clamp8(col[1] * k), clamp8(col[2] * k)];
}
function mezclaColor(a, b, t) {
  return [
    clamp8(a[0] + (b[0] - a[0]) * t),
    clamp8(a[1] + (b[1] - a[1]) * t),
    clamp8(a[2] + (b[2] - a[2]) * t),
  ];
}
// Trama de tela: un hilo claro y una pasada más oscura, no un bloque plano.
function tela(col, x, y) {
  if ((x + y * 2) % 5 === 0) return mezclaColor(col, [255, 255, 255], 0.28);
  if (y % 4 === 0) return escalaColor(col, 0.72);
  return col.slice();
}
function cerca(u, v, cu, cv, ru, rv) {
  const du = (u - cu) / ru, dv = (v - cv) / rv;
  return du * du + dv * dv;
}

function tintaGorra(u, v, col, borde, x, y) {
  if (v > 0.36) return null;
  if (cerca(u, v, 0.5, 0.05, 0.05, 0.045) < 1) return escalaColor(col, 0.4);
  if (v > 0.27) {
    if (u < 0.16 || u > 0.84) return null;
    if (v > 0.32) return [28, 18, 18];
    return escalaColor(col, 0.7);
  }
  if (Math.abs(u - 0.36) < 0.012 || Math.abs(u - 0.64) < 0.012) return escalaColor(col, 0.5);
  if (cerca(u, v, 0.42, 0.16, 0.02, 0.02) < 1 || cerca(u, v, 0.58, 0.16, 0.02, 0.02) < 1) return [32, 16, 16];
  if (v < 0.1) return mezclaColor(col, [255, 255, 255], 0.3);
  return tela(col, x, y);
}

function tintaChaqueta(u, v, col, borde, x, y) {
  if (v < 0.16 || v > 0.78) return null;
  const cuello = 0.26 + Math.abs(u - 0.5) * 0.2;
  if (v < cuello && Math.abs(u - 0.5) < 0.2) return null;
  if (Math.abs(u - 0.5) < 0.016 && v > 0.3 && v < 0.74) {
    return (y & 1) ? [236, 238, 242] : [150, 158, 170];
  }
  const solapa = Math.abs(Math.abs(u - 0.5) - (0.1 + (v - 0.26) * 0.12));
  if (solapa < 0.02 && v > 0.26 && v < 0.5 && Math.abs(u - 0.5) < 0.28) return borde;
  if (v < 0.32 && (u < 0.34 || u > 0.66)) return mezclaColor(borde, [255, 255, 255], 0.12);
  const bolsillo = (cx) => Math.abs(u - cx) < 0.09 && v > 0.5 && v < 0.66;
  if (bolsillo(0.32) || bolsillo(0.68)) {
    const cx = Math.abs(u - 0.32) < 0.09 ? 0.32 : 0.68;
    if (Math.abs(u - cx) > 0.065 || v < 0.53 || v > 0.63) return borde;
    return escalaColor(col, 0.8);
  }
  if ((cerca(u, v, 0.42, 0.4, 0.018, 0.018) < 1 || cerca(u, v, 0.58, 0.4, 0.018, 0.018) < 1) && v < 0.46) return [212, 175, 55];
  if ((u < 0.2 || u > 0.8) && v > 0.62) return (y % 3 === 0) ? borde : escalaColor(col, 0.85);
  if (v > 0.73) return borde;
  if (Math.abs(u - 0.22) < 0.01 || Math.abs(u - 0.78) < 0.01) return escalaColor(col, 0.55);
  if (Math.abs(u - 0.4) < 0.012 && v > 0.34 && v < 0.7) return mezclaColor(col, [255, 255, 255], 0.55);
  return tela(u < 0.5 ? escalaColor(col, 0.86) : col, x, y);
}

function tintaPoleron(u, v, col, borde, x, y) {
  const cara = cerca(u, v, 0.5, 0.18, 0.15, 0.1);
  if (cara < 1 && v < 0.3) return null;
  if (v < 0.32) {
    const capucha = cerca(u, v, 0.5, 0.16, 0.4, 0.2);
    if (capucha > 1) return null;
    if (cara < 1.45) return mezclaColor(col, [255, 255, 255], 0.4);
    if (Math.abs(capucha - 0.9) < 0.1) return borde;
    return tela(escalaColor(col, 0.9), x, y);
  }
  if (v > 0.84) return null;
  if (v > 0.28 && v < 0.46 && (Math.abs(u - 0.46) < 0.01 || Math.abs(u - 0.54) < 0.01)) return [236, 236, 232];
  if (Math.abs(u - 0.5) < 0.18 && v > 0.48 && v < 0.7) {
    if (Math.abs(u - 0.5) > 0.145 || v < 0.52 || v > 0.66) return borde;
    return escalaColor(col, 0.75);
  }
  if (v > 0.76) return (y % 3 === 0) ? borde : col.slice();
  if ((u < 0.18 || u > 0.82) && v > 0.52 && v < 0.74) return (y % 3 === 0) ? borde : escalaColor(col, 0.9);
  if (u < 0.22 || u > 0.78) return tela(escalaColor(col, 0.7), x, y);
  return tela(col, x, y);
}

function tintaCamuflaje(u, v, col, borde, x, y) {
  if (cerca(u, v, 0.5, 0.14, 0.14, 0.09) < 1) return null;
  if (v < 0.06 || v > 0.94) return null;
  if (v > 0.56 && v < 0.64 && u > 0.26 && u < 0.74) {
    if (Math.abs(u - 0.5) < 0.03) return [190, 168, 92];
    return [48, 40, 26];
  }
  if ((Math.abs(u - 0.34) < 0.07 || Math.abs(u - 0.66) < 0.07) && v > 0.36 && v < 0.5) return [36, 44, 24];
  const n = Math.sin(x * 0.41 + y * 0.13) * 0.65 + Math.cos(y * 0.27 - x * 0.19) * 0.35;
  if (n > 0.35) return col.slice();
  if (n > 0.02) return [58, 72, 36];
  if (n > -0.32) return [96, 78, 48];
  return [34, 46, 26];
}

function tintaArmadura(u, v, col, borde, x, y) {
  const claro = mezclaColor(col, [255, 255, 255], 0.5);
  const oscuro = escalaColor(col, 0.55);
  if (v < 0.24 && u > 0.2 && u < 0.8) {
    if (v > 0.11 && v < 0.19 && u > 0.32 && u < 0.68) return null;
    if (v > 0.2) return borde;
    if (Math.abs(u - 0.5) < 0.018) return claro;
    return v < 0.08 ? claro : col.slice();
  }
  const enPeto = v > 0.28 && v < 0.62 && u > 0.28 && u < 0.72;
  if (enPeto) {
    if (u < 0.33 || u > 0.67 || v < 0.32 || v > 0.58) return borde;
    if (cerca(u, v, 0.38, 0.38, 0.02, 0.02) < 1 || cerca(u, v, 0.62, 0.38, 0.02, 0.02) < 1
      || cerca(u, v, 0.38, 0.54, 0.02, 0.02) < 1 || cerca(u, v, 0.62, 0.54, 0.02, 0.02) < 1) return claro;
    if (Math.abs(u - 0.5) < 0.016) return claro;
    if (cerca(u, v, 0.5, 0.46, 0.06, 0.07) < 1) return borde;
    return u < 0.46 ? oscuro : col.slice();
  }
  if (cerca(u, v, 0.22, 0.32, 0.11, 0.07) < 1 || cerca(u, v, 0.78, 0.32, 0.11, 0.07) < 1) {
    return v < 0.3 ? claro : borde;
  }
  if ((u > 0.78 || u < 0.22) && v > 0.38 && v < 0.72) {
    if ((y & 3) === 0) return borde;
    if (v > 0.64) return oscuro;
    return claro;
  }
  if (v > 0.6 && v < 0.66 && u > 0.32 && u < 0.68) return borde;
  if (v > 0.7 && v < 0.93 && ((u > 0.3 && u < 0.46) || (u > 0.54 && u < 0.7))) {
    if (v > 0.86) return borde;
    if (Math.abs(u - 0.38) < 0.012 || Math.abs(u - 0.62) < 0.012) return claro;
    return col.slice();
  }
  return null;
}

function perfilarCapa(out, mapa) {
  for (let y = 0; y < LIENZO_H; y++) {
    for (let x = 0; x < LIENZO_W; x++) {
      if (!mapa[y * LIENZO_W + x]) continue;
      let orilla = false;
      for (let k = 0; k < 4; k++) {
        const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0);
        const ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= LIENZO_W || ny >= LIENZO_H || !mapa[ny * LIENZO_W + nx]) { orilla = true; break; }
      }
      if (!orilla) continue;
      const i = (y * LIENZO_W + x) * 4;
      out[i] = clamp8(out[i] * 0.42);
      out[i + 1] = clamp8(out[i + 1] * 0.42);
      out[i + 2] = clamp8(out[i + 2] * 0.42);
    }
  }
}

export function capaSobreSkin(px, puesto) {
  const out = new Uint8ClampedArray(PIXELES);
  if (!px || px.length !== PIXELES || !puesto || !puesto.tipo) return out;
  const caja = cajaOpaca(px);
  if (!caja) return out;
  const col = rgbDe(puesto.color || [255, 255, 255]);
  const borde = rgbDe(puesto.borde || col);
  const ancho = Math.max(1, caja.maxX - caja.minX + 1);
  const alto = Math.max(1, caja.maxY - caja.minY + 1);
  const tipo = puesto.tipo;
  const tintaDe = tipo === 'gorra' ? tintaGorra
    : tipo === 'chaqueta' ? tintaChaqueta
    : tipo === 'poleron' ? tintaPoleron
    : tipo === 'camuflaje' ? tintaCamuflaje
    : tipo === 'armadura' ? tintaArmadura
    : null;
  const mapa = new Uint8Array(LIENZO_W * LIENZO_H);
  for (let y = caja.minY; y <= caja.maxY; y++) {
    for (let x = caja.minX; x <= caja.maxX; x++) {
      if (!opacoEn(px, x, y)) continue;
      const u = (x - caja.minX) / ancho;
      const v = (y - caja.minY) / alto;
      const tinta = tintaDe ? tintaDe(u, v, col, borde, x, y) : col;
      if (!tinta) continue;
      const i = (y * LIENZO_W + x) * 4;
      out[i] = tinta[0]; out[i + 1] = tinta[1]; out[i + 2] = tinta[2]; out[i + 3] = 255;
      mapa[y * LIENZO_W + x] = 1;
    }
  }
  dejarVerElDibujo(px, out, mapa);
  perfilarCapa(out, mapa);
  return out;
}

// Con un palo blanco, la prenda no se come el dibujo: el brazo y el amarillo
// siguen del color pintado, y la tela solo ocupa una franja del cuerpo.
function esAmarillo(px, x, y) {
  if (!opacoEn(px, x, y)) return false;
  const i = (y * LIENZO_W + x) * 4;
  const r = px[i], g = px[i + 1], b = px[i + 2];
  return r > 180 && g > 140 && b < 140 && g > b + 40;
}

function dejarVerElDibujo(px, out, mapa) {
  const info = detectarBrazoBlanco(px);
  if (!info) return;
  let minY = LIENZO_H, maxY = -1;
  for (let y = 0; y < LIENZO_H; y++) {
    for (let x = 0; x < LIENZO_W; x++) {
      if (!opacoEn(px, x, y) || info.mask[y * LIENZO_W + x]) continue;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const alto = Math.max(1, maxY - minY);
  for (let y = 0; y < LIENZO_H; y++) {
    for (let x = 0; x < LIENZO_W; x++) {
      const p = y * LIENZO_W + x;
      if (!mapa[p]) continue;
      const v = (y - minY) / alto;
      if (info.mask[p] || esAmarillo(px, x, y) || v < 0.38 || v > 0.62) {
        const i = p * 4;
        out[i] = 0; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 0;
        mapa[p] = 0;
      }
    }
  }
}

export function dentroDeSilueta(capa, px) {
  if (!capa || !px || capa.length !== px.length) return false;
  for (let i = 3; i < capa.length; i += 4) {
    if (capa[i] > 0 && px[i] < UMBRAL) return false;
  }
  return true;
}

export function mezclarSobreSkin(base, capa, fuerza) {
  const out = new Uint8ClampedArray(base);
  const f = fuerza == null ? 0.78 : Math.max(0, Math.min(1, fuerza));
  if (!base || !capa || capa.length !== base.length) return out;
  for (let i = 0; i < base.length; i += 4) {
    if (base[i + 3] < UMBRAL || capa[i + 3] === 0) continue;
    out[i] = Math.round(base[i] * (1 - f) + capa[i] * f);
    out[i + 1] = Math.round(base[i + 1] * (1 - f) + capa[i + 1] * f);
    out[i + 2] = Math.round(base[i + 2] * (1 - f) + capa[i + 2] * f);
    out[i + 3] = base[i + 3];
  }
  return out;
}

// La prenda tapa solo sus píxeles. Donde no hay tela queda el color del dibujo,
// y un agujero (alfa bajo) sigue vacío.
export function vestirSobreSkin(base, capa) {
  const out = new Uint8ClampedArray(base || 0);
  if (!base || !capa || capa.length !== base.length) return out;
  for (let i = 0; i < base.length; i += 4) {
    if (base[i + 3] < UMBRAL || capa[i + 3] === 0) continue;
    out[i] = capa[i];
    out[i + 1] = capa[i + 1];
    out[i + 2] = capa[i + 2];
    out[i + 3] = base[i + 3];
  }
  return out;
}

// Las manos son los costados del dibujo (en un queso, el borde izquierdo
// y el derecho). La pose es la de siempre: delante del cuerpo, una a cada lado.
export const POSE_MANO = Object.freeze({
  derecha: Object.freeze({ x: 0.42, y: -0.52, z: -1.02, tam: 0.36, rotX: 0.22, rotY: 0.32, rotZ: -0.4 }),
  izquierda: Object.freeze({ x: -0.36, y: -0.5, z: -0.98, tam: 0.32, rotX: 0.18, rotY: -0.3, rotZ: 0.34 }),
});

// El golpe va de 1 a 0 (vmSwing). En los extremos la mano está en reposo
// y a la mitad queda del todo adelante. Adelante es Z más chica.
export const GOLPE_ADELANTE = 0.55;
export function avanceDeGolpe(sw) {
  const t = Math.max(0, Math.min(1, Number(sw) || 0));
  return Math.sin(t * Math.PI);
}

// Giro del brazo derecho al pegar. En los extremos está en reposo y a la
// mitad queda adelante (X negativa: el brazo cuelga y sale hacia la cara).
export function giroDeGolpe(sw) {
  const a = avanceDeGolpe(sw);
  return { x: -1.5 * a, y: 0, z: -0.45 * a };
}

// El paso normal abre los brazos 0.6. Correr abre más y al revés entre lados.
export const PASO_BRAZO = 0.6;
export const CORRER_BRAZO = 1.25;
export function poseCorrer(fase) {
  const s = Math.sin(fase);
  return {
    armL: -s * CORRER_BRAZO,
    armR: s * CORRER_BRAZO,
    legL: s * CORRER_BRAZO,
    legR: -s * CORRER_BRAZO,
    armZL: s < 0 ? -0.22 * s : 0,
    armZR: s > 0 ? -0.22 * s : 0,
  };
}

// Al subir, brazos arriba y rodillas encogidas. Al caer, el cuerpo se abre un poco.
export function poseSaltar(vy) {
  if ((Number(vy) || 0) >= 0) {
    return { armL: -2.4, armR: -2.4, legL: -1.1, legR: -1.1, armZL: 0.5, armZR: -0.5 };
  }
  return { armL: -0.85, armR: -0.85, legL: 0.35, legR: -0.2, armZL: 0.2, armZR: -0.2 };
}

// Al tocar el suelo los brazos vibran un instante y después quedan quietos.
export const VIBRA_ATERRIZAJE = 0.34;
export function vibrarBrazos(t, dur) {
  const d = dur == null ? VIBRA_ATERRIZAJE : dur;
  if (!(t >= 0) || !(d > 0) || t >= d) return 0;
  const env = Math.cos((t / d) * Math.PI * 0.5);
  return Math.sin(t * 62 + 1.15) * 0.48 * env;
}

function recortarZona(px, x0, y0, w, h) {
  const out = new Uint8ClampedArray(w * h * 4);
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = x0 + x, sy = y0 + y;
      if (!opacoEn(px, sx, sy)) continue;
      const s = (sy * LIENZO_W + sx) * 4;
      const d = (y * w + x) * 4;
      out[d] = px[s]; out[d + 1] = px[s + 1]; out[d + 2] = px[s + 2]; out[d + 3] = px[s + 3];
      n++;
    }
  }
  return { px: out, w, h, x: x0, y: y0, n };
}

// La mano de primera persona, cuando el dibujo trae palo blanco: ese palo
// con su punta roja, no un costado cualquiera del cuerpo.
export function recorteBrazoBlanco(px) {
  const info = detectarBrazoBlanco(px);
  if (!info) return null;
  let minX = LIENZO_W, minY = LIENZO_H, maxX = -1, maxY = -1, n = 0;
  for (let y = 0; y < LIENZO_H; y++) {
    for (let x = 0; x < LIENZO_W; x++) {
      if (!info.mask[y * LIENZO_W + x]) continue;
      n++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (!n) return null;
  minX = Math.max(0, minX - 1);
  minY = Math.max(0, minY - 1);
  maxX = Math.min(LIENZO_W - 1, maxX + 1);
  maxY = Math.min(LIENZO_H - 1, maxY + 1);
  const rec = recortarZona(px, minX, minY, maxX - minX + 1, maxY - minY + 1);
  rec.brazoBlanco = true;
  return rec;
}

export function recorteManos(px) {
  const vacio = () => ({ px: new Uint8ClampedArray(0), w: 0, h: 0, x: 0, y: 0, n: 0 });
  const caja = px && cajaOpaca(px);
  if (!caja) return { izquierda: vacio(), derecha: vacio() };
  const ancho = caja.maxX - caja.minX + 1;
  const alto = caja.maxY - caja.minY + 1;
  const corte = Math.min(ancho, Math.max(4, Math.round(ancho * 0.22)));
  const y0 = caja.minY + Math.floor(alto * 0.30);
  const y1 = caja.minY + Math.floor(alto * 0.72);
  const h = Math.max(1, y1 - y0 + 1);
  return {
    izquierda: recortarZona(px, caja.minX, y0, corte, h),
    derecha: recortarZona(px, caja.maxX - corte + 1, y0, corte, h),
  };
}

export const CARTEL_W = 256;
export const CARTEL_H = 340;
export const CARTEL_RETRATO = Object.freeze({ x: 58, y: 78, w: 140, h: 148 });

function ponerPix(buf, w, x, y, rgba) {
  if (x < 0 || y < 0 || x >= w) return;
  const i = (y * w + x) * 4;
  if (i < 0 || i + 3 >= buf.length) return;
  buf[i] = rgba[0]; buf[i + 1] = rgba[1]; buf[i + 2] = rgba[2]; buf[i + 3] = rgba[3];
}

function relleno(buf, w, x, y, rw, rh, rgba) {
  for (let yy = 0; yy < rh; yy++) {
    for (let xx = 0; xx < rw; xx++) ponerPix(buf, w, x + xx, y + yy, rgba);
  }
}

function blitSkin(out, px, caja, dest) {
  const sw = caja.maxX - caja.minX + 1;
  const sh = caja.maxY - caja.minY + 1;
  const margen = 8;
  const dw = Math.max(1, dest.w - margen * 2);
  const dh = Math.max(1, dest.h - margen * 2);
  const escala = Math.min(dw / sw, dh / sh);
  const rw = Math.max(1, Math.round(sw * escala));
  const rh = Math.max(1, Math.round(sh * escala));
  const ox = dest.x + Math.floor((dest.w - rw) / 2);
  const oy = dest.y + Math.floor((dest.h - rh) / 2);
  for (let y = 0; y < rh; y++) {
    const sy = caja.minY + Math.min(sh - 1, Math.floor(y / escala));
    for (let x = 0; x < rw; x++) {
      const sx = caja.minX + Math.min(sw - 1, Math.floor(x / escala));
      const s = (sy * LIENZO_W + sx) * 4;
      if (px[s + 3] < UMBRAL) continue;
      ponerPix(out, CARTEL_W, ox + x, oy + y, [px[s], px[s + 1], px[s + 2], 255]);
    }
  }
}

// El cartel SE BUSCA. Sin skin, la cara de siempre. Con skin, ese dibujo
// (un queso se ve como queso) en el retrato, sin la cara humana.
export function cartelSeBusca(px) {
  const out = new Uint8ClampedArray(CARTEL_W * CARTEL_H * 4);
  relleno(out, CARTEL_W, 0, 0, CARTEL_W, CARTEL_H, [247, 241, 223, 255]);
  const marco = [28, 25, 23, 255];
  relleno(out, CARTEL_W, 0, 0, CARTEL_W, 8, marco);
  relleno(out, CARTEL_W, 0, CARTEL_H - 8, CARTEL_W, 8, marco);
  relleno(out, CARTEL_W, 0, 0, 8, CARTEL_H, marco);
  relleno(out, CARTEL_W, CARTEL_W - 8, 0, 8, CARTEL_H, marco);
  if (!(px && esDistinta(px))) {
    relleno(out, CARTEL_W, 78, 84, 100, 28, [59, 43, 31, 255]);
    relleno(out, CARTEL_W, 78, 104, 100, 100, [224, 172, 105, 255]);
    relleno(out, CARTEL_W, 96, 132, 22, 16, [248, 250, 252, 255]);
    relleno(out, CARTEL_W, 138, 132, 22, 16, [248, 250, 252, 255]);
    relleno(out, CARTEL_W, 104, 134, 10, 12, [31, 41, 55, 255]);
    relleno(out, CARTEL_W, 146, 134, 10, 12, [31, 41, 55, 255]);
    relleno(out, CARTEL_W, 112, 176, 32, 8, [127, 58, 53, 255]);
    return out;
  }
  const caja = cajaOpaca(px);
  if (caja) blitSkin(out, px, caja, CARTEL_RETRATO);
  return out;
}
