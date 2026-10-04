// Mall del Sur: datos que comparten el juego y las pruebas.
// El capítulo del cine dura 10 minutos de reloj (no el de la tele).
// El carrito junta lo elegido y se paga entero en la caja.

export const PALOMITAS_PRECIO = 80;
export const PALOMITAS_BOCADOS = 6;
export const PALOMITAS_HAMBRE = 12;
export const CINE_DURACION = 600;

// Un bocado: la bolsa sigue, baja un poco y sube un poco el hambre.
export function bocadoDeBolsa(qty) {
  const queda = Math.max(0, (qty || 0) - 1);
  return { qty: queda, hambre: PALOMITAS_HAMBRE, acaba: queda <= 0 };
}

// Dos Q seguidas: se acaba lo que quede, de una.
export function dobleDeBolsa(qty) {
  const n = Math.max(0, qty || 0);
  return { qty: 0, hambre: PALOMITAS_HAMBRE * n, acaba: true };
}

// Puestos del patio de comidas. El precio se muestra en el cartel.
export const COMIDAS_MALL = Object.freeze([
  Object.freeze({ id: 'pizza', name: 'Pizza', price: 90, emoji: '🍕' }),
  Object.freeze({ id: 'completo', name: 'Completo', price: 70, emoji: '🌭' }),
  Object.freeze({ id: 'jugo', name: 'Jugo', price: 50, emoji: '🧃' }),
]);

// Piezas de casa que el súper ya vende, más la ventana (también colocable).
export const PIEZAS_CASA_MALL = Object.freeze([
  'wallWood', 'wallRock', 'wallMetal', 'wallDoor', 'pilar', 'door', 'roof', 'window',
]);

// Las diez formas de casa del juego (HOUSE_PLANS). Cada kit entra al inventario
// como las piezas con las que se arma.
export const CASAS_MALL = Object.freeze([
  Object.freeze({ id: 'clasica', name: 'Casa clásica', piezas: Object.freeze({ wallWood: 4, door: 1, roof: 1 }) }),
  Object.freeze({ id: 'chalet', name: 'Casa chalet', piezas: Object.freeze({ wallWood: 6, door: 1, roof: 1, window: 2 }) }),
  Object.freeze({ id: 'alargada', name: 'Casa alargada', piezas: Object.freeze({ wallWood: 8, door: 1, roof: 1, window: 2 }) }),
  Object.freeze({ id: 'angosta', name: 'Casa angosta', piezas: Object.freeze({ wallWood: 4, door: 1, roof: 1, pilar: 2 }) }),
  Object.freeze({ id: 'pareada', name: 'Casa pareada', piezas: Object.freeze({ wallWood: 4, door: 1, roof: 1, window: 1 }) }),
  Object.freeze({ id: 'moderna', name: 'Casa moderna', piezas: Object.freeze({ wallRock: 4, door: 1, roof: 1, window: 2 }) }),
  Object.freeze({ id: 'cabania', name: 'Cabaña', piezas: Object.freeze({ wallWood: 3, door: 1, roof: 1 }) }),
  Object.freeze({ id: 'casona', name: 'Casona', piezas: Object.freeze({ wallWood: 8, door: 2, roof: 2, pilar: 4 }) }),
  Object.freeze({ id: 'ele', name: 'Casa en L', piezas: Object.freeze({ wallWood: 6, door: 1, roof: 1, window: 2 }) }),
  Object.freeze({ id: 'garaje', name: 'Casa con garaje', piezas: Object.freeze({ wallWood: 6, wallDoor: 1, door: 1, roof: 1 }) }),
]);

// Capítulo de cine, unos 10 minutos. Cada escena es un cuadro distinto y
// alguien se mueve: persecución, caída, puerta, susto y un giro al final.
// La voz dice solo `texto`: hombre grave o mujer aguda, sin «dice».
// lila/mateo son [desde, hasta] en la pantalla; el final de una es el inicio de la otra.
function escena(quien, voz, texto, accion, lila, mateo) {
  return Object.freeze({ quien, voz, texto, accion, lila: Object.freeze(lila), mateo: Object.freeze(mateo) });
}

