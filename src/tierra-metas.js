// Tierra grande: reglas del medio juego que comparten el juego y las pruebas.
// - Escalera de metas ($75.000 → $800.000), tras los desbloqueos de la tienda.
// - Barrio que crece: lotes del condominio que se compran y se arriendan.
// - Pedidos de los vecinos (tablero de la conserjería).
// - Gastos grandes para la plata de arriba y el tope del interés del banco.

// ---- ESCALERA DE METAS -------------------------------------------------
// `at` es el total ganado que la desbloquea; `precio` lo que cuesta ponerla.
export const META_BASE = 50000;   // hasta aquí llegan los desbloqueos de la tienda
export const METAS = Object.freeze([
  Object.freeze({ id: 'piscina', at: 75000, precio: 12000, icono: '🏊', nombre: 'Piscina de la quinta',
    desc: 'Chapuzón con E: te sana al tiro, y cerca de la piscina recuperas vida sola.' }),
  Object.freeze({ id: 'garaje', at: 100000, precio: 18000, icono: '🚗', nombre: 'Garaje con portón',
    desc: 'El portón se abre solo. Tus autos y motos se reparan y cargan bencina adentro.' }),
  Object.freeze({ id: 'torre', at: 150000, precio: 25000, icono: '🗼', nombre: 'Torre de vigilancia',
    desc: 'Los guardias de la torre te regalan 3 torretas láser para defender tu casa.' }),
  Object.freeze({ id: 'helipuerto', at: 250000, precio: 30000, icono: '🚁', nombre: 'Helipuerto y helicóptero',
    desc: 'Un helicóptero tuyo, estacionado en el helipuerto de la quinta.' }),
  Object.freeze({ id: 'mansion', at: 400000, precio: 60000, icono: '🏰', nombre: 'Mansión de 3 pisos',
    desc: 'Se ve desde lejos y paga $900 cada noche por eventos y arriendos de salones.' }),
  Object.freeze({ id: 'estatua', at: 600000, precio: 40000, icono: '🗽', nombre: 'Estatua tuya en la Plaza Central',
    desc: 'Todos te reconocen: +3 de confianza del barrio y $600 de propinas cada noche.' }),
  Object.freeze({ id: 'boveda', at: 800000, precio: 80000, icono: '🏦', nombre: 'Bóveda privada',
    desc: 'Sube el tope del interés del banco: tu plata ahorrada rinde mucho más.' }),
]);
export const META_INGRESO = Object.freeze({ mansion: 900, estatua: 600 });

export function metaPorId(id) { return METAS.find(m => m.id === id) || null; }
export function metasAlcanzadas(totalGanado) { return METAS.filter(m => (totalGanado || 0) >= m.at); }
export function proximaMeta(totalGanado) { return METAS.find(m => (totalGanado || 0) < m.at) || null; }
// Avance entre la meta anterior (o los $50.000) y la que viene.
export function avanceDeMetas(totalGanado) {
  const total = Math.max(0, totalGanado || 0);
  const sig = proximaMeta(total);
  if (!sig) return { sig: null, falta: 0, pct: 100 };
  const idx = METAS.indexOf(sig);
  const desde = idx === 0 ? META_BASE : METAS[idx - 1].at;
  const pct = Math.max(0, Math.min(100, Math.round(((total - desde) / (sig.at - desde)) * 100)));
  return { sig, falta: sig.at - total, pct };
}

// ---- BANCO: interés con tope -------------------------------------------
export const BANCO = Object.freeze({ tasa: 0.05, topeBase: 2500, topeBoveda: 6000 });
export function topeInteres(tieneBoveda) { return tieneBoveda ? BANCO.topeBoveda : BANCO.topeBase; }
// El 5% de lo ahorrado, pero nunca más que el tope de la noche.
export function interesNocturno(ahorro, tieneBoveda) {
  const base = Math.max(0, Math.round((ahorro || 0) * BANCO.tasa));
  const tope = topeInteres(tieneBoveda);
  return { monto: Math.min(base, tope), topado: base > tope, tope };
}
export function ahorroDondeTopa(tieneBoveda) { return Math.round(topeInteres(tieneBoveda) / BANCO.tasa); }

// ---- BARRIO QUE CRECE --------------------------------------------------
export const LOTE_VACIO_PRECIO = 12000;   // el terreno en venta que no elegiste: viene sin casa
export const VECINOS_DE_LOTE = Object.freeze({
  sur2: 'Doña Rosa', sur3: 'Don Hernán', nor1: 'la señora Marta', nor2: 'Don Lucho',
});
export const FAMILIAS_NUEVAS = Object.freeze(['Rojas', 'Soto', 'Muñoz', 'Araya', 'Fuentes', 'Vera', 'Pizarro', 'Contreras']);
const aMultiplo = (n, m) => Math.round(n / m) * m;
export function precioLote(lote) {
  if (!lote) return 0;
  if (lote.venta) return LOTE_VACIO_PRECIO;
  return aMultiplo(8000 + lote.w * lote.d * 180, 500);
}
export function rentaLote(lote) { return Math.max(50, aMultiplo(precioLote(lote) * 0.028, 50)); }
export function nivelConfianza(reputacion) { return Math.max(0, Math.min(5, Math.floor((reputacion || 0) / 3))); }
export function bonoConfianza(reputacion) { return 1 + 0.05 * nivelConfianza(reputacion); }
// Cada lote que sumas hace que los demás paguen un 10% más (el barrio vale más).
export function rentaNocturna(lotes, reputacion) {
  const n = lotes ? lotes.length : 0;
  if (!n) return 0;
  const suma = lotes.reduce((a, l) => a + rentaLote(l), 0);
  return Math.round(suma * (1 + 0.1 * (n - 1)) * bonoConfianza(reputacion));
}

