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

// Capítulo de cine, unos 10 minutos seguidos. Cada frase dura 5 segundos
// y en ese rato alguien corre: la carrera de los zapatos que se salen de la peli.
// La voz dice solo `texto`: hombre grave o mujer aguda, sin «dice».
// lila/mateo son [desde, hasta] en la pantalla; el final de una es el inicio de la otra.
function escena(quien, voz, texto, accion, lila, mateo, tipo) {
  return Object.freeze({ quien, voz, texto, accion, tipo: tipo || 'zapato', lila: Object.freeze(lila), mateo: Object.freeze(mateo) });
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
  ['Lila', 'mujer', 'Mateo, llegué corriendo. Mira la carrera de la pantalla.', 'llegar', 'zapato'],
  ['Mateo', 'hombre', 'Veo al rojo primero. Le saca la lengua al segundo.', 'pista', 'zapato'],
  ['Lila', 'mujer', '¡Se salió de la pantalla! El zapato cayó aquí, en la sala.', 'saltan', 'zapato'],
  ['Mateo', 'hombre', 'Nos reta a correr. Si gana, la peli se queda en pausa.', 'reto', 'zapato'],
  ['Lila', 'mujer', '¡Le ato los cordones! Me arrastra por este pasillo.', 'amarra', 'zapato'],
  ['Mateo', 'hombre', 'Doy la vuelta a la butaca. Ellos ya van por la cuarta.', 'vueltas', 'zapato'],
  ['Nico', 'hombre', '¡Espérenme! Mi calcetín se soltó y quiere correr solo.', 'calcetin', 'globo'],
  ['Lila', 'mujer', 'Nico, tu calcetín le tapó un ojo. Ahora va en zigzag.', 'zigzag', 'zapato'],
  ['Mateo', 'hombre', 'Chocaron de frente y se pidieron perdón con una venia.', 'venia', 'zapato'],
  ['Guardia', 'hombre', '¡Alto! En este pasillo se camina. Ellos aceleran más.', 'alto', 'silbato'],
  ['Lila', 'mujer', 'Guardia, sopla el silbato. Mira, se cree el árbitro.', 'pitazo', 'silbato'],
  ['Mateo', 'hombre', 'Cada pitazo los apura. Cuéntales un chiste bien malo.', 'chiste', 'silbato'],
  ['Guardia', 'hombre', '¿Qué hace un zapato en el espacio? Da una vuelta y se marea mirando el sol.', 'espacio', 'silbato'],
  ['Lila', 'mujer', 'Se ríen y se desatan. ¡Atrápalos ahora, Mateo!', 'carcajada', 'zapato'],
  ['Mateo', 'hombre', 'Agarré uno. El otro me hace zancadilla y salgo volando.', 'zancadilla', 'zapato'],
  ['Lila', 'mujer', 'Pasaste dos butacas y caíste al revés. Punto para nosotros.', 'reves', 'zapato'],
  ['Nico', 'hombre', 'Mis medias se fueron con ellos. El equipo enemigo creció.', 'medias', 'globo'],
  ['Lila', 'mujer', 'Entonces corremos juntos por el pasillo, en una sola fila.', 'equipo', 'zapato'],
  ['Guardia', 'hombre', 'Corro con la gorra en la mano. Ella también quiere entrar.', 'trote', 'silbato'],
  ['Mateo', 'hombre', '¡La gorra despegó! Planea y se pone en el zapato líder.', 'planeo', 'globo'],
  ['Lila', 'mujer', 'Con gorra se cree campeón y firma autógrafos en el aire.', 'autografo', 'zapato'],
  ['Mateo', 'hombre', 'El otro se puso celoso y le quitó la gorra de un puntapié.', 'celoso', 'zapato'],
  ['Nico', 'hombre', 'Se pelean la gorra a saltos y se olvidan de que seguimos.', 'pelea', 'globo'],
  ['Lila', 'mujer', '¡Vamos primeros! Doblo aquí. Cuidado con tu mano, Mateo.', 'ventaja', 'zapato'],
  ['Mateo', 'hombre', 'Tomo la curva agachado. Un cordón suelto me rozó la oreja.', 'curva', 'zapato'],
  ['Guardia', 'hombre', '¡Cuidado con la salida! Si cruzan esa puerta, no vuelven.', 'salida', 'silbato'],
  ['Lila', 'mujer', 'Me planto en la salida, brazos abiertos. Frenan y resbalan.', 'bloqueo', 'zapato'],
  ['Mateo', 'hombre', 'Resbalan, giran como trompos y quedan mirando la pantalla.', 'trompo', 'zapato'],
  ['Nico', 'hombre', '¡Eso! Les hago porra con el calcetín y arrancan de vuelta.', 'porra', 'globo'],
  ['Lila', 'mujer', '¡Córrele, Mateo! Vamos por el pasillo, detrás del rojo.', 'persecucion', 'zapato'],
  ['Mateo', 'hombre', 'Un banquillo se cayó de la pantalla y rueda entre mis pies.', 'banquillo', 'pelota'],
  ['Lila', 'mujer', 'Salto el banquillo. Tú lo pateas y te adelantas a la derecha.', 'brinco', 'zapato'],
  ['Guardia', 'hombre', 'El silbato nos muestra una tarjeta amarilla, muy serio.', 'tarjeta', 'silbato'],
  ['Nico', 'hombre', 'Me río, tropiezo, ruedo y igual los adelanto. ¡Qué suerte!', 'tropiezo', 'globo'],
  ['Lila', 'mujer', 'La suerte corre con nosotros. ¿Le ves la capa, Mateo?', 'suerte', 'zapato'],
  ['Mateo', 'hombre', '¿Capa invisible? Entonces ¿por qué flotan esos cordones?', 'capa', 'globo'],
  ['Lila', 'mujer', 'Los cordones no se enteraron. Sigan, que el pasillo sigue.', 'cordones', 'zapato'],
  ['Nico', 'hombre', 'Hay un atajo más adelante. ¡Agáchense, el techo es bajo!', 'atajo', 'globo'],
  ['Mateo', 'hombre', 'Me agaché tarde. Un zapato me pasó encima y me despeinó.', 'despeine', 'zapato'],
  ['Lila', 'mujer', 'Te quedó la chasquilla parada. Pareces un héroe con prisa.', 'heroe', 'zapato'],
  ['Guardia', 'hombre', 'Si ustedes son héroes, yo soy el árbitro. Y también corro.', 'arbitro', 'silbato'],
  ['Mateo', 'hombre', 'Abre los brazos, guardia. Rebotan en tu pancita como un muro.', 'barrera', 'pelota'],
  ['Lila', 'mujer', '¡Boing! Salen disparados. Nico, no te quedes ahí mirando.', 'boing', 'zapato'],
  ['Nico', 'hombre', '¡Miren el piso del pasillo! Cayó una cáscara gigante.', 'cascara', 'banana'],
  ['Mateo', 'hombre', 'La pisé y salí en tobogán por el pasillo, bien sentado.', 'piso', 'banana'],
  ['Lila', 'mujer', 'Te sigo en el mismo tobogán. ¡Vamos más rápido que ellos!', 'tobogan', 'banana'],
  ['Guardia', 'hombre', 'Yo no me subo, pero resbalo igual. Este piso brilla mucho.', 'brillo', 'silbato'],
  ['Nico', 'hombre', 'Quedamos en fila, como bolos, y un zapato nos derriba a todos.', 'bolos', 'banana'],
  ['Lila', 'mujer', 'Me levanté de un salto y le puse la cáscara de sombrero.', 'sombrero', 'banana'],
  ['Mateo', 'hombre', 'Con sombrero de plátano corre lento. Se puso colorado.', 'verguenza', 'banana'],
  ['Nico', 'hombre', 'Se sacude el sombrero y nos saca la lengua otra vez.', 'lengua', 'globo'],
  ['Lila', 'mujer', 'Les saco la lengua y acelero. La meta es esa pantalla.', 'meta', 'arco'],
  ['Mateo', 'hombre', '¡Mira, Lila! La pantalla nos dejó parados en la cancha.', 'adentro', 'cohete'],
  ['Guardia', 'hombre', '¡Sujétense! Todavía nos jala por la cancha, hacia el arco.', 'jalon', 'cohete'],
  ['Lila', 'mujer', 'Todo es enorme aquí. Nosotros quedamos chiquititos, Mateo.', 'mini', 'cohete'],
  ['Mateo', 'hombre', 'Soy una hormiga con zapatillas. El campeón todavía no nos ve.', 'hormiga', 'cohete'],
  ['Nico', 'hombre', '¡Eh, campeón, aquí abajo! Mira, se agacha a buscarnos.', 'grito', 'cohete'],
  ['Lila', 'mujer', '¡Su dedo es una columna! Corran entre los dedos, ya.', 'dedo', 'cohete'],
  ['Mateo', 'hombre', 'Hay un túnel de cordones. Entro y salgo por el otro zapato.', 'tunel', 'zapato'],
  ['Guardia', 'hombre', 'Mi silbato, chiquito, pita como un pajarito bien enojado.', 'pajaro', 'silbato'],
  ['Lila', 'mujer', 'Ese pitazo corto quiere decir una cosa: doblen a la izquierda.', 'guia', 'silbato'],
  ['Mateo', 'hombre', 'Doblé y casi choco con una letra gigante. ¡Cuidado, Nico!', 'letra', 'cohete'],
  ['Nico', 'hombre', 'La letra se cae y nos sirve de resbalín. ¡Bajen conmigo!', 'resbalin', 'cohete'],
  ['Lila', 'mujer', 'Al final hay una pelota de playa, más alta que nosotros.', 'playa', 'pelota'],
  ['Mateo', 'hombre', 'La empujamos entre los tres. Rueda derecho hacia el arco.', 'empuje', 'pelota'],
  ['Guardia', 'hombre', 'Ese verde es la cancha. Al fondo el arco es un edificio.', 'cancha', 'arco'],
  ['Lila', 'mujer', '¡Ese arco es la meta! Si metemos gol, los zapatos vuelven.', 'volver', 'arco'],
  ['Mateo', 'hombre', 'Empujo con el hombro. Me hundo y la pelota apenas anda.', 'hombro', 'pelota'],
  ['Nico', 'hombre', 'Me lanzo suavecito y la pelota da un bote enorme al arco.', 'bote', 'pelota'],
  ['Lila', 'mujer', '¡Sigue, sigue! Corro al lado y la apuro con las dos manos.', 'apuro', 'pelota'],
  ['Guardia', 'hombre', 'Soplo tan fuerte que el viento la empuja hasta el arco.', 'viento', 'silbato'],
  ['Mateo', 'hombre', '¡Gol, Lila! La pelota entró y el arco de la cancha se sacude.', 'gol', 'arco'],
  ['Lila', 'mujer', 'Míralos en la pantalla: aplauden con las lengüetas, Mateo.', 'lenguetas', 'zapato'],
  ['Nico', 'hombre', 'Hacen una reverencia. Creo que ya nos aceptan de campeones.', 'reverencia', 'globo'],
  ['Mateo', 'hombre', 'Me cayó una corona de papel. Queda chueca, pero me queda.', 'corona', 'globo'],
  ['Guardia', 'hombre', 'Niños cuatro, zapatos tres. Y el silbato se puso a llorar.', 'resultado', 'silbato'],
  ['Lila', 'mujer', 'No llores, silbato. Tú también corriste. Te dibujo en la copa.', 'copa', 'silbato'],
  ['Mateo', 'hombre', 'La copa es la pelota. Le escribimos los nombres, Nico.', 'nombres', 'pelota'],
  ['Nico', 'hombre', 'Escribo Nico enorme. La pelota se ríe y la letra se dora.', 'dorado', 'globo'],
  ['Lila', 'mujer', 'Todo se pone dorado. Los zapatos se atan y vuelven al campeón.', 'atan', 'zapato'],
  ['Mateo', 'hombre', 'El campeón nos guiña un ojo y la carrera sigue en la tela.', 'guino', 'cohete'],
  ['Guardia', 'hombre', '¡Ay! La pantalla nos devuelve. Caemos en las butacas.', 'tiron', 'cohete'],
  ['Lila', 'mujer', 'Crezco de golpe y casi golpeo el techo. Ya tengo mi tamaño.', 'crecer', 'cohete'],
  ['Mateo', 'hombre', 'Yo crezco y me enredo en la polera. Salgo como de un saco.', 'saco', 'cohete'],
  ['Nico', 'hombre', 'Mi calcetín volvió al pie, pidió perdón y ya se quedó quieto.', 'perdon', 'globo'],
  ['Lila', 'mujer', 'En la pantalla los zapatos corren adentro, no por nuestra sala.', 'ensala', 'zapato'],
  ['Mateo', 'hombre', 'El marcador pone nuestros nombres al lado del campeón.', 'marcador', 'pelota'],
  ['Guardia', 'hombre', 'Les saco una foto con el silbato. Sale movida, nadie paró.', 'foto', 'silbato'],
  ['Nico', 'hombre', 'En los créditos salgo yo: especialista en calcetines. ¡Aplaudan!', 'creditos', 'globo'],
  ['Lila', 'mujer', 'Aplaudimos todos. Hasta las butacas hacen clac clac con nosotros.', 'aplauso', 'zapato'],
  ['Mateo', 'hombre', 'Ese clac clac sigue el ritmo. La sala entera es hinchada.', 'hinchada', 'zapato'],
  ['Guardia', 'hombre', 'Yo hincho por ustedes. Se me cae la gorra y la dejo, ya cumplió.', 'hincho', 'silbato'],
  ['Lila', 'mujer', 'La gorra rueda hasta la pantalla, saluda y se queda de mascota.', 'mascota', 'globo'],
  ['Mateo', 'hombre', 'La mascota ahora es una gorra. Mejor final que la sinopsis.', 'sinopsis', 'globo'],
  ['Nico', 'hombre', 'La sinopsis era aburrida. La de verdad tuvo tobogán y gol.', 'lloron', 'silbato'],
  ['Lila', 'mujer', 'Mañana pido la de los cohetes. Si se salen, salgo primera.', 'cohetes', 'cohete'],
  ['Mateo', 'hombre', 'Si se sale un cohete, le pongo nombre y lo paseo por la sala.', 'vuelta', 'cohete'],
  ['Guardia', 'hombre', 'Mañana se puede correr, siempre que al final haya un gol.', 'normas', 'silbato'],
  ['Nico', 'hombre', 'Trato hecho. Traigo el calcetín de la suerte y un chiste peor.', 'trato', 'globo'],
  ['Lila', 'mujer', 'Último relevo: te paso el ritmo, Mateo, y tú se lo pasas a Nico.', 'relevo', 'zapato'],
  ['Mateo', 'hombre', 'Recibo la posta, giro y se la doy al guardia. ¡Sigue corriendo!', 'posta', 'zapato'],
  ['Guardia', 'hombre', 'Nunca corrí tan contento. El silbato bota en mi bolsillo.', 'bolsillo', 'silbato'],
  ['Nico', 'hombre', 'Esos botes suenan a canción. La sala la tararea con nosotros.', 'cancion', 'silbato'],
  ['Lila', 'mujer', 'Yo también tarareo y mis pies siguen el compás. Nadie para.', 'compas', 'zapato'],
  ['Mateo', 'hombre', 'Brinco una butaca, luego otra. La tercera me devuelve el salto.', 'trampolin', 'zapato'],
  ['Lila', 'mujer', 'Uso el mismo trampolín, doy una voltereta y aterrizo de pie.', 'voltereta', 'zapato'],
  ['Nico', 'hombre', 'Mi voltereta sale chueca y igual aplaudo. El intento fue grande.', 'chueca', 'globo'],
  ['Guardia', 'hombre', 'El intento cuenta. Anoto: equipo completo, cero zapatos sueltos.', 'libreta', 'silbato'],
  ['Lila', 'mujer', 'La libreta se cierra de un golpe. También va apurada, guardia.', 'cierra', 'zapato'],
  ['Mateo', 'hombre', 'El apuro ahora es bueno: queremos ver el final de la tarde.', 'tarde', 'zapato'],
  ['Nico', 'hombre', 'La tarde cabe en la sala. Afuera espera. Aquí vamos ganando.', 'ganando', 'globo'],
  ['Lila', 'mujer', 'Vamos ganando y no paramos. Celebramos corriendo, Mateo.', 'corriendo', 'zapato'],
  ['Mateo', 'hombre', 'Festejo con un baile corto: dos pasos, un giro y el dedo arriba.', 'baile', 'pelota'],
  ['Guardia', 'hombre', 'Bailo el mismo paso, bien tieso, y el silbato se ríe en el bolsillo.', 'tieso', 'silbato'],
  ['Nico', 'hombre', 'Esa risa es un pitido agudo. Hasta los zapatos de la peli lo copian.', 'copian', 'zapato'],
  ['Lila', 'mujer', 'Si copian nuestra risa, mañana la carrera es un chiste con piernas.', 'piernas', 'zapato'],
  ['Mateo', 'hombre', 'Un chiste con piernas es mi deporte favorito, si termino de pie.', 'deporte', 'zapato'],
  ['Guardia', 'hombre', 'De pie y en movimiento. Así se mira la peli en esta sala.', 'depie', 'silbato'],
  ['Nico', 'hombre', 'Desde hoy traigo calcetines extra, por si alguno quiere correr.', 'extra', 'globo'],
  ['Lila', 'mujer', 'Se apagan las luces de la carrera y se prenden las nuestras. Ganamos.', 'final', 'zapato'],
]);

