// ===================================================================
//  MAPA DE LA CIUDAD  —  una sola fuente de la verdad
//  Aquí vive el trazado completo de la Tierra: las avenidas, los
//  barrios/distritos y el punto exacto de cada lugar (súper, banco,
//  estadios, parques, playa, aeropuerto...).
//  index.html lo importa para construir el mundo y tests/city-map.test.mjs
//  lo revisa para que NADA se atraviese con nada.
//
//  Convención del mundo: +x ESTE, -x OESTE, +z NORTE, -z SUR.
// ===================================================================

// Calzada de 9 (dos pistas) con vereda a cada lado.
export const CALLE = Object.freeze({ ancho: 9, vereda: 2.6 });
export const MEDIA_CALLE = CALLE.ancho / 2 + CALLE.vereda;   // 7.1: asfalto + vereda

// Las avenidas forman una cuadrícula tipo GTA. El anillo (±150) es la
// autopista que rodea la ciudad; de ahí salen los ramales a las afueras.
const EJES = [-150, -110, -55, 0, 55, 110, 150];
const BORDE = 150;

function avenidasBase() {
  const lista = [];
  for (const at of EJES) {
    const anillo = Math.abs(at) === BORDE;   // la autopista que rodea la ciudad
    lista.push({ id: 'av_v' + at, eje: 'v', at, desde: -BORDE, hasta: BORDE, anillo });
    lista.push({ id: 'av_h' + at, eje: 'h', at, desde: -BORDE, hasta: BORDE, anillo });
  }
  return lista;
}

// Ramales: calles cortas que conectan el anillo con cada lugar de las afueras.
const RAMALES = [
  { id: 'ramal_aeropuerto', eje: 'v', at: -30, desde: 150, hasta: 172, ramal: 'aeropuerto' },
  { id: 'ramal_acuatico', eje: 'v', at: 100, desde: 150, hasta: 176, ramal: 'acuatico' },
  { id: 'ramal_diversiones', eje: 'h', at: 70, desde: 150, hasta: 168, ramal: 'diversiones' },
  { id: 'ramal_desierto_este', eje: 'h', at: -80, desde: 150, hasta: 180, ramal: 'desiertoEste' },
  { id: 'ramal_playa', eje: 'h', at: -40, desde: -162, hasta: -150, ramal: 'playa' },
  { id: 'ramal_dunas', eje: 'h', at: 100, desde: -182, hasta: -150, ramal: 'dunasNorte' },
  // Sale de la autopista sur (z -150) y termina ANTES del edificio: el ramal
  // puede entrar al distrito, pero la caja del mall queda al sur del asfalto.
  { id: 'ramal_mall', eje: 'v', at: 0, desde: -174, hasta: -150, ramal: 'mall' },
];

export const AVENIDAS = Object.freeze([...avenidasBase(), ...RAMALES].map(Object.freeze));

// Los semáforos van en los nueve cruces del centro.
export const SEMAFOROS = Object.freeze(
  [-55, 0, 55].flatMap(x => [-55, 0, 55].map(z => Object.freeze({ x, z })))
);

// ---- DISTRITOS -----------------------------------------------------
// Cada manzana de la ciudad tiene un uso. `w`/`d` es el terreno que ocupa
// (ya descontadas las veredas), así que nada puede salirse de ahí.
const MANZANA = 40;   // manzana del centro (entre avenidas separadas 55)
const BANDA = 25;     // manzana del anillo (entre la avenida 110 y la autopista 150)