// ---- PEDIDOS DE LOS VECINOS --------------------------------------------
export const PEDIDO_TIPOS = Object.freeze({
  tomates: Object.freeze({ icono: '🍅', corto: 'Tomates' }),
  caja: Object.freeze({ icono: '📦', corto: 'La caja' }),
  reja: Object.freeze({ icono: '🔨', corto: 'La reja' }),
});
export const REJA_GOLPES = 3;
const barajar = (arr, azar) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// vecinos: [{ lote, nombre }]. Siempre salen los tres tipos, con vecinos distintos mientras alcancen.
export function generarPedidos(noche, etapa, vecinos, azar = Math.random) {
  if (!vecinos || !vecinos.length) return [];
  const gente = barajar(vecinos, azar);
  const tipos = barajar(Object.keys(PEDIDO_TIPOS), azar);
  const sube = 1 + 0.04 * Math.min(25, Math.max(1, etapa || 1) - 1);
  return tipos.map((tipo, i) => {
    const v = gente[i % gente.length];
    const p = { id: 'n' + noche + '-' + tipo, tipo, lote: v.lote, vecino: v.nombre, estado: 'nuevo', paso: '', prog: 0 };
    if (tipo === 'tomates') { p.n = 4 + Math.floor(azar() * 3); p.pago = Math.round((260 + 45 * p.n) * sube); }
    else if (tipo === 'caja') p.pago = Math.round(450 * sube);
    else { p.n = REJA_GOLPES; p.pago = Math.round(340 * sube); }
    return p;
  });
}
export function pagoPedido(p, reputacion) { return Math.round((p ? p.pago : 0) * bonoConfianza(reputacion)); }
export function textoPedido(p) {
  if (!p) return '';
  if (p.tipo === 'tomates') return 'Tráeme ' + p.n + ' tomates';
  if (p.tipo === 'caja') return 'Lleva esta caja al banco';
  return 'Arréglame la reja';
}

// ---- GASTOS QUE VALEN LA PENA ------------------------------------------
export const GASTOS = Object.freeze({
  mall: Object.freeze({ precio: 300000, renta: 2500, icono: '🏬', nombre: 'Comprar el Mall del Sur',
    desc: 'Pasas a ser el dueño: cartel dorado en la puerta y $2.500 de arriendo de locales cada noche.' }),
  estadio: Object.freeze({ precio: 450000, renta: 3200, icono: '🏟️', nombre: 'Estadio propio',
    desc: 'Se levanta con tu nombre. Las entradas dejan $3.200 por noche y puedes dar un partido de gala.' }),
  fiesta: Object.freeze({ precio: 25000, cada: 3, icono: '🎉', nombre: 'Fiesta del barrio',
    desc: 'Fuegos artificiales y música: +2 de confianza y los invitados dejan propinas esa noche.' }),
});
export const PARTIDO_GALA = 1500;
export const JUEGOS_PARQUE = Object.freeze([
  Object.freeze({ id: 'barco', precio: 30000, extra: 60, icono: '🏴‍☠️', nombre: 'Barco pirata', desc: 'Se mece de lado a lado: +$60 por visitante.' }),
  Object.freeze({ id: 'pulpo', precio: 45000, extra: 80, icono: '🐙', nombre: 'Pulpo giratorio', desc: 'Brazos que giran con góndolas: +$80 por visitante.' }),
  Object.freeze({ id: 'tazas', precio: 20000, extra: 35, icono: '☕', nombre: 'Tazas locas', desc: 'Tazas que dan vueltas: +$35 por visitante.' }),
]);
export function juegoPorId(id) { return JUEGOS_PARQUE.find(j => j.id === id) || null; }
// Lo que dejan los juegos nuevos en un día del parque.
export function bonoJuegos(visitantes, comprados) {
  const v = Math.max(0, visitantes || 0);
  let extra = 0;
  for (const j of JUEGOS_PARQUE) if (comprados && comprados[j.id]) extra += j.extra;
  return Math.round(v * extra);
}
export function fiestaLista(noche, ultima) { return (noche || 0) - (ultima == null ? -99 : ultima) >= GASTOS.fiesta.cada; }
export function propinasFiesta(nLotes) { return 600 + 400 * (nLotes || 0); }

// ---- LO QUE PAGA CADA NOCHE --------------------------------------------
// metas: { mansion:true, estatua:true… } · gastos: { mall, estadio } · lotes: [lote] · fiestaPendiente: bool
export function ingresosDeLaNoche({ metas, gastos, lotes, reputacion, fiestaPendiente }) {
  const partes = [];
  const renta = rentaNocturna(lotes || [], reputacion);
  if (renta) partes.push({ id: 'arriendos', icono: '🏘️', texto: 'Arriendos del barrio', monto: renta });
  for (const id of Object.keys(META_INGRESO)) if (metas && metas[id]) partes.push({ id, icono: metaPorId(id).icono, texto: metaPorId(id).nombre, monto: META_INGRESO[id] });
  if (gastos && gastos.mall) partes.push({ id: 'mall', icono: '🏬', texto: 'Locales del Mall', monto: GASTOS.mall.renta });
  if (gastos && gastos.estadio) partes.push({ id: 'estadio', icono: '🏟️', texto: 'Entradas del estadio', monto: GASTOS.estadio.renta });
  if (fiestaPendiente) partes.push({ id: 'fiesta', icono: '🎉', texto: 'Propinas de la fiesta', monto: propinasFiesta((lotes || []).length) });
  return { partes, total: partes.reduce((a, p) => a + p.monto, 0) };
}