function rebotarX(x, lo, hi) {
  let v = x;
  for (let n = 0; n < 8; n++) {
    if (v < lo) v = lo + (lo - v);
    else if (v > hi) v = hi - (v - hi);
    else break;
  }
  return Math.round(v);
}

const NOVELA_FILAS = Object.freeze([
  ['Lila', 'mujer', '¡La puerta de la sala se abre de un golpe y yo cruzo corriendo con el balde rojo!', 'llegar'],
  ['Mateo', 'hombre', '¡El balde se me escapa y rueda solo por el pasillo! Lo persigo antes de que se vacíe.', 'perseguir'],
  ['Mateo', 'hombre', 'Pisé una palomita, salí volando y el maíz me llovió encima como una tormenta dulce.', 'tropiezo'],
  ['Lila', 'mujer', 'Una palomita rebota en tu ceja, se queda ahí y te queda de corona por un segundo.', 'ceja'],
  ['Lila', 'mujer', 'Caemos en las butacas. En la pantalla, un caracol enorme avanza más lento que el reloj.', 'sentarse'],
  ['Mateo', 'hombre', 'El caracol se agranda de golpe, sale de la pantalla y se va patinando por la sala.', 'caracol'],
  ['Lila', 'mujer', '¡Se apagó todo! Un brillo negro cruza la sala y yo salto de la butaca sin querer.', 'apagon'],
  ['Mateo', 'hombre', 'Una sombra se lleva el balde y corre en puntillas. Si es un fantasma, tiene prisa.', 'sombra'],
  ['Lila', 'mujer', 'La palomita dorada rebota de butaca en butaca y deja un rastro brillante en el piso.', 'rebote'],
  ['Mateo', 'hombre', 'Al reventar, la palomita abre un mapita chico. La X queda justo detrás de la pantalla.', 'mapa'],
  ['Lila', 'mujer', 'Detrás de la tela se enciende una X enorme. Alumbra el pasillo y nos señala el camino.', 'equis'],
  ['Mateo', 'hombre', '¡Agáchate! El balde pasa volando sobre nuestras cabezas y casi nos peina el pelo.', 'agachar'],
  ['Lila', 'mujer', 'Mateo estornuda tan fuerte que el soplido nos empuja de vuelta tres butacas enteras.', 'estornudo'],
  ['Mateo', 'hombre', '¡Un perrito con capa de servilleta galopa por el pasillo como si fuera un héroe!', 'perrito'],
  ['Nico', 'hombre', '¡Soy Nico! Me perdí cuando fui al baño y Canela se puso la capa para buscarme.', 'nino'],
  ['Lila', 'mujer', 'Canela aspira las palomitas del suelo con la nariz. En dos saltos deja el pasillo limpio.', 'hambre'],
  ['Mateo', 'hombre', 'Un gato mantecoso le pega un zarpazo al balde y lo deja girando como un trompo.', 'gato'],
  ['Lila', 'mujer', 'La mantequilla sale en estrellas amarillas y se pega en el techo como un cielo nuevo.', 'estrellas'],
  ['Mateo', 'hombre', 'Mi boleto se suelta, vuela y me da de lleno en la cara. Quedo viendo la sala al revés.', 'boleto'],
  ['Lila', 'mujer', 'Echamos a correr. El balde nos gana la carrera y dobla la esquina antes que nosotros.', 'carrera'],
  ['Mateo', 'hombre', 'Hay un charco de soda. Mis zapatos patinan y cruzo el pasillo sentado en el piso.', 'resbalon'],
  ['Lila', 'mujer', 'Empujamos la puertita de la cabina. Tiembla, suena un golpe seco y se queda cerrada.', 'empujar'],
  ['Guardia', 'hombre', '¡Alto ahí! El guardia salta al frente del pasillo y nos tapa el camino con los brazos.', 'alto'],
  ['Lila', 'mujer', 'Mateo, la cola de Canela sale por tu chaqueta y saluda a todo el mundo sin permiso.', 'cola'],
  ['Nico', 'hombre', 'Canela ladra tan fuerte que las butacas vibran y la gorra del guardia da un saltito.', 'ladrido'],
  ['Lila', 'mujer', '¡No hay fantasma! El freno del carrito de palomitas se soltó y el carro anda solo.', 'giro'],
  ['Mateo', 'hombre', 'El carrito rueda por el pasillo con las ruedas chillando y nadie lo está empujando.', 'carrito'],
  ['Mateo', 'hombre', 'Me aferré al manubrio y el carrito me arrastra. Mis zapatos dejan dos rayas en el piso.', 'arrastre'],
  ['Lila', 'mujer', '¡Se zafó una rueda! Sale disparada, pasa entre las butacas y corre más que el carro.', 'rueda'],
  ['Lila', 'mujer', 'Salto una fila de butacas para atajar la rueda y aterrizo justo al lado del perrito.', 'salto'],
  ['Mateo', 'hombre', 'Tres palomitas me quedan en el aire. Las malabareo un segundo y se me caen todas.', 'malabares'],
  ['Nico', 'hombre', '¡Miren la pantalla! Nos está filmando en vivo, con el carro, el perro y la capa.', 'camara'],
  ['Guardia', 'hombre', 'Mi gorra sale volando. El perro la caza en el aire y se la pone como si fuera suya.', 'gorra'],
  ['Nico', 'hombre', '¡Canela, esa gorra no! Corro detrás del perro y la capa me queda enorme atrás.', 'persigue2'],
  ['Mateo', 'hombre', 'El carrito choca una butaca, la levanta de lado y sigue con la butaca montada encima.', 'choque'],
  ['Lila', 'mujer', 'Las ruedas derrapan, sale humo de mantequilla y el carro dibuja una curva en el piso.', 'freno'],
  ['Lila', 'mujer', 'La puerta de la cabina se abre sola. Adentro hay una palanca roja con un cartel chico.', 'palanca'],
  ['Mateo', 'hombre', 'Bajo la palanca de un tirón. El carrito frena en seco y la rueda suelta da una vuelta.', 'palanca2'],
  ['Lila', 'mujer', 'La puerta del hall se abre y aparece la mamá de Nico con otro balde entre las manos.', 'mama'],
  ['Nico', 'hombre', 'Corro hacia mamá. La capa sale volando y Canela la pesca antes de que toque el suelo.', 'abrazo'],
  ['Mateo', 'hombre', 'Del techo cae una lluvia de palomitas. Nos cubrimos y terminamos llenos de maíz.', 'lluvia'],
  ['Lila', 'mujer', 'El caracol de la peli vuelve, ahora con la capa de servilleta, y cruza la pantalla.', 'capa2'],
  ['Mateo', 'hombre', 'El caracol guiña un ojo enorme, hace una reverencia y se mete otra vez en la tela.', 'guino'],
  ['Guardia', 'hombre', '¡Tres baldes llenos saltan del carro! Uno para Nico, uno para Canela y uno para ustedes.', 'premio'],
  ['Lila', 'mujer', 'Las butacas rechinan al unísono, como si la sala entera se estuviera riendo con nosotros.', 'risa'],
  ['Mateo', 'hombre', 'Canela rompe la cinta de llegada. La gorra le cae en la cabeza y queda de campeona.', 'meta'],
  ['Guardia', 'hombre', 'Bajan las luces. El carrito queda quieto, la rueda vuelve a su eje y la sala respira.', 'silencio'],
  ['Lila', 'mujer', 'Ahora sí nos sentamos de verdad. El balde queda entre los dos y nadie corre más.', 'sentar'],
  ['Mateo', 'hombre', 'La última palomita dorada cae despacito y se queda justo en mi rodilla, sin rebotar.', 'rebote2'],
  ['Lila', 'mujer', 'Se apagan las luces de la sala. Si mañana hay otro misterio, yo llego primero a la puerta.', 'final'],
]);