const CENTRO_URBANO = [
  ['casa', 'Tu barrio', '🏠', 27.5, 27.5, 'hogar'],
  ['plaza', 'Plaza Central', '⛲', -27.5, 27.5, 'plaza'],
  ['comercial', 'Centro comercial', '🛒', 27.5, -27.5, 'comercio'],
  ['centro', 'Centro · rascacielos', '🏙️', -27.5, -27.5, 'torres'],
  ['futbol', 'Estadio de fútbol', '⚽', 82.5, 27.5, 'deporte'],
  ['carcel', 'Cárcel y comisaría', '🚔', 82.5, -27.5, 'civico'],
  ['barrioEste', 'Barrio Este', '🏘️', 82.5, 82.5, 'casas'],
  ['arcade', 'Arcade familiar', '🎮', 82.5, -82.5, 'ocio'],
  ['basquet', 'Estadio de básquet', '🏀', 27.5, 82.5, 'deporte'],
  ['tenis', 'Estadio de tenis', '🎾', -27.5, 82.5, 'deporte'],
  ['parque', 'Parque del condominio', '🌳', -82.5, 82.5, 'parque'],
  ['barrioOesteNorte', 'Barrio Oeste Norte', '🏘️', -82.5, 27.5, 'casas'],
  ['barrioOesteSur', 'Barrio Oeste Sur', '🏘️', -82.5, -27.5, 'casas'],
  ['armeria', 'Armería y taller', '🔫', -82.5, -82.5, 'comercio'],
  ['barrioSur', 'Barrio Sur', '🏘️', -27.5, -82.5, 'casas'],
  ['oficinas', 'Oficinas del Sur', '🏢', 27.5, -82.5, 'torres'],
];

const ANILLO = [
  ['barrioNoreste', 'Barrio Noreste', '🏘️', 130, 130],
  ['barrioNoroeste', 'Barrio Noroeste', '🏘️', -130, 130],
  ['barrioSureste', 'Barrio Sureste', '🏘️', 130, -130],
  ['barrioSuroeste', 'Barrio Suroeste', '🏘️', -130, -130],
];

const AFUERAS = [
  { id: 'aeropuerto', nombre: 'Aeropuerto', icono: '✈️', x: -30, z: 220, w: 150, d: 110, tipo: 'aeropuerto' },
  { id: 'acuatico', nombre: 'Parque acuático', icono: '🏊', x: 100, z: 208, w: 76, d: 70, tipo: 'parque' },
  { id: 'diversiones', nombre: 'Parque de diversiones', icono: '🎡', x: 215, z: 70, w: 104, d: 104, tipo: 'parque' },
  { id: 'desiertoEste', nombre: 'Desierto del Este', icono: '🌵', x: 215, z: -80, w: 76, d: 76, tipo: 'natural' },
  { id: 'playa', nombre: 'Playa y costa', icono: '🏖️', x: -208, z: -40, w: 94, d: 78, tipo: 'natural' },
  { id: 'dunasNorte', nombre: 'Dunas del Noroeste', icono: '🌵', x: -215, z: 100, w: 76, d: 76, tipo: 'natural' },
];

// El banco tiene manzana propia, al este de la cárcel y pegado a la avenida
// del norte. Antes compartía el centro comercial y su espalda tapaba la
// puerta del súper. El resto de esa manzana sigue siendo área verde.
const BANCO = Object.freeze({
  id: 'banco', nombre: 'Banco Central', icono: '🏦', x: 130, z: -17, w: 24, d: 16, tipo: 'civico',
});

// Edificio de departamentos en la franja libre del norte (entre la avenida 110
// y la autopista del anillo), con la entrada mirando a la avenida del sur.
const TORRE = Object.freeze({
  id: 'torre', nombre: 'Edificio Mirador', icono: '🏢', x: -27.5, z: 130, w: 36, d: 24, tipo: 'residencial',
});

// Mall gigante al SUR del anillo, en terreno que no es de nadie: no toca
// calles, veredas, manzanas, el condominio, el banco, la cárcel, el Mirador
// ni las afueras que ya existen. El edificio va metido en el distrito; el
// ramal llega a la puerta y se queda al norte de la fachada.
export const MALL = Object.freeze({
  id: 'mall', nombre: 'Mall del Sur', icono: '🏬', x: 0, z: -198, w: 108, d: 64, tipo: 'comercio',
  edificio: Object.freeze({ x: 0, z: -203, w: 92, d: 40, h: 7.4 }),
  puerta: Object.freeze({ x: 0, z: -180.2 }),
  adentro: Object.freeze({ x: 0, z: -186.2 }),
});