function armarNovela(filas) {
  let lx = 110, mx = 78;
  return filas.map((f, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const l0 = lx, m0 = mx;
    lx = rebotarX(l0 + dir * (64 + (i % 5) * 18), 86, 520);
    mx = rebotarX(m0 - dir * (58 + (i % 4) * 22), 72, 540);
    if (Math.abs(lx - l0) < 28) lx = rebotarX(l0 + (l0 < 300 ? 96 : -96), 86, 520);
    if (Math.abs(mx - m0) < 28) mx = rebotarX(m0 + (m0 < 300 ? 96 : -96), 72, 540);
    return escena(f[0], f[1], f[2], f[3], [l0, lx], [m0, mx], f[4]);
  });
}

export const CINE_ESCENAS = Object.freeze(armarNovela(NOVELA_FILAS));

const FONDO_FIJO = Object.freeze({
  llegar: '#14532d', saltan: '#16a34a', persecucion: '#c2410c', cascara: '#ca8a04',
  gol: '#1d4ed8', alto: '#1e3a8a', final: '#020617', piso: '#eab308', tobogan: '#f59e0b',
});

export function modoEscena(accion) {
  return accion || 'sala';
}

function fondoDe(accion) {
  if (FONDO_FIJO[accion]) return FONDO_FIJO[accion];
  let h = 2166136261;
  for (let i = 0; i < accion.length; i++) h = Math.imul(h ^ accion.charCodeAt(i), 16777619);
  const r = 48 + (h & 160);
  const g = 36 + ((h >>> 8) & 130);
  const b = 48 + ((h >>> 16) & 150);
  const hex = n => n.toString(16).padStart(2, '0');
  return '#' + hex(r) + hex(g) + hex(b);
}