function armarNovela(filas) {
  let lx = 110, mx = 78;
  return filas.map((f, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const l0 = lx, m0 = mx;
    lx = rebotarX(l0 + dir * (52 + (i % 5) * 16), 86, 520);
    mx = rebotarX(m0 - dir * (46 + (i % 4) * 20), 72, 540);
    if (Math.abs(lx - l0) < 28) lx = rebotarX(l0 + (l0 < 300 ? 96 : -96), 86, 520);
    if (Math.abs(mx - m0) < 28) mx = rebotarX(m0 + (m0 < 300 ? 96 : -96), 72, 540);
    return escena(f[0], f[1], f[2], f[3], [l0, lx], [m0, mx]);
  });
}

export const CINE_ESCENAS = Object.freeze(armarNovela(NOVELA_FILAS));

const FONDO_CINE = Object.freeze({
  llegar: '#3b0764', perseguir: '#7c2d12', tropiezo: '#9a3412', ceja: '#854d0e', sentarse: '#1e3a8a',
  caracol: '#166534', apagon: '#020617', sombra: '#1e1b4b', rebote: '#a16207', mapa: '#92400e',
  equis: '#7f1d1d', agachar: '#334155', estornudo: '#0e7490', perrito: '#9f1239', nino: '#a16207',
  hambre: '#b45309', gato: '#c2410c', estrellas: '#1d4ed8', boleto: '#0369a1', carrera: '#b91c1c',
  resbalon: '#0284c7', empujar: '#44403c', alto: '#1e3a8a', cola: '#be185d', ladrido: '#7c3aed',
  giro: '#6d28d9', carrito: '#dc2626', arrastre: '#ea580c', rueda: '#ca8a04', salto: '#db2777',
  malabares: '#d97706', camara: '#0f766e', gorra: '#1d4ed8', persigue2: '#c026d3', choque: '#991b1b',
  freno: '#57534e', palanca: '#78350f', palanca2: '#b45309', mama: '#be123c', abrazo: '#e11d48',
  lluvia: '#d97706', capa2: '#15803d', guino: '#4d7c0f', premio: '#ca8a04', risa: '#db2777',
  meta: '#16a34a', silencio: '#0f172a', sentar: '#312e81', rebote2: '#a16207', final: '#020617',
});

