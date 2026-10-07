// Modo ladrón: reglas puras. El juego normal no las usa.
// La policía de la calle y los guardias del mall comparten la misma vida.

export const VIDA_ZOMBIE = 10;
export const VIDA_POLICIA = 80;          // varias veces la de un zombie
export const PERSECUCION_SEG = 180;      // 3 minutos reales
export const CELDA_LADRON_SEG = 600;     // 10 minutos reales
export const DEUDA_TITO = 500;
export const NOCHES_TITO = 2;
export const LLAMADA_SEG = 8;            // el npc tarda esto en terminar la llamada
export const DELATA_CERCA = 4.8;
export const CAMUFLAJE_FACTOR = 0.07;    // con el traje te reconocen mucho menos
export const CASI_FACTOR = 0.04;         // al empezar casi nadie te reconoce
export const VER_POLICIA = 16;
export const ROBO_ESPERA_SEG = 20;

export const ROPA = Object.freeze([
  Object.freeze({ id: 'camuflaje', name: 'Traje de camuflaje', price: 900, camuflaje: true, color: 0x4a5c2a }),
  Object.freeze({ id: 'chaqueta', name: 'Chaqueta negra', price: 420, camuflaje: false, color: 0x111827 }),
  Object.freeze({ id: 'poleron', name: 'Polerón gris', price: 280, camuflaje: false, color: 0x6b7280 }),
  Object.freeze({ id: 'gorra', name: 'Gorra roja', price: 150, camuflaje: false, color: 0xdc2626 }),
]);

export const BOTIN_TIENDA = Object.freeze([
  Object.freeze({ key: 'food', name: 'comida', n: 1 }),
  Object.freeze({ key: 'semillas', name: 'semillas', n: 1 }),
  Object.freeze({ key: 'carbon', name: 'carbón', n: 2 }),
]);

export function modoActivo(state) {
  return !!(state && state.modoLadron);
}

export function puedeComprarRopa(state) {
  return modoActivo(state);
}

export function ropaPorId(id) {
  return ROPA.find(r => r.id === id) || null;
}

export function esCamuflaje(id) {
  const ropa = ropaPorId(id);
  return !!(ropa && ropa.camuflaje);
}

export function comprarRopa(state, id) {
  if (!puedeComprarRopa(state)) return { ok: false, razon: 'modo' };
  const ropa = ropaPorId(id);
  if (!ropa) return { ok: false, razon: 'no' };
  const money = Math.max(0, Number(state.money) || 0);
  if (!state.creative && money < ropa.price) return { ok: false, razon: 'plata', price: ropa.price };
  const inventario = Object.assign({}, state.ropa || {});
  inventario[id] = true;
  return {
    ok: true,
    money: state.creative ? money : money - ropa.price,
    ropa: inventario,
    puesta: id,
    camuflaje: !!ropa.camuflaje,
    name: ropa.name,
  };
}

// Si te ve, arranca 3 minutos aunque no hayas hecho nada.
// Si te pierde de vista, el tiempo sigue. A los 3 minutos se van
// si no te vuelven a ver; si te ven en ese momento, otros 3 minutos.
export function tickPersecucion(persecucion, dt, visto) {
  const d = Math.max(0, Number(dt) || 0);
  const activa = !!(persecucion && persecucion.activa && persecucion.left > 0);
  if (visto && !activa) return { left: PERSECUCION_SEG, activa: true, termino: false, arranco: true };
  if (!activa) return { left: 0, activa: false, termino: false, arranco: false };
  const left = persecucion.left - d;
  if (left <= 0) {
    if (visto) return { left: PERSECUCION_SEG, activa: true, termino: false, arranco: true };
    return { left: 0, activa: false, termino: true, arranco: false };
  }
  return { left, activa: true, termino: false, arranco: false };
}

export function oficialMuere(hp, dano) {
  const base = hp == null ? VIDA_POLICIA : hp;
  const queda = Math.max(0, base - Math.max(0, Number(dano) || 0));
  return { hp: queda, muerto: queda <= 0 };
}

export function famaInicial() {
  return 0;
}

export function masBuscado(fama) {
  return (fama | 0) >= 1;
}

export function mostrarCartel(fama) {
  return masBuscado(fama);
}

// Comprar un arma o ropa, solo en este modo, te deja más buscado.
export function compraTeMarca(fama, modoLadron) {
  const base = Math.max(0, fama | 0);
  if (!modoLadron) return base;
  return base + 1;
}

export function ritmoReconocimiento(fama, camuflaje) {
  if (!masBuscado(fama)) return CASI_FACTOR;
  if (camuflaje) return CAMUFLAJE_FACTOR;
  return 1;
}

// La policía te reconoce (y puede perseguirte) cuando ya estás más buscado
// y no llevas el camuflaje. Al empezar, o camuflado, no.
export function policiaReconoce(fama, camuflaje) {
  return ritmoReconocimiento(fama, camuflaje) >= 1;
}

// Si un npc te ve y te reconoce, la llamada tarda 8 segundos.
// Recién al terminar, la policía empieza la persecución.
export function tickLlamada(acum, dt, teVe, fama, camuflaje) {
  const d = Math.max(0, Number(dt) || 0);
  let a = Math.max(0, Number(acum) || 0);
  if (!teVe) return { acum: Math.max(0, a - d * 0.5), llama: false };
  a += d * ritmoReconocimiento(fama, camuflaje);
  if (a >= LLAMADA_SEG) return { acum: 0, llama: true };
  return { acum: a, llama: false };
}

export function arrestoLadron(money) {
  const tenia = Math.max(0, Math.round(Number(money) || 0));
  return { money: 0, quitado: tenia, segundos: CELDA_LADRON_SEG, sigueModo: true };
}

export function deudaTito(night, pagadoHasta) {
  const n = Math.max(0, night | 0);
  const p = Math.max(0, Math.min(pagadoHasta | 0, n));
  const periodos = Math.floor(n / NOCHES_TITO);
  const pagados = Math.floor(p / NOCHES_TITO);
  return Math.max(0, periodos - pagados) * DEUDA_TITO;
}

export function titoPuedeDarArma(night, pagadoHasta) {
  return deudaTito(night, pagadoHasta) <= 0;
}

export function pagarTito(money, night, pagadoHasta) {
  const debe = deudaTito(night, pagadoHasta);
  const plata = Math.max(0, Number(money) || 0);
  if (debe <= 0) return { ok: true, money: plata, pagadoHasta: night | 0, deuda: 0, razon: 'al_dia' };
  if (plata < debe) return { ok: false, money: plata, pagadoHasta: pagadoHasta | 0, deuda: debe, razon: 'plata' };
  return { ok: true, money: plata - debe, pagadoHasta: night | 0, deuda: 0, razon: 'pagado' };
}

export function precioArmaTito(price, modoLadron, esArma) {
  if (modoLadron && esArma) return 0;
  return price;
}

export function asaltoTienda(rng) {
  const r = typeof rng === 'function' ? rng : Math.random;
  const plata = 150 + Math.floor(r() * 251);
  const cosa = BOTIN_TIENDA[Math.floor(r() * BOTIN_TIENDA.length) % BOTIN_TIENDA.length];
  return { plata, cosa };
}

export function enTiendaSuper(x, z, superX, superZ) {
  return Math.abs(x - superX) <= 10.2 && Math.abs(z - superZ) <= 10.2;
}

export function enSuperMall(x, z) {
  return x > 16 && x < 46 && z < -188 && z > -220;
}
