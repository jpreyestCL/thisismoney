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

export const DISTRITOS = Object.freeze([
  ...CENTRO_URBANO.map(([id, nombre, icono, x, z, tipo]) =>
    Object.freeze({ id, nombre, icono, x, z, w: MANZANA, d: MANZANA, tipo })),
  ...ANILLO.map(([id, nombre, icono, x, z]) =>
    Object.freeze({ id, nombre, icono, x, z, w: BANDA, d: BANDA, tipo: 'casas' })),
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
  spawnMama: Object.freeze({ x: 18, z: 26, distrito: 'casa' }),
  super: Object.freeze({ x: 28, z: -30, distrito: 'comercial' }),
  banco: Object.freeze({ x: 12, z: -15, distrito: 'comercial' }),
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
});

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
  return problemas;
}