export function modoEscena(accion) {
  return accion || 'sala';
}

function fondoDe(accion) {
  return FONDO_CINE[accion] || '#111827';
}

const CON_PUERTA = new Set(['llegar', 'empujar', 'palanca', 'mama', 'final']);
const CON_BALDE = new Set(['perseguir', 'agachar', 'carrera', 'hambre', 'premio', 'sentar']);
const CON_MAIZ = new Set(['tropiezo', 'ceja', 'rebote', 'lluvia', 'malabares', 'rebote2', 'estrellas']);
const CON_SOMBRA = new Set(['apagon', 'sombra']);
const CON_CARRITO = new Set(['giro', 'carrito', 'arrastre', 'choque', 'freno', 'palanca2']);
const CON_TELON = new Set(['equis', 'caracol', 'capa2', 'guino', 'camara', 'silencio', 'sentarse', 'mapa']);
const CON_PALANCA = new Set(['palanca', 'palanca2']);
const CON_PERRO = new Set(['perrito', 'nino', 'cola', 'ladrido', 'gorra', 'persigue2', 'abrazo', 'meta', 'hambre']);
const CON_RUEDA = new Set(['rueda', 'salto']);
const CON_NICO = new Set(['nino', 'hambre', 'ladrido', 'persigue2', 'abrazo']);
const CON_GUARDIA = new Set(['alto', 'cola', 'gorra', 'premio', 'silencio']);