export const DISTRITOS = Object.freeze([
  ...CENTRO_URBANO.map(([id, nombre, icono, x, z, tipo]) =>
    Object.freeze({ id, nombre, icono, x, z, w: MANZANA, d: MANZANA, tipo })),
  ...ANILLO.map(([id, nombre, icono, x, z]) =>
    Object.freeze({ id, nombre, icono, x, z, w: BANDA, d: BANDA, tipo: 'casas' })),
  BANCO,
  TORRE,
  MALL,
  ...AFUERAS.map(Object.freeze),
]);

// ---- LUGARES -------------------------------------------------------
// El punto exacto donde se construye cada cosa, siempre dentro de su distrito.
export const LUGARES = Object.freeze({
  casa: Object.freeze({ x: 14, z: 14, distrito: 'casa' }),
  base: Object.freeze({ x: 22, z: 22, distrito: 'casa' }),
  cohete: Object.freeze({ x: 12, z: 10, distrito: 'casa' }),
  spawn: Object.freeze({ x: 10, z: 16, distrito: 'casa' }),
  spawnPapa: Object.freeze({ x: 12, z: 13, distrito: 'casa' }),
  spawnMama: Object.freeze({ x: 15.5, z: 18.5, distrito: 'casa' }),   // en la explanada común del condominio
  super: Object.freeze({ x: 28, z: -35, distrito: 'comercial' }),   // al fondo de su manzana, con la puerta libre hacia el norte
  banco: Object.freeze({ x: 130, z: -17, distrito: 'banco' }),      // manzana propia al este: no tapa el súper ni la calle
  torre: Object.freeze({ x: -27.5, z: 130, distrito: 'torre' }),    // edificio de departamentos (ascensor, escalera y deptos a la venta)
  entregaAutos: Object.freeze({ x: 42, z: -44, distrito: 'comercial' }),
  armeria: Object.freeze({ x: -82, z: -86, distrito: 'armeria' }),
  gasolinera: Object.freeze({ x: -33, z: 18, distrito: 'plaza' }),
  ranking: Object.freeze({ x: -18, z: 38, distrito: 'plaza' }),
  fuente: Object.freeze({ x: -34, z: 38, distrito: 'plaza' }),
  carcel: Object.freeze({ x: 82, z: -27, distrito: 'carcel' }),
  arcade: Object.freeze({ x: 82, z: -82, distrito: 'arcade' }),
  estadioFutbol: Object.freeze({ x: 82, z: 27, distrito: 'futbol' }),
  estadioBasquet: Object.freeze({ x: 27, z: 82, distrito: 'basquet' }),
  estadioTenis: Object.freeze({ x: -27, z: 82, distrito: 'tenis' }),
  parqueCondominio: Object.freeze({ x: -82, z: 82, distrito: 'parque' }),
  parqueDiversiones: Object.freeze({ x: 215, z: 70, distrito: 'diversiones' }),
  parqueAcuatico: Object.freeze({ x: 100, z: 208, distrito: 'acuatico' }),
  playa: Object.freeze({ x: -208, z: -40, distrito: 'playa' }),
  aeropuerto: Object.freeze({ x: -30, z: 220, distrito: 'aeropuerto' }),
  desiertoEste: Object.freeze({ x: 215, z: -80, distrito: 'desiertoEste' }),
  desiertoNoroeste: Object.freeze({ x: -215, z: 100, distrito: 'dunasNorte' }),
  mall: Object.freeze({ x: MALL.adentro.x, z: MALL.adentro.z, distrito: 'mall' }),
});

