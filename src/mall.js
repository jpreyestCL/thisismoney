// Mall del Sur: datos que comparten el juego y las pruebas.
// El capítulo del cine dura 10 minutos de reloj (no el de la tele).
// El carrito junta lo elegido y se paga entero en la caja.

export const PALOMITAS_PRECIO = 80;
export const CINE_DURACION = 600;

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

// Capítulo de cine: 24 escenas, 25 s cada una. Lo que uno hace queda donde
// el otro lo retoma (lila/mateo son [desde, hasta] en la pantalla).
// La voz dice solo `texto`: hombre grave o mujer aguda, sin «dice».
export const CINE_ESCENAS = Object.freeze([
  escena('Lila', 'mujer', 'Abro la puerta del pasaje y dejo la luz del mall atrás.', 'abrir', [80, 160], [40, 40]),
  escena('Mateo', 'hombre', 'Dejo la caja en el suelo, con cuidado, que pesa.', 'caja', [160, 160], [40, 150]),
  escena('Lila', 'mujer', '¿Qué traes ahí dentro? Se escucha algo suelto.', 'mirar', [160, 200], [150, 150]),
  escena('Mateo', 'hombre', 'Una llave vieja y el plano de la casa.', 'sacar', [200, 200], [150, 190]),
  escena('Lila', 'mujer', 'Esa llave es de mi casa. La perdí el verano pasado.', 'tomar', [200, 230], [190, 190]),
  escena('Mateo', 'hombre', 'Entonces vamos. Yo te sigo, no te adelantes.', 'seguir', [230, 320], [190, 300]),
  escena('Lila', 'mujer', 'La puerta de adentro no cede. Empuja conmigo.', 'empujar', [320, 340], [300, 300]),
  escena('Mateo', 'hombre', 'Empujo contigo. Ya abre, huele a madera.', 'empujar2', [340, 360], [300, 340]),
  escena('Lila', 'mujer', 'Enciendo la lámpara. Ahora se ve la mesa.', 'lampara', [360, 300], [340, 340]),
  escena('Mateo', 'hombre', 'Hay polvo en la mesa y marcas de tazas.', 'polvo', [300, 300], [340, 250]),
  escena('Lila', 'mujer', 'Mira, una carta cerrada con nuestro nombre.', 'carta', [300, 280], [250, 250]),
  escena('Mateo', 'hombre', 'Léela. Yo te escucho, no me voy a mover.', 'leer', [280, 260], [250, 220]),
  escena('Lila', 'mujer', 'Avisa que el mall cierra de noche y hay que salir.', 'ventana', [260, 180], [220, 220]),
  escena('Mateo', 'hombre', 'Por eso corrimos antes de que apagaran las luces.', 'cerrar', [180, 180], [220, 160]),
  escena('Lila', 'mujer', 'Guarda la llave en el cajón, debajo de la carta.', 'cajon', [180, 220], [160, 160]),
  escena('Mateo', 'hombre', 'La dejo bajo la caja. Mañana la buscamos aquí.', 'guardar', [220, 220], [160, 200]),
  escena('Lila', 'mujer', 'Siéntate. Preparo té mientras ordeno el plano.', 'te', [220, 300], [200, 240]),
  escena('Mateo', 'hombre', 'El plano cabe en el bolsillo. No lo pierdas.', 'plano', [300, 300], [240, 260]),
  escena('Lila', 'mujer', 'Mañana volvemos al mall, a la primera función.', 'manana', [300, 280], [260, 260]),
  escena('Mateo', 'hombre', 'Yo compro las palomitas. Tú guarda los asientos.', 'palomitas', [280, 280], [260, 300]),
  escena('Lila', 'mujer', 'Apago la luz del pasaje. Caminamos despacito.', 'apagar', [280, 200], [300, 300]),
  escena('Mateo', 'hombre', 'Cierro la puerta con llave y pruebo que quedó firme.', 'cerrarPuerta', [200, 200], [300, 160]),
  escena('Lila', 'mujer', 'Si escuchas algo, me despiertas. Dejo la lámpara cerca.', 'dormir', [200, 240], [160, 160]),
  escena('Mateo', 'hombre', 'Hasta mañana, en la primera fila. No llegues tarde.', 'final', [240, 240], [160, 200]),
]);

function escena(quien, voz, texto, accion, lila, mateo) {
  return Object.freeze({ quien, voz, texto, accion, lila: Object.freeze(lila), mateo: Object.freeze(mateo) });
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
