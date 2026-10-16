// Modo ladrón: reglas puras. El juego normal no las usa.
// La policía de la calle y los guardias del mall comparten la misma vida.

export const VIDA_ZOMBIE = 10;
export const VIDA_POLICIA = 80;          // varias veces la de un zombie
export const PERSECUCION_SEG = 180;      // 3 minutos reales
export const CELDA_LADRON_SEG = 600;     // 10 minutos reales
export const DEUDA_TITO = 500;
export const NOCHES_TITO = 3;          // $500 cada 3 días del juego
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

// En la celda no se muestra persecución ni que te buscan.
// Al cumplir la condena tampoco: caminar no vuelve a encender el aviso.
// Fuera de eso, el aviso de siempre.
export function objetivoLadron(estado) {
  const e = estado || {};
  if (e.celda) return '';
  if (e.limpio) return '';
  if (e.persigue) return '🚨 TE VIERON · la policía te persigue · ' + (e.tiempo || '');
  if (e.llamando) return '📞 Te reconocieron · llamando a la policía · ' + (e.falta || '');
  if (!e.masBuscado) return '😶 Casi nadie te reconoce. No te persiguen y todavía no hay cartel de SE BUSCA.';
  return '🚨 Más buscado. Sin el camuflaje, un vecino puede llamar y la policía te reconoce.';
}

export function arrestoLadron(money) {
  const tenia = Math.max(0, Math.round(Number(money) || 0));
  return { money: 0, quitado: tenia, segundos: CELDA_LADRON_SEG, sigueModo: true };
}

// Al salir, la condena está cumplida: se apaga la persecución y el buscado.
export function condenaCumplida() {
  return { chase: null, llamada: 0, wanted: 0, wantedLevel: 0, limpio: true };
}

// Caminar no enciende nada. Robar la caja, la bóveda o a alguien, o pegarle, sí.
const DELITOS_LADRON = new Set(['caja', 'boveda', 'tienda', 'golpe']);

export function trasDelito(limpio, tipo) {
  if (!limpio) return false;
  if (DELITOS_LADRON.has(tipo)) return false;
  return true;
}