export function cineObjetos(accion, u) {
  const t = Math.max(0, Math.min(1, u || 0));
  const lista = [];
  if (CON_PUERTA.has(accion)) lista.push({ tipo: 'puerta', x: 508, y: 168, a: +(t * 1.2).toFixed(3) });
  if (CON_BALDE.has(accion)) lista.push({ tipo: 'balde', x: Math.round(70 + t * 460), y: Math.round(236 - Math.sin(t * Math.PI) * 36), a: +(t * 10).toFixed(3) });
  if (CON_MAIZ.has(accion)) lista.push({ tipo: 'maiz', x: Math.round(90 + t * 380), y: Math.round(24 + t * 230), a: +(t * 8).toFixed(3) });
  if (CON_SOMBRA.has(accion)) lista.push({ tipo: 'sombra', x: Math.round(200 + Math.sin(t * 12) * 150), y: 176, a: +t.toFixed(3) });
  if (CON_CARRITO.has(accion)) lista.push({ tipo: 'carrito', x: Math.round(64 + t * 470), y: 228, a: +Math.sin(t * 18).toFixed(3) });
  if (CON_TELON.has(accion)) lista.push({ tipo: 'telon', x: Math.round(120 + t * 360), y: 78, a: +t.toFixed(3) });
  if (CON_PALANCA.has(accion)) lista.push({ tipo: 'palanca', x: 470, y: 188, a: +(-0.9 + t * 1.7).toFixed(3) });
  if (CON_PERRO.has(accion)) lista.push({ tipo: 'perro', x: Math.round(48 + t * 500), y: 246, a: +Math.sin(t * 16).toFixed(3) });
  if (CON_RUEDA.has(accion)) lista.push({ tipo: 'rueda', x: Math.round(36 + t * 540), y: Math.round(246 - Math.abs(Math.sin(t * 9)) * 48), a: +(t * 12).toFixed(3) });
  lista.push({
    tipo: 'blob',
    x: Math.round(40 + t * 520),
    y: Math.round(58 + Math.sin(t * Math.PI * 4) * 34 + 40),
    a: +t.toFixed(3),
    color: '#fde68a',
  });
  return lista;
}

// Un cuadro del capítulo. `lt` va de 0 a 1 dentro de la escena.
export function frameCine(esc, lt) {
  const t = Math.max(0, Math.min(1, lt == null ? (esc.lt || 0) : lt));
  const accion = esc.accion;
  const bob = Math.sin(t * Math.PI * 18);
  const lx = esc.lila[0] + (esc.lila[1] - esc.lila[0]) * t + bob * 7;
  const mx = esc.mateo[0] + (esc.mateo[1] - esc.mateo[0]) * t - bob * 7;
  let yLila = 252 + bob * 8;
  let yMateo = 252 - bob * 6;
  if (accion === 'tropiezo') yMateo = t > 0.42 ? 252 + (t - 0.42) * 70 : 252 - bob * 6;
  if (accion === 'salto') yLila = 252 - Math.sin(t * Math.PI) * 78;
  if (accion === 'agachar' || accion === 'resbalon') yMateo = 252 + 18 + Math.abs(bob) * 6;
  if (accion === 'apagon' && t > 0.2 && t < 0.45) { yLila -= 36; yMateo -= 28; }
  const extra = [];
  if (CON_NICO.has(accion)) extra.push({ nombre: 'Nico', color: '#facc15', x: Math.round(60 + t * 280), y: 262 });
  if (CON_GUARDIA.has(accion)) extra.push({ nombre: 'Guardia', color: '#94a3b8', x: Math.round(560 - t * 180), y: 246 });
  let relampago = 0;
  if (accion === 'apagon') relampago = t > 0.12 && t < 0.38 ? 1 : 0;
  return {
    accion,
    fondo: fondoDe(accion),
    lx: Math.round(lx),
    mx: Math.round(mx),
    yLila: Math.round(yLila),
    yMateo: Math.round(yMateo),
    bob: +bob.toFixed(3),
    relampago,
    oscuro: accion === 'apagon' && t >= 0.38 ? 1 : (accion === 'final' || accion === 'silencio' ? 0.45 : 0),
    extra,
    objetos: cineObjetos(accion, t),
  };
}