const CINE_PASILLO = new Set(['reto', 'amarra', 'vueltas', 'calcetin', 'zigzag', 'venia', 'alto', 'pitazo', 'chiste', 'espacio', 'carcajada', 'zancadilla', 'reves', 'medias', 'equipo', 'trote', 'planeo', 'autografo', 'celoso', 'pelea', 'ventaja', 'curva', 'salida', 'bloqueo', 'trompo', 'porra', 'persecucion', 'banquillo', 'brinco', 'tarjeta', 'tropiezo', 'suerte', 'capa', 'cordones', 'atajo', 'despeine', 'heroe', 'arbitro', 'barrera', 'boing', 'cascara', 'piso', 'tobogan', 'brillo', 'bolos', 'sombrero', 'verguenza', 'lengua', 'meta']);
const CINE_CANCHA = new Set(['adentro', 'jalon', 'mini', 'hormiga', 'grito', 'dedo', 'tunel', 'pajaro', 'guia', 'letra', 'resbalin', 'playa', 'empuje', 'cancha', 'volver', 'hombro', 'bote', 'apuro', 'viento', 'gol']);
const CINE_SALTA = new Set(['saltan', 'brinco', 'boing', 'voltereta', 'trampolin', 'bote']);
const CINE_RESBALA = new Set(['piso', 'tobogan', 'resbalin', 'trompo', 'tropiezo']);
const CINE_FRENA = new Set(['alto', 'bloqueo', 'barrera']);