// ---- EL CONDOMINIO DONDE VIVES -------------------------------------
// La manzana `casa` está loteada como un condominio cerrado: casi todos los
// lotes ya tienen vecino y dos están EN VENTA. Para levantar tu casa hay que
// comprar uno primero (el precio vive en index.html, PRECIO_TERRENO).
// La manzana ya llega hasta las avenidas: agrandarla pisaría la calle o el
// estadio. El espacio de más se usa adentro: al noroeste, cancha y resbalines;
// cada lote deja patio atrás para la piscina. El portón, el cohete y el
// punto de aparición siguen en la explanada del suroeste.
const LOTE_SUR = 16.4, LOTE_NORTE = 38.5, FONDO_SUR = 13, FONDO_NORTE = 13.2;
export const CONDOMINIO = Object.freeze({
  distrito: 'casa',
  nombre: 'Condominio Los Aromos',
  pasaje: Object.freeze({ z: 27.5, ancho: 5.2, desde: 8, hasta: 46 }),
  porton: Object.freeze({ x: 9.5, z: 27.5 }),
  comun: Object.freeze({ x: 12.4, z: 16.2, w: 9.2, d: 14.2 }),
  patio: Object.freeze({ frente: 1.6, fondo: 4.6 }),   // antejardín al pasaje y piscina atrás
  cancha: Object.freeze({ x: 14.4, z: 41.3, w: 10.4, d: 7.8 }),
  juegos: Object.freeze({ x: 14.4, z: 34.3, w: 10.4, d: 4.8 }),
  lotes: Object.freeze([
    { id: 'sur1', nombre: 'Lote 1', x: 24.4, z: LOTE_SUR, w: 13.2, d: FONDO_SUR, venta: true },
    { id: 'sur2', nombre: 'Lote 2', x: 35.4, z: LOTE_SUR, w: 7.4, d: FONDO_SUR },
    { id: 'sur3', nombre: 'Lote 3', x: 43.3, z: LOTE_SUR, w: 7.2, d: FONDO_SUR },
    { id: 'nor1', nombre: 'Lote 4', x: 23.2, z: LOTE_NORTE, w: 5.6, d: FONDO_NORTE },
    { id: 'nor2', nombre: 'Lote 5', x: 29.2, z: LOTE_NORTE, w: 5.6, d: FONDO_NORTE },
    { id: 'nor3', nombre: 'Lote 6', x: 39.6, z: LOTE_NORTE, w: 13, d: FONDO_NORTE, venta: true },
  ].map(Object.freeze)),
});

export function lotesEnVenta() { return CONDOMINIO.lotes.filter(l => l.venta); }
export function lotePorId(id) { return CONDOMINIO.lotes.find(l => l.id === id) || null; }
export function loteEn(x, z, margen = 0) {
  for (const l of CONDOMINIO.lotes) {
    if (Math.abs(x - l.x) <= l.w / 2 + margen && Math.abs(z - l.z) <= l.d / 2 + margen) return l;
  }
  return null;
}
export function rectLote(l, margen = 0) {
  return {
    minX: l.x - l.w / 2 - margen, maxX: l.x + l.w / 2 + margen,
    minZ: l.z - l.d / 2 - margen, maxZ: l.z + l.d / 2 + margen,
  };
}
// ¿Estoy dentro del condominio? (la manzana `casa` completa)
export function enCondominio(x, z, margen = 0) {
  const d = DISTRITOS.find(o => o.id === CONDOMINIO.distrito);
  const r = rectDistrito(d, margen);
  return x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ;
}

// Los cerros quedan SIEMPRE fuera del anillo y de las afueras construidas.
export const CERROS = Object.freeze([
  Object.freeze({ x: -250, z: 220, r: 34, h: 40 }),
  Object.freeze({ x: -230, z: -175, r: 26, h: 28 }),
  Object.freeze({ x: 235, z: -195, r: 32, h: 36 }),
  Object.freeze({ x: 40, z: 325, r: 30, h: 34 }),
  Object.freeze({ x: -160, z: 335, r: 26, h: 26 }),
]);

// ---- Ayudantes de geometría ---------------------------------------
export function rectDistrito(d, margen = 0) {
  return {
    minX: d.x - d.w / 2 - margen, maxX: d.x + d.w / 2 + margen,
    minZ: d.z - d.d / 2 - margen, maxZ: d.z + d.d / 2 + margen,
  };
}

export function rectCalle(av, margen = 0) {
  const half = MEDIA_CALLE + margen;
  if (av.eje === 'v') return { minX: av.at - half, maxX: av.at + half, minZ: av.desde - half, maxZ: av.hasta + half };
  return { minX: av.desde - half, maxX: av.hasta + half, minZ: av.at - half, maxZ: av.at + half };
}