export function firmaCuadro(esc, lt) {
  const f = frameCine(esc, lt);
  const objs = f.objetos.map(o => o.tipo + ':' + o.x + ',' + o.y + ',' + o.a).join('|');
  const extras = f.extra.map(p => p.nombre + ':' + p.x).join('|');
  return [f.accion, f.lx, f.mx, f.yLila, f.yMateo, f.bob, f.relampago, f.oscuro, objs, extras].join(';');
}

export function tiempoDeEscena(accion, lt) {
  const i = CINE_ESCENAS.findIndex(e => e.accion === accion);
  const seg = CINE_DURACION / CINE_ESCENAS.length;
  const u = Math.max(0, Math.min(0.999, lt == null ? 0 : lt));
  return (i < 0 ? 0 : i) * seg + u * seg;
}

export function precioDeCasa(casa, precios) {
  let total = 0;
  for (const [clave, n] of Object.entries(casa.piezas)) total += (precios[clave] || 0) * n;
  return total;
}

export function casasConPrecio(precios) {
  return CASAS_MALL.map(casa => Object.freeze({
    id: casa.id,
    name: casa.name,
    piezas: casa.piezas,
    price: precioDeCasa(casa, precios),
    kind: 'casa',
    key: 'casa_' + casa.id,
  }));
}

// Góndolas del súper gigante: una fila por pasillo, todo el catálogo en el local.
// El pasillo x=24 queda libre entre la primera y la segunda fila.
export const SUPER_FILAS = Object.freeze([22.2, 26.2, 30.2, 34.2, 38.2, 42.2]);
export const SUPER_Z0 = -192.4;
export const SUPER_PASO = 1.62;

export function puestosSuper(items) {
  const lista = Array.isArray(items) ? items : [];
  const cols = SUPER_FILAS.length;
  const porFila = Math.max(1, Math.ceil(lista.length / cols));
  return lista.map((it, i) => {
    const col = Math.min(cols - 1, Math.floor(i / porFila));
    const fila = i % porFila;
    return Object.freeze({
      key: it.key,
      name: it.name,
      price: it.price || 0,
      color: it.color,
      x: SUPER_FILAS[col],
      z: Math.round((SUPER_Z0 - fila * SUPER_PASO) * 100) / 100,
    });
  });
}

// Agrega una copia de lo elegido. No cobra: eso ocurre en la caja.
export function mallAgregar(carrito, linea) {
  const base = Array.isArray(carrito) ? carrito : [];
  return base.concat([Object.assign({ kind: linea.kind || 'tienda' }, linea)]);
}

export function mallTotal(carrito) {
  let total = 0;
  for (const linea of carrito || []) total += linea.price || 0;
  return total;
}

// Si no alcanza, no se cobra. En creativo el total se entrega sin descontar.
export function mallPuedePagar(plata, carrito, creativo) {
  const total = mallTotal(carrito);
  if (!carrito || !carrito.length) return { ok: false, razon: 'vacio', total: 0, cobra: 0 };
  if (creativo) return { ok: true, razon: '', total, cobra: 0 };
  if (!(plata >= total)) return { ok: false, razon: 'plata', total, cobra: 0 };
  return { ok: true, razon: '', total, cobra: total };
}

export function escenaCine(t) {
  const n = CINE_ESCENAS.length;
  const seg = CINE_DURACION / n;
  const u = ((t % CINE_DURACION) + CINE_DURACION) % CINE_DURACION;
  const i = Math.min(n - 1, Math.floor(u / seg));
  const esc = CINE_ESCENAS[i];
  return {
    i, seg, lt: (u - i * seg) / seg,
    quien: esc.quien, voz: esc.voz, texto: esc.texto, accion: esc.accion,
    lila: esc.lila, mateo: esc.mateo,
  };
}

// La pose final de una escena es la pose inicial de la siguiente.
export function cineContinuo() {
  const cortes = [];
  for (let i = 1; i < CINE_ESCENAS.length; i++) {
    const a = CINE_ESCENAS[i - 1], b = CINE_ESCENAS[i];
    if (a.lila[1] !== b.lila[0]) cortes.push('lila ' + i);
    if (a.mateo[1] !== b.mateo[0]) cortes.push('mateo ' + i);
  }
  return cortes;
}