export function lugarDeCine(accion) {
  if (CINE_CANCHA.has(accion)) return 'cancha';
  if (CINE_PASILLO.has(accion)) return 'pasillo';
  return 'sala';
}

export function poseDeCine(accion) {
  if (CINE_SALTA.has(accion)) return 'salta';
  if (CINE_RESBALA.has(accion)) return 'resbala';
  if (CINE_FRENA.has(accion)) return 'frena';
  return 'corre';
}

export function cineObjetos(accion, u) {
  const t = Math.max(0, Math.min(1, u || 0));
  const esc = CINE_ESCENAS.find(e => e.accion === accion);
  const tipo = (esc && esc.tipo) || 'zapato';
  const lugar = lugarDeCine(accion);
  const n = (v) => Math.round(v);
  if (accion === 'saltan') {
    return [
      { tipo: 'zapato', x: n(292 + t * 40), y: n(68 + t * 155), a: +(t * 8).toFixed(3), s: 1.85 },
      { tipo: 'blob', x: n(240 + t * 24), y: n(58 + t * 20), a: +t.toFixed(3), color: '#f8fafc' },
    ];
  }
  if (lugar === 'sala' && (accion === 'llegar' || accion === 'pista')) {
    return [
      { tipo: 'zapato', x: n(236 + t * 110), y: n(98 - Math.sin(t * Math.PI) * 18), a: +(t * 6).toFixed(3), s: 1.4 },
      { tipo: 'blob', x: n(160 + t * 50), y: 64, a: +(t * 2).toFixed(3), color: '#fde68a' },
    ];
  }
  if (lugar === 'cancha') {
    return [
      { tipo: 'pelota', x: n(64 + t * 430), y: n(198 - Math.sin(t * Math.PI) * 48), a: +(t * 7).toFixed(3) },
      { tipo: 'arco', x: 548, y: 168, a: +t.toFixed(3) },
    ];
  }
  if (tipo === 'banana') {
    return [
      { tipo: 'banana', x: n(150 + t * 90), y: 232, a: +(1.1 + t * 4).toFixed(3) },
      { tipo: 'zapato', x: n(48 + t * 480), y: n(186 - Math.abs(Math.sin(t * Math.PI * 4)) * 36), a: +(t * 9).toFixed(3) },
    ];
  }
  return [
    { tipo, x: n(32 + t * 540), y: n(184 - Math.abs(Math.sin(t * Math.PI * 4)) * 42), a: +(t * 9).toFixed(3) },
    { tipo: 'blob', x: n(70 + ((t * 1.4) % 1) * 470), y: n(68 + Math.sin(t * Math.PI * 6) * 16), a: +t.toFixed(3), color: '#f8fafc' },
  ];
}

