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
  ['Lila', 'mujer', 'Mateo, ¿viste al rojo? Nos está sacando la lengua otra vez.', 'llegar', 'zapato'],
  ['Mateo', 'hombre', 'Lo vi. Si nos gana, no me hables en una semana, Lila.', 'pista', 'zapato'],
  ['Lila', 'mujer', '¡Ayúdame! Se me fue uno y no lo puedo agarrar.', 'saltan', 'zapato'],
  ['Mateo', 'hombre', '¡Ya voy! Si lo suelto, nos deja botados a los dos.', 'reto', 'zapato'],
  ['Lila', 'mujer', 'Agárrale el cordón, Mateo. Yo lo tengo del otro lado.', 'amarra', 'zapato'],
  ['Mateo', 'hombre', '¡No me sueltes! Este da vueltas y me está mareando.', 'vueltas', 'zapato'],
  ['Nico', 'hombre', '¡Espérenme! Se me salió el calcetín y corre más que yo.', 'calcetin', 'globo'],
  ['Lila', 'mujer', 'Nico, te ayudo. Tu calcetín le tapó un ojo al rojo.', 'zigzag', 'zapato'],
  ['Mateo', 'hombre', '¿Vieron eso? Chocaron y se pidieron perdón. Ja, ja.', 'venia', 'zapato'],
  ['Guardia', 'hombre', '¡Alto, niños! Aquí no se corre. Vuelvan a sus puestos.', 'alto', 'silbato'],
  ['Lila', 'mujer', 'Guardia, sopla nomás. Ellos no te van a hacer caso.', 'pitazo', 'silbato'],
  ['Mateo', 'hombre', 'Cuéntales un chiste malo, a ver si se detienen.', 'chiste', 'silbato'],
  ['Guardia', 'hombre', 'A ver: ¿qué le dijo un zapato al otro? Apriétame, que me suelto.', 'espacio', 'silbato'],
  ['Lila', 'mujer', 'Ja, ja, ja. Se rieron tanto que se soltaron. ¡Atrápalos!', 'carcajada', 'zapato'],
  ['Mateo', 'hombre', '¡Lila, ayúdame! Me hicieron una zancadilla y voy volando.', 'zancadilla', 'zapato'],
  ['Lila', 'mujer', 'Te tengo. Caíste al revés, pero el punto es nuestro.', 'reves', 'zapato'],
  ['Nico', 'hombre', 'Chicos, mis medias se fueron con ellos. ¿Me las recuperan?', 'medias', 'globo'],
  ['Lila', 'mujer', 'Vengan conmigo. Juntos les ganamos, Nico. ¿Vienes?', 'equipo', 'zapato'],
  ['Guardia', 'hombre', 'Yo también voy. Sosténme la gorra, que me estorba para correr.', 'trote', 'silbato'],
  ['Mateo', 'hombre', '¡Se te voló la gorra! Lila, ¿la pescas tú o la pesco yo?', 'planeo', 'globo'],
  ['Lila', 'mujer', 'Ja, ja. Con tu gorra el rojo se cree famoso. Déjalo.', 'autografo', 'zapato'],
  ['Mateo', 'hombre', 'El otro se puso celoso y se la quitó de una patada.', 'celoso', 'zapato'],
  ['Nico', 'hombre', 'Déjalos pelear. Nosotros seguimos, ¿o nos quedamos?', 'pelea', 'globo'],
  ['Lila', 'mujer', '¡Vamos primeros! Mateo, cuidado, casi te piso la mano.', 'ventaja', 'zapato'],
  ['Mateo', 'hombre', 'Gracias. Dobla tú, que a mí un cordón me pegó en la oreja.', 'curva', 'zapato'],
  ['Guardia', 'hombre', '¡Ni se les ocurra irse! Si se van, perdemos la peli.', 'salida', 'silbato'],
  ['Lila', 'mujer', 'Yo me quedo aquí, brazos abiertos. Mateo, cúbreme el otro lado.', 'bloqueo', 'zapato'],
  ['Mateo', 'hombre', 'Listo. Resbalaron y dieron vueltas. ¿Los agarramos ahora?', 'trompo', 'zapato'],
  ['Nico', 'hombre', '¡Bien! Les hago porra con el calcetín. ¿Sigo o corro?', 'porra', 'globo'],
  ['Lila', 'mujer', '¡Corre, Mateo! Yo voy detrás del rojo y tú del otro.', 'persecucion', 'zapato'],
  ['Mateo', 'hombre', '¡Cuidado con eso! Se me metió un banquillo entre los pies.', 'banquillo', 'pelota'],
  ['Lila', 'mujer', 'Lo salto. Si lo pateas, te adelantas. ¡Hazlo, Mateo!', 'brinco', 'zapato'],
  ['Guardia', 'hombre', 'Les saco tarjeta. ¿Me están escuchando o siguen de largo?', 'tarjeta', 'silbato'],
  ['Nico', 'hombre', 'Me reí, me caí y igual los pasé. ¡Qué risa, Lila!', 'tropiezo', 'globo'],
  ['Lila', 'mujer', 'Ja, ja. La suerte está contigo. ¿Me prestas un poco?', 'suerte', 'zapato'],
  ['Mateo', 'hombre', '¿Suerte invisible? Entonces ¿por qué veo esos cordones?', 'capa', 'globo'],
  ['Lila', 'mujer', 'Porque los cordones no se enteraron. Sigan, no paren.', 'cordones', 'zapato'],
  ['Nico', 'hombre', 'Por aquí es más corto. ¡Agáchense o se pegan la cabeza!', 'atajo', 'globo'],
  ['Mateo', 'hombre', 'Me agaché tarde. Uno me pasó encima y me dejó la chasquilla parada.', 'despeine', 'zapato'],
  ['Lila', 'mujer', 'Ja, ja, pareces superhéroe. ¿Te la peino después, Mateo?', 'heroe', 'zapato'],
  ['Guardia', 'hombre', 'Si ustedes son héroes, yo pitó. Y también quiero ganar.', 'arbitro', 'silbato'],
  ['Mateo', 'hombre', 'Abre los brazos, guardia. Rebotan en tu guata y vuelven.', 'barrera', 'pelota'],
  ['Lila', 'mujer', '¡Boing! Salieron disparados. Nico, no te quedes ahí.', 'boing', 'zapato'],
  ['Nico', 'hombre', '¡No pisen eso! Hay una cáscara y yo ya la vi tarde.', 'cascara', 'banana'],
  ['Mateo', 'hombre', 'La pisé. ¡Ayúdenme, voy sentado y no puedo parar!', 'piso', 'banana'],
  ['Lila', 'mujer', '¡Te sigo! Agárrame la mano, Mateo, que esto vuela.', 'tobogan', 'banana'],
  ['Guardia', 'hombre', 'Yo no me subo y resbalo igual. ¿Alguien me frena, por favor?', 'brillo', 'silbato'],
  ['Nico', 'hombre', 'Quedamos los cuatro tirados. ¿Quién nos derribó, Lila?', 'bolos', 'banana'],
  ['Lila', 'mujer', 'Yo me levanté y le puse la cáscara de sombrero. ¿Se ríen?', 'sombrero', 'banana'],
  ['Mateo', 'hombre', 'Ja, ja, sí. Con eso corre lento. Se puso colorado.', 'verguenza', 'banana'],
  ['Nico', 'hombre', 'Se lo sacudió y nos saca la lengua. ¿Se la sacamos también?', 'lengua', 'globo'],
  ['Lila', 'mujer', 'Sí. Sáquenle la lengua y corran, que la meta es de nosotros.', 'meta', 'arco'],
  ['Mateo', 'hombre', '¡Lila, agárrate de mí! Nos están chupando para adentro.', 'adentro', 'cohete'],
  ['Guardia', 'hombre', '¡Sujétense todos! Todavía nos jala y no llego al borde.', 'jalon', 'cohete'],
  ['Lila', 'mujer', 'Mateo, ¿me ves? Quedé chiquitita y todo me queda enorme.', 'mini', 'cohete'],
  ['Mateo', 'hombre', 'Te veo. Parecemos hormigas. El grande ni nos pesca.', 'hormiga', 'cohete'],
  ['Nico', 'hombre', '¡Oye, tú, el grande! Aquí abajo. ¿Nos vas a aplastar o qué?', 'grito', 'cohete'],
  ['Lila', 'mujer', '¡Corran! Su dedo baja y no quiero que nos pise.', 'dedo', 'cohete'],
  ['Mateo', 'hombre', 'Por los cordones. Entro yo primero. ¿Vienen o se quedan?', 'tunel', 'zapato'],
  ['Guardia', 'hombre', 'Mi silbato quedó chico y pita como pajarito. ¿Lo oyen?', 'pajaro', 'silbato'],
  ['Lila', 'mujer', 'Lo oigo. Si pita corto, doblamos a la izquierda. ¿Listos?', 'guia', 'silbato'],
  ['Mateo', 'hombre', '¡Cuidado, Nico! Casi me estrello con una letra gigante.', 'letra', 'cohete'],
  ['Nico', 'hombre', 'Se cayó y sirve para bajar. ¡Vengan, que yo ya me tiré!', 'resbalin', 'cohete'],
  ['Lila', 'mujer', '¿Y esa pelota? Es más alta que yo. Mateo, empújala conmigo.', 'playa', 'pelota'],
  ['Mateo', 'hombre', 'Empujo, pero pesa. Nico, ponle el hombro tú también.', 'empuje', 'pelota'],
  ['Guardia', 'hombre', 'Yo soplo desde atrás. Si meten gol, esos zapatos se rinden.', 'cancha', 'arco'],
  ['Lila', 'mujer', 'Si la metemos, se tienen que ir. Guardia, no pares de soplar.', 'volver', 'arco'],
  ['Mateo', 'hombre', 'Empujo con el hombro y me hundo. ¡Sáquenme, que no avanzo!', 'hombro', 'pelota'],
  ['Nico', 'hombre', 'Me tiro encima. ¿La vieron botar? Va para allá, Lila.', 'bote', 'pelota'],
  ['Lila', 'mujer', '¡La veo! Corro al lado y la apuro. No la suelten.', 'apuro', 'pelota'],
  ['Guardia', 'hombre', 'Soplo lo que puedo. Con este viento les tiene que entrar.', 'viento', 'silbato'],
  ['Mateo', 'hombre', '¡Gol, Lila! Entró. ¿La viste sacudirse o fui solo yo?', 'gol', 'arco'],
  ['Lila', 'mujer', 'La vi. Y esos rojos aplauden. ¿Nos están felicitando?', 'lenguetas', 'zapato'],
  ['Nico', 'hombre', 'Hasta hacen reverencia. Yo digo que ya somos campeones.', 'reverencia', 'globo'],
  ['Mateo', 'hombre', 'Me cayó una corona chueca. ¿Me queda bien o me la saco?', 'corona', 'globo'],
  ['Guardia', 'hombre', 'Niños cuatro, zapatos tres. Y mi silbato se puso a llorar.', 'resultado', 'silbato'],
  ['Lila', 'mujer', 'No lo hagas llorar, guardia. También corrió. Lo dibujo en la copa.', 'copa', 'silbato'],
  ['Mateo', 'hombre', 'La copa es la pelota. Nico, ¿escribimos los nombres?', 'nombres', 'pelota'],
  ['Nico', 'hombre', 'Ya escribí el mío, enorme. ¿Vieron que la letra se puso dorada?', 'dorado', 'globo'],
  ['Lila', 'mujer', 'Sí. Y los zapatos se atan solos. Que vuelvan con su dueño.', 'atan', 'zapato'],
  ['Mateo', 'hombre', 'El grande nos guiñó un ojo. ¿Seguimos o ya ganamos?', 'guino', 'cohete'],
  ['Guardia', 'hombre', '¡Ay, agárrense! Nos devuelve de golpe y yo no llego a sentarme.', 'tiron', 'cohete'],
  ['Lila', 'mujer', 'Crezco de golpe. Mateo, agáchate, que casi pego en el techo.', 'crecer', 'cohete'],
  ['Mateo', 'hombre', 'Yo también crezco y me enredé en la polera. ¿Me ayudas a salir?', 'saco', 'cohete'],
  ['Nico', 'hombre', 'Mi calcetín volvió, pidió perdón y se quedó quieto. Ja, ja.', 'perdon', 'globo'],
  ['Lila', 'mujer', 'Que se queden en la peli. Nosotros ya corrimos suficiente.', 'ensala', 'zapato'],
  ['Mateo', 'hombre', '¿Vieron el marcador? Puso nuestros nombres al lado del grande.', 'marcador', 'pelota'],
  ['Guardia', 'hombre', 'Les saco una foto. Quédense un segundo, aunque nadie se queda quieto.', 'foto', 'silbato'],
  ['Nico', 'hombre', '¡Aplaudan! En los créditos salgo yo, el de los calcetines.', 'creditos', 'globo'],
  ['Lila', 'mujer', 'Aplaudimos todos. Hasta las butacas hacen clac clac. ¿Lo oyen?', 'aplauso', 'zapato'],
  ['Mateo', 'hombre', 'Lo oigo. Llevan nuestro ritmo. Esto parece hinchada, Lila.', 'hinchada', 'zapato'],
  ['Guardia', 'hombre', 'Yo hincho por ustedes. Se me cayó la gorra. Déjenla, ya cumplió.', 'hincho', 'silbato'],
  ['Lila', 'mujer', 'Tu gorra se fue rodando y saludó. Ja, ja. Que se quede de mascota.', 'mascota', 'globo'],
  ['Mateo', 'hombre', 'Mejor final que el del afiche. ¿Pedimos otra mañana?', 'sinopsis', 'globo'],
  ['Nico', 'hombre', 'El afiche era fome. La de verdad tuvo tobogán, gol y un silbato llorón.', 'lloron', 'silbato'],
  ['Lila', 'mujer', 'Mañana pido la de los cohetes. Si se salen, yo salgo primera.', 'cohetes', 'cohete'],
  ['Mateo', 'hombre', 'Si se sale uno, le pongo nombre y lo paseo. ¿Me acompañas?', 'vuelta', 'cohete'],
  ['Guardia', 'hombre', 'Trato: mañana se puede correr, pero al final tiene que haber gol.', 'normas', 'silbato'],
  ['Nico', 'hombre', 'Trato hecho. Yo traigo el calcetín de la suerte y un chiste peor.', 'trato', 'globo'],
  ['Lila', 'mujer', 'Último relevo. Mateo, te paso el ritmo. Tú se lo pasas a Nico.', 'relevo', 'zapato'],
  ['Mateo', 'hombre', 'Lo recibo. Guardia, te lo entrego. ¡No pares de correr!', 'posta', 'zapato'],
  ['Guardia', 'hombre', 'Nunca corrí tan contento. El silbato me bota en el bolsillo.', 'bolsillo', 'silbato'],
  ['Nico', 'hombre', 'Esos botes suenan a canción. ¿La tararean conmigo o me dejan solo?', 'cancion', 'silbato'],
  ['Lila', 'mujer', 'La tarareo yo. Mis pies siguen el compás. Nadie se queda parado.', 'compas', 'zapato'],
  ['Mateo', 'hombre', 'Brinco una butaca y otra. Lila, la tercera me devolvió el salto.', 'trampolin', 'zapato'],
  ['Lila', 'mujer', 'La uso de trampolín, doy una voltereta y caigo de pie. ¿Me viste?', 'voltereta', 'zapato'],
  ['Nico', 'hombre', 'La mía salió chueca. Igual aplaudo. ¿Me cuentan el intento?', 'chueca', 'globo'],
  ['Guardia', 'hombre', 'Cuenta. Anoto: equipo completo y ni un zapato suelto.', 'libreta', 'silbato'],
  ['Lila', 'mujer', 'Tu libreta se cerró sola de un golpe. También va apurada, guardia.', 'cierra', 'zapato'],
  ['Mateo', 'hombre', 'El apuro ahora es bueno. ¿Alcanzamos a ver el final?', 'tarde', 'zapato'],
  ['Nico', 'hombre', 'Afuera que espere. Aquí vamos ganando. ¿O me equivoco, Lila?', 'ganando', 'globo'],
  ['Lila', 'mujer', 'No te equivocas. Y no paramos ni para celebrar. ¿Corres, Mateo?', 'corriendo', 'zapato'],
  ['Mateo', 'hombre', 'Corro y bailo: dos pasos, un giro y el dedo para arriba.', 'baile', 'pelota'],
  ['Guardia', 'hombre', 'Yo bailo el mismo paso, bien tieso. ¿Se ríen de mí o conmigo?', 'tieso', 'silbato'],
  ['Nico', 'hombre', 'Con usted, guardia. Hasta los zapatos copian ese pitido. Ja, ja.', 'copian', 'zapato'],
  ['Lila', 'mujer', 'Si copian la risa, mañana esto es un chiste con piernas. ¿Van?', 'piernas', 'zapato'],
  ['Mateo', 'hombre', 'Voy. Un chiste con piernas es mi deporte, si termino de pie.', 'deporte', 'zapato'],
  ['Guardia', 'hombre', 'De pie y sin parar. Así me gusta verlos. ¿Repetimos mañana?', 'depie', 'silbato'],
  ['Nico', 'hombre', 'Mañana traigo calcetines de repuesto, por si alguno quiere correr.', 'extra', 'globo'],
  ['Lila', 'mujer', 'Trato, Nico. Se apagó la de ellos y quedó la nuestra. Ganamos.', 'final', 'zapato'],
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
    paso: t * Math.PI * 8,
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