// La bala le pega al policía si el rayo pasa por el cuerpo, también a quemarropa.
// `ancho` es el mismo margen con el que las balas ya le pegan a un monstruo.
export function impactoOficial(desde, dir, pies, alcance, ancho) {
  const ox = Number(desde && desde.x) || 0;
  const oy = Number(desde && desde.y) || 0;
  const oz = Number(desde && desde.z) || 0;
  let dx = Number(dir && dir.x) || 0;
  let dy = Number(dir && dir.y) || 0;
  let dz = Number(dir && dir.z) || 0;
  const len = Math.hypot(dx, dy, dz) || 1;
  dx /= len; dy /= len; dz /= len;
  const px = Number(pies && pies.x) || 0;
  const py = Number(pies && pies.y) || 0;
  const pz = Number(pies && pies.z) || 0;
  const max = Number(alcance) > 0 ? Number(alcance) : 60;
  const w = Number(ancho) > 0 ? Number(ancho) : 1.15;
  const relx = px - ox;
  const rely = (py + 1.15) - oy;
  const relz = pz - oz;
  const t = relx * dx + rely * dy + relz * dz;
  if (t > max) return null;
  const tc = Math.max(0, t);
  const hx = ox + dx * tc;
  const hy = oy + dy * tc;
  const hz = oz + dz * tc;
  if (Math.hypot(hx - px, hz - pz) > w) return null;
  if (hy < py - 0.2 || hy > py + 2.6) return null;
  return { dist: tc, cabeza: hy >= py + 1.7 };
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

// En el modo, armas, balas y bombas de humo salen a $0. Fuera, el precio de siempre.
// El pago de cada 3 días lo decide titoEntrega: si debes, no te las da.
export function precioRegaloTito(price, modoLadron, tipo) {
  if (modoLadron && (tipo === 'arma' || tipo === 'balas' || tipo === 'humo')) return 0;
  return price;
}

export function precioArmaTito(price, modoLadron, esArma) {
  return precioRegaloTito(price, modoLadron, esArma ? 'arma' : '');
}

export function titoEntrega(night, pagadoHasta, tipo, modoLadron) {
  if (!modoLadron) return true;
  if (tipo !== 'arma' && tipo !== 'balas' && tipo !== 'humo') return true;
  return titoPuedeDarArma(night, pagadoHasta);
}

// Bóveda del banco, solo se saquea en el modo ladrón. 25 casilleros de $1500.
// Una partida nueva nace cerrada y llena. Continuar no rellena los que ya vaciaste.
export const CASILLEROS_BOVEDA = 25;
export const PLATA_CASILLERO = 1500;

export function bovedaNueva() {
  return { abierta: false, vacios: [] };
}

export function normalizarBoveda(boveda) {
  const src = boveda && Array.isArray(boveda.vacios) ? boveda.vacios : [];
  const vacios = [];
  for (const n of src) {
    const i = n | 0;
    if (i >= 0 && i < CASILLEROS_BOVEDA && vacios.indexOf(i) < 0) vacios.push(i);
  }
  return { abierta: !!(boveda && boveda.abierta), vacios };
}

export function togglearBoveda(boveda) {
  const b = normalizarBoveda(boveda);
  return { abierta: !b.abierta, vacios: b.vacios.slice() };
}

// Solo en modo ladrón, y solo cuando la cajera ya no está en el mesón.
// Mientras siga viva la hoja no gira: el banco de siempre no usa esta puerta.
export function bovedaPuedeAbrir(modoLadron, cajeraViva) {
  return !!modoLadron && !cajeraViva;
}

// Los 25, en la pared del fondo. El margen los saca de los muros norte y sur.
export function puestosCasilleros(x0, z0, x1, z1) {
  const cols = 5;
  const margen = 0.62;
  const paso = (z1 - z0 - margen * 2) / (cols - 1);
  const puestos = [];
  for (let i = 0; i < CASILLEROS_BOVEDA; i++) {
    const col = i % cols, fila = (i / cols) | 0;
    puestos.push({
      i, x: x0 + 0.62, y: 0.5 + fila * 0.55, z: z0 + margen + col * paso,
      hx: 0.22, hy: 0.26, hz: 0.32,
    });
  }
  return puestos;
}

// t de entrada del rayo (dirección normalizada) en la caja. null si no la toca.
export function distanciaRayoCaja(ox, oy, oz, dx, dy, dz, minX, minY, minZ, maxX, maxY, maxZ) {
  let tmin = 0, tmax = Infinity;
  const ejes = [[dx, ox, minX, maxX], [dy, oy, minY, maxY], [dz, oz, minZ, maxZ]];
  for (let k = 0; k < ejes.length; k++) {
    const d = ejes[k][0], o = ejes[k][1], mn = ejes[k][2], mx = ejes[k][3];
    if (Math.abs(d) < 1e-8) {
      if (o < mn || o > mx) return null;
      continue;
    }
    let t1 = (mn - o) / d, t2 = (mx - o) / d;
    if (t1 > t2) { const s = t1; t1 = t2; t2 = s; }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }
  if (tmax < 0) return null;
  return tmin >= 0 ? tmin : tmax;
}

// El casillero que cruza la mira. Gana el más cercano, aunque uno vacío quede más a mano.
export function casilleroApuntado(casilleros, ox, oy, oz, dx, dy, dz, maxDist) {
  const max = maxDist == null ? 5 : maxDist;
  const len = Math.hypot(dx, dy, dz) || 1;
  const ux = dx / len, uy = dy / len, uz = dz / len;
  let best = null, bestT = max;
  for (const c of casilleros) {
    const hx = c.hx == null ? 0.22 : c.hx, hy = c.hy == null ? 0.26 : c.hy, hz = c.hz == null ? 0.32 : c.hz;
    const t = distanciaRayoCaja(ox, oy, oz, ux, uy, uz, c.x - hx, c.y - hy, c.z - hz, c.x + hx, c.y + hy, c.z + hz);
    if (t == null || t < 0 || t > bestT) continue;
    best = c;
    bestT = t;
  }
  return best;
}

export function saquearCasillero(boveda, indice) {
  const b = normalizarBoveda(boveda);
  const i = indice | 0;
  if (i < 0 || i >= CASILLEROS_BOVEDA) return { ok: false, razon: 'no', plata: 0, boveda: b };
  if (!b.abierta) return { ok: false, razon: 'cerrada', plata: 0, boveda: b };
  if (b.vacios.indexOf(i) >= 0) return { ok: false, razon: 'vacio', plata: 0, boveda: b };
  return { ok: true, razon: 'ok', plata: PLATA_CASILLERO, boveda: { abierta: true, vacios: b.vacios.concat(i) } };
}

export function plataBoveda(boveda) {
  const b = normalizarBoveda(boveda);
  return (CASILLEROS_BOVEDA - b.vacios.length) * PLATA_CASILLERO;
}

// En el modo ladrón ver a Tito es gratis. Fuera, sigue el candado de $20.000
// (o el modo creativo, que ya lo abría).
export function puedeVerTito(modoLadron, totalEarned, creative, unlock) {
  if (modoLadron) return true;
  if (creative) return true;
  const meta = Number(unlock) > 0 ? Number(unlock) : 20000;
  return (Number(totalEarned) || 0) >= meta;
}

export function asaltoTienda(rng) {
  const r = typeof rng === 'function' ? rng : Math.random;
  const plata = 150 + Math.floor(r() * 251);
  const cosa = BOTIN_TIENDA[Math.floor(r() * BOTIN_TIENDA.length) % BOTIN_TIENDA.length];
  return { plata, cosa };
}

// La plata del asalto sale de la caja donde se paga, una sola vez por partida.
export const CAJA_RADIO = 1.8;
export const CAJA_MALL_RADIO = 2.4;

export function cajasNuevas() {
  return { super: false, mall: false };
}

export function normalizarCajas(cajas) {
  const o = cajas && typeof cajas === 'object' ? cajas : {};
  return { super: !!o.super, mall: !!o.mall };
}

export function enLaCaja(x, z, cajaX, cajaZ, radio) {
  const r = Number(radio) > 0 ? Number(radio) : CAJA_RADIO;
  return Math.hypot((Number(x) || 0) - cajaX, (Number(z) || 0) - cajaZ) <= r;
}

export function vaciarCaja(cajas, id, rng) {
  const estado = normalizarCajas(cajas);
  if (id !== 'super' && id !== 'mall') return { ok: false, razon: 'no', plata: 0, cosa: null, cajas: estado };
  if (estado[id]) return { ok: false, razon: 'vacia', plata: 0, cosa: null, cajas: estado };
  const botin = asaltoTienda(rng);
  const siguiente = { super: estado.super, mall: estado.mall };
  siguiente[id] = true;
  return { ok: true, razon: 'ok', plata: botin.plata, cosa: botin.cosa, cajas: siguiente };
}

// En el modo, y solo mientras persigue, la policía va un 15% más lenta.
export const POLICIA_FACTOR = 0.85;

export function velocidadPolicia(base, modoLadron) {
  const n = Number(base) || 0;
  if (!modoLadron) return n;
  return n * POLICIA_FACTOR;
}

// Fuera del modo, esposan al pasar cerca (a pie 1,9 · al volante 3,4).
// En el modo hay que estar YA persiguiendo y llegar mucho más cerca:
// caminar al lado de un paco que no te persigue no manda a la celda.
export const CAPTURA_NORMAL_PIE = 1.9;
export const CAPTURA_NORMAL_AUTO = 3.4;
export const CAPTURA_LADRON_PIE = 0.75;
export const CAPTURA_LADRON_AUTO = 1.5;

export function radioCaptura(modoLadron, conduciendo) {
  if (modoLadron) return conduciendo ? CAPTURA_LADRON_AUTO : CAPTURA_LADRON_PIE;
  return conduciendo ? CAPTURA_NORMAL_AUTO : CAPTURA_NORMAL_PIE;
}

export function atrapaPolicia(persigue, distancia, modoLadron, conduciendo) {
  if (modoLadron && !persigue) return false;
  const d = Number(distancia);
  if (!(d >= 0)) return false;
  return d <= radioCaptura(!!modoLadron, !!conduciendo);
}

export function enTiendaSuper(x, z, superX, superZ) {
  return Math.abs(x - superX) <= 10.2 && Math.abs(z - superZ) <= 10.2;
}

export function enSuperMall(x, z) {
  return x > 16 && x < 46 && z < -188 && z > -220;
}

// Lugar de una partida nueva (el mismo spawn de la Tierra). Un mundo ladrón
// nuevo sale de aquí: no del lugar donde dejaste el otro.
export const LUGAR_PARTIDA_NUEVA = Object.freeze({ x: 10, z: 16 });

// Cada nombre tiene su propia clave. Sin nombre queda el save viejo `tim_save`.
// Dos mundos no pueden caer en la misma clave.
export function clavePartida(nombre) {
  const n = String(nombre == null ? '' : nombre).trim();
  return n ? 'tim_save_' + n : 'tim_save';
}

// Partida nueva en modo ladrón. `otro` es el mundo que ya tenías: no se copia
// su lugar, su plata, su casa, su ropa, sus armas ni su fama.
export function mundoLadronNuevo(otro, dineroInicial) {
  void otro;
  const dinero = Number(dineroInicial);
  return {
    px: LUGAR_PARTIDA_NUEVA.x,
    pz: LUGAR_PARTIDA_NUEVA.z,
    money: Number.isFinite(dinero) ? dinero : 2000,
    fama: 0,
    ropaPuesta: null,
    ropa: {},
    guns: {},
    placed: [],
    modoLadron: true,
  };
}

// Continuar lee SOLO esta partida. Si no trae lugar, cae al spawn nuevo.
export function continuarMundoLadron(save) {
  const d = save && typeof save === 'object' ? save : {};
  const fama = d.ladronFama != null ? (d.ladronFama | 0) : (d.fama != null ? (d.fama | 0) : 0);
  return {
    px: d.px != null ? Number(d.px) : LUGAR_PARTIDA_NUEVA.x,
    pz: d.pz != null ? Number(d.pz) : LUGAR_PARTIDA_NUEVA.z,
    money: Number(d.money) || 0,
    fama,
    ropaPuesta: d.ropaPuesta || null,
    ropa: (d.ropaLadron && typeof d.ropaLadron === 'object') ? d.ropaLadron : ((d.ropa && typeof d.ropa === 'object') ? d.ropa : {}),
    guns: (d.guns && typeof d.guns === 'object') ? d.guns : {},
    placed: Array.isArray(d.placed) ? d.placed : [],
    modoLadron: !!d.modoLadron,
  };
}