function elevaCine(nombre, habla, pose, t) {
  if (pose === 'salta' && nombre === habla) return Math.sin(t * Math.PI) * 78;
  if (pose === 'resbala' && nombre === habla) return -26;
  if (pose === 'frena' && nombre === habla) return 2;
  return Math.abs(Math.sin(t * Math.PI * 16)) * 18;
}

// Un cuadro del capítulo. `lt` va de 0 a 1 dentro de la escena y nadie se queda quieto.
export function frameCine(esc, lt) {
  const t = Math.max(0, Math.min(1, lt == null ? (esc.lt || 0) : lt));
  const accion = esc.accion;
  const bob = Math.sin(t * Math.PI * 16);
  const lugar = lugarDeCine(accion);
  const pose = poseDeCine(accion);
  const lx = esc.lila[0] + (esc.lila[1] - esc.lila[0]) * t + bob * 12;
  const mx = esc.mateo[0] + (esc.mateo[1] - esc.mateo[0]) * t - bob * 12;
  const yLila = 236 - elevaCine('Lila', esc.quien, pose, t);
  const yMateo = 236 - elevaCine('Mateo', esc.quien, pose, t);
  const extra = [];
  if (esc.quien === 'Nico') extra.push({ nombre: 'Nico', color: '#facc15', x: Math.round(48 + t * 300), y: Math.round(236 - elevaCine('Nico', esc.quien, pose, t)) });
  if (esc.quien === 'Guardia') extra.push({ nombre: 'Guardia', color: '#94a3b8', x: Math.round(560 - t * 200), y: Math.round(236 - elevaCine('Guardia', esc.quien, pose, t)) });
  const fondo = lugar === 'cancha' ? '#166534' : lugar === 'pasillo' ? '#44403c' : '#1e1b4b';
  return {
    accion,
    lugar,
    pose,
    fondo,
    lx: Math.round(lx),
    mx: Math.round(mx),
    yLila: Math.round(yLila),
    yMateo: Math.round(yMateo),
    bob: +bob.toFixed(3),
    relampago: accion === 'gol' && t > 0.55 && t < 0.8 ? 1 : 0,
    oscuro: accion === 'final' ? 0.35 : 0,
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