export function seCruzan(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

export function distritoEn(x, z, margen = 0) {
  for (const d of DISTRITOS) {
    const r = rectDistrito(d, margen);
    if (x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ) return d;
  }
  return null;
}

// ¿Ese punto cae sobre el asfalto o la vereda? (el pasto y los árboles no crecen ahí)
export function enCalle(x, z, margen = 0) {
  for (const av of AVENIDAS) {
    const r = rectCalle(av, margen);
    if (x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ) return true;
  }
  return false;
}

// Centro de la vereda (mitad del asfalto + mitad de la acera). Ahí caminan
// los peatones, y coincide con la línea de los cruces pintados.
export const EJE_VEREDA = CALLE.ancho / 2 + CALLE.vereda / 2;

function acotar(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Solo la calzada (sin la vereda). El margen negativo deja el bordillo libre.
export function enAsfalto(x, z) {
  const half = CALLE.ancho / 2 - 0.15;
  for (const av of AVENIDAS) {
    if (av.eje === 'v') {
      if (Math.abs(x - av.at) < half && z > av.desde - half && z < av.hasta + half) return true;
    } else if (Math.abs(z - av.at) < half && x > av.desde - half && x < av.hasta + half) return true;
  }
  return false;
}

// Cebra de los nueve semáforos del centro: se puede cruzar por ahí.
export function enCrucePeatonal(x, z) {
  const borde = EJE_VEREDA, grueso = 1.75, alcance = EJE_VEREDA + 0.45;
  for (const c of SEMAFOROS) {
    if (Math.abs(Math.abs(z - c.z) - borde) <= grueso && Math.abs(x - c.x) <= alcance) return true;
    if (Math.abs(Math.abs(x - c.x) - borde) <= grueso && Math.abs(z - c.z) <= alcance) return true;
  }
  return false;
}

// Acera o cebra. El pasto y la calzada (fuera de la cebra) no cuentan.
export function sobreVereda(x, z) {
  return enCrucePeatonal(x, z) || (enCalle(x, z) && !enAsfalto(x, z));
}

// Si el punto está en la calzada (y no en una cebra), lo mueve a la vereda más cercana.
export function corregirAVereda(x, z) {
  if (!enAsfalto(x, z) || enCrucePeatonal(x, z)) return { x, z };
  let best = null, bd = Infinity;
  for (const av of AVENIDAS) {
    if (av.ramal) continue;
    for (const side of [-1, 1]) {
      const px = av.eje === 'v' ? av.at + side * EJE_VEREDA : acotar(x, av.desde, av.hasta);
      const pz = av.eje === 'v' ? acotar(z, av.desde, av.hasta) : av.at + side * EJE_VEREDA;
      if (enAsfalto(px, pz) && !enCrucePeatonal(px, pz)) continue;
      const d = (px - x) ** 2 + (pz - z) ** 2;
      if (d < bd) { bd = d; best = { x: px, z: pz }; }
    }
  }
  return best || { x, z };
}

// Red de veredas del centro: cuatro esquinas por semáforo. Las cuadras unen
// esquinas por la acera; el cruce peatonal une las dos veredas de una misma esquina.
let redVeredaCache = null;
function redDeVeredas() {
  if (redVeredaCache) return redVeredaCache;
  const A = EJE_VEREDA, nodos = [], aristas = [], mapa = new Map();
  const nodo = (x, z) => {
    const k = Math.round(x * 10) + ',' + Math.round(z * 10);
    let n = mapa.get(k);
    if (!n) { n = { x, z, k, vecinos: [] }; mapa.set(k, n); nodos.push(n); }
    return n;
  };
  const une = (a, b, cruce) => {
    if (a === b || a.vecinos.some(v => v.n === b)) return;
    a.vecinos.push({ n: b, cruce }); b.vecinos.push({ n: a, cruce });
    aristas.push({ a, b, cruce });
  };
  for (const c of SEMAFOROS) {
    const ne = nodo(c.x + A, c.z + A), nw = nodo(c.x - A, c.z + A);
    const se = nodo(c.x + A, c.z - A), sw = nodo(c.x - A, c.z - A);
    une(nw, ne, true); une(sw, se, true); une(sw, nw, true); une(se, ne, true);
  }
  const por = (eje) => {
    const m = new Map();
    for (const n of nodos) {
      const k = Math.round(n[eje === 'z' ? 'x' : 'z'] * 10);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(n);
    }
    for (const lista of m.values()) {
      lista.sort((a, b) => a[eje] - b[eje]);
      for (let i = 0; i < lista.length - 1; i++) {
        const gap = Math.abs(lista[i][eje] - lista[i + 1][eje]);
        if (gap > 20 && gap < 70) une(lista[i], lista[i + 1], false);
      }
    }
  };
  por('z'); por('x');
  redVeredaCache = { nodos, aristas };
  return redVeredaCache;
}

function proyectarEnArista(x, z, e) {
  const dx = e.b.x - e.a.x, dz = e.b.z - e.a.z, l2 = dx * dx + dz * dz || 1;
  const t = acotar(((x - e.a.x) * dx + (z - e.a.z) * dz) / l2, 0, 1);
  const px = e.a.x + dx * t, pz = e.a.z + dz * t;
  return { e, x: px, z: pz, t, d: Math.hypot(px - x, pz - z) };
}

// Camino por la vereda (y por la cebra si hay que cruzar) entre dos puntos.
// El resultado es una lista de esquinas: nada de cortar por el asfalto.
export function caminoPorVereda(x0, z0, x1, z1) {
  const { aristas } = redDeVeredas();
  let mejorA = null, mejorB = null;
  for (const e of aristas) {
    const pa = proyectarEnArista(x0, z0, e), pb = proyectarEnArista(x1, z1, e);
    if (!mejorA || pa.d < mejorA.d) mejorA = pa;
    if (!mejorB || pb.d < mejorB.d) mejorB = pb;
  }
  if (!mejorA || !mejorB) return [{ x: x1, z: z1 }];
  const empujar = (pts, x, z) => {
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(last.x - x, last.z - z) > 0.35) pts.push({ x, z });
  };
  if (mejorA.e === mejorB.e) {
    const pts = [];
    empujar(pts, mejorA.x, mejorA.z); empujar(pts, mejorB.x, mejorB.z);
    return pts.length ? pts : [{ x: mejorB.x, z: mejorB.z }];
  }
  const costo = new Map(), prev = new Map(), usados = new Set(), pendientes = [];
  for (const n of [mejorA.e.a, mejorA.e.b]) {
    const c = Math.hypot(n.x - mejorA.x, n.z - mejorA.z);
    if (!costo.has(n) || c < costo.get(n)) { costo.set(n, c); prev.set(n, null); pendientes.push(n); }
  }
  while (pendientes.length) {
    pendientes.sort((a, b) => costo.get(a) - costo.get(b));
    const n = pendientes.shift();
    if (usados.has(n)) continue;
    usados.add(n);
    for (const v of n.vecinos) {
      const c = costo.get(n) + Math.hypot(v.n.x - n.x, v.n.z - n.z);
      if (!costo.has(v.n) || c < costo.get(v.n)) { costo.set(v.n, c); prev.set(v.n, n); pendientes.push(v.n); }
    }
  }
  let llega = null, mejorC = Infinity;
  for (const n of [mejorB.e.a, mejorB.e.b]) {
    if (!costo.has(n)) continue;
    const c = costo.get(n) + Math.hypot(n.x - mejorB.x, n.z - mejorB.z);
    if (c < mejorC) { mejorC = c; llega = n; }
  }
  if (!llega) return [{ x: mejorA.x, z: mejorA.z }, { x: mejorB.x, z: mejorB.z }];
  const nodos = [];
  for (let n = llega; n; n = prev.get(n)) nodos.push(n);
  nodos.reverse();
  if (nodos.length >= 2 && (nodos[0] === mejorA.e.a || nodos[0] === mejorA.e.b) && (nodos[1] === mejorA.e.a || nodos[1] === mejorA.e.b)) nodos.shift();
  if (nodos.length >= 2) {
    const pen = nodos[nodos.length - 2], ult = nodos[nodos.length - 1];
    if (proyectarEnArista(mejorB.x, mejorB.z, { a: pen, b: ult }).d < 0.6) nodos.pop();
  }
  const pts = [];
  empujar(pts, mejorA.x, mejorA.z);
  for (const n of nodos) empujar(pts, n.x, n.z);
  empujar(pts, mejorB.x, mejorB.z);
  return pts;
}

// Un paso a lo largo del tramo a→b. El resultado queda SOBRE el segmento:
// no hay atajo en diagonal ni se sale hacia el pasto.
export function avanzarPorTramo(x, z, ax, az, bx, bz, paso) {
  const dx = bx - ax, dz = bz - az;
  const largo = Math.hypot(dx, dz);
  if (largo < 0.04) return { x: bx, z: bz, llego: true };
  const ux = dx / largo, uz = dz / largo;
  const t = acotar((x - ax) * ux + (z - az) * uz, 0, largo);
  const av = Math.min(Math.max(0, paso), largo - t);
  return { x: ax + ux * (t + av), z: az + uz * (t + av), llego: largo - t - av <= 0.05 };
}

// Formato que consume el juego para dibujar y para el tráfico.
export function callesDelMapa() {
  return AVENIDAS.map(av => ({
    id: av.id,
    cx: av.eje === 'v' ? av.at : (av.desde + av.hasta) / 2,
    cz: av.eje === 'v' ? (av.desde + av.hasta) / 2 : av.at,
    len: av.hasta - av.desde,
    horizontal: av.eje === 'h',
    ramal: !!av.ramal,
    anillo: !!av.anillo,
  }));
}

// Manzanas de la cuadrícula que no le tocaron a ningún distrito: quedan como
// áreas verdes de la ciudad (el juego les planta una arboleda).
export function manzanasLibres() {
  const libres = [];
  for (let i = 0; i < EJES.length - 1; i++) {
    for (let j = 0; j < EJES.length - 1; j++) {
      const x = (EJES[i] + EJES[i + 1]) / 2, z = (EJES[j] + EJES[j + 1]) / 2;
      if (distritoEn(x, z)) continue;
      const w = EJES[i + 1] - EJES[i] - MEDIA_CALLE * 2;
      const d = EJES[j + 1] - EJES[j] - MEDIA_CALLE * 2;
      libres.push({ x, z, w, d });
    }
  }
  return libres;
}

// ---- Validación: que NADA se atraviese con NADA --------------------
export function validarMapa() {
  const problemas = [];
  for (let i = 0; i < DISTRITOS.length; i++) {
    for (let j = i + 1; j < DISTRITOS.length; j++) {
      const a = DISTRITOS[i], b = DISTRITOS[j];
      if (seCruzan(rectDistrito(a), rectDistrito(b))) problemas.push(`El distrito ${a.id} se cruza con ${b.id}`);
    }
  }
  for (const av of AVENIDAS) {
    for (const d of DISTRITOS) {
      if (av.ramal === d.id) continue;   // el ramal entra a propósito a su destino
      if (seCruzan(rectCalle(av), rectDistrito(d))) problemas.push(`La calle ${av.id} pasa por encima de ${d.id}`);
    }
  }
  for (const cerro of CERROS) {
    const r = { minX: cerro.x - cerro.r, maxX: cerro.x + cerro.r, minZ: cerro.z - cerro.r, maxZ: cerro.z + cerro.r };
    for (const d of DISTRITOS) if (seCruzan(r, rectDistrito(d))) problemas.push(`El cerro (${cerro.x},${cerro.z}) tapa ${d.id}`);
    for (const av of AVENIDAS) if (seCruzan(r, rectCalle(av))) problemas.push(`El cerro (${cerro.x},${cerro.z}) tapa la calle ${av.id}`);
  }
  for (const [nombre, lugar] of Object.entries(LUGARES)) {
    const d = DISTRITOS.find(o => o.id === lugar.distrito);
    if (!d) { problemas.push(`El lugar ${nombre} apunta a un distrito que no existe`); continue; }
    const r = rectDistrito(d);
    if (lugar.x <= r.minX || lugar.x >= r.maxX || lugar.z <= r.minZ || lugar.z >= r.maxZ) {
      problemas.push(`El lugar ${nombre} quedó fuera de su distrito ${d.id}`);
    }
    if (enCalle(lugar.x, lugar.z)) problemas.push(`El lugar ${nombre} está sobre una calle`);
  }
  // Cada distrito tiene que tener una calle cerca: si no, no se puede llegar en auto.
  for (const d of DISTRITOS) {
    const r = rectDistrito(d, 30);
    const tieneCalle = AVENIDAS.some(av => seCruzan(rectCalle(av), r));
    if (!tieneCalle) problemas.push(`Al distrito ${d.id} no llega ninguna calle`);
  }
  // El condominio: los lotes no pueden pisarse entre ellos, ni el pasaje, ni la
  // explanada común, ni salirse de la manzana.
  const manzana = DISTRITOS.find(d => d.id === CONDOMINIO.distrito);
  if (!manzana) problemas.push('El condominio apunta a una manzana que no existe');
  else {
    const limite = rectDistrito(manzana);
    const pasaje = {
      minX: CONDOMINIO.pasaje.desde, maxX: CONDOMINIO.pasaje.hasta,
      minZ: CONDOMINIO.pasaje.z - CONDOMINIO.pasaje.ancho / 2, maxZ: CONDOMINIO.pasaje.z + CONDOMINIO.pasaje.ancho / 2,
    };
    const comun = rectLote(CONDOMINIO.comun);
    const zonas = [comun, rectLote(CONDOMINIO.cancha), rectLote(CONDOMINIO.juegos)];
    if (!lotesEnVenta().length) problemas.push('El condominio no tiene ningún lote en venta');
    for (const [nombre, zona] of [['cancha', CONDOMINIO.cancha], ['juegos', CONDOMINIO.juegos], ['explanada', CONDOMINIO.comun]]) {
      const rz = rectLote(zona);
      if (rz.minX < limite.minX || rz.maxX > limite.maxX || rz.minZ < limite.minZ || rz.maxZ > limite.maxZ) {
        problemas.push(`La ${nombre} del condominio se sale de la manzana`);
      }
      if (seCruzan(rz, pasaje)) problemas.push(`La ${nombre} del condominio se come el pasaje`);
      if (AVENIDAS.some(av => seCruzan(rectCalle(av), rz))) problemas.push(`La ${nombre} del condominio da sobre la calle`);
    }
    if (seCruzan(rectLote(CONDOMINIO.cancha), rectLote(CONDOMINIO.juegos))) problemas.push('La cancha se cruza con los juegos');
    for (let i = 0; i < CONDOMINIO.lotes.length; i++) {
      const a = CONDOMINIO.lotes[i], ra = rectLote(a);
      if (ra.minX < limite.minX || ra.maxX > limite.maxX || ra.minZ < limite.minZ || ra.maxZ > limite.maxZ) {
        problemas.push(`El lote ${a.id} se sale de la manzana del condominio`);
      }
      if (seCruzan(ra, pasaje)) problemas.push(`El lote ${a.id} se come el pasaje`);
      if (zonas.some(z => seCruzan(ra, z))) problemas.push(`El lote ${a.id} se come la cancha, los juegos o la explanada`);
      if (AVENIDAS.some(av => seCruzan(rectCalle(av), ra))) problemas.push(`El lote ${a.id} da sobre la calle`);
      for (let j = i + 1; j < CONDOMINIO.lotes.length; j++) {
        if (seCruzan(ra, rectLote(CONDOMINIO.lotes[j]))) problemas.push(`El lote ${a.id} se cruza con ${CONDOMINIO.lotes[j].id}`);
      }
    }
  }
  return problemas;
}
