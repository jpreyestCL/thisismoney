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
  ['Lila', 'mujer', '¡Llegué corriendo! En la pantalla hay una carrera de zapatos enormes.', 'llegar', 'zapato'],
  ['Mateo', 'hombre', 'El campeón va primero y sus zapatos rojos le sacan la lengua al segundo.', 'pista', 'zapato'],
  ['Lila', 'mujer', '¡Se salieron de la tela! Caen en el pasillo y arrancan sin pedir permiso.', 'saltan', 'zapato'],
  ['Mateo', 'hombre', 'Nos retan a una carrera. Si ganan, la peli se queda en pausa para siempre.', 'reto', 'zapato'],
  ['Lila', 'mujer', 'Me tiro a atarles los cordones y me arrastran de rodillas por la alfombra.', 'amarra', 'zapato'],
  ['Mateo', 'hombre', 'Doy vueltas a una butaca. Ellos ya completaron tres y van por la cuarta.', 'vueltas', 'zapato'],
  ['Nico', 'hombre', '¡Espérenme! Mi calcetín se soltó y quiere correr su propia carrera.', 'calcetin', 'globo'],
  ['Lila', 'mujer', 'El calcetín le tapó un ojo al zapato rojo y ahora va en zigzag.', 'zigzag', 'zapato'],
  ['Mateo', 'hombre', 'Chocan de frente, rebotan y se piden perdón con una venia ridícula.', 'venia', 'zapato'],
  ['Guardia', 'hombre', '¡Alto ahí! En mi sala se camina. Ellos le hacen burla y aceleran más.', 'alto', 'silbato'],
  ['Lila', 'mujer', 'El guardia sopla el silbato y el silbato se cree el árbitro del mundo.', 'pitazo', 'silbato'],
  ['Mateo', 'hombre', 'Cada pitazo los pone más rápidos. Guardia, cuéntales un chiste malísimo.', 'chiste', 'silbato'],
  ['Guardia', 'hombre', '¿Qué hace un zapato en el espacio? Da una vuelta y se marea al sol.', 'espacio', 'silbato'],
  ['Lila', 'mujer', 'Se ríen tanto que se desatan solos. ¡Ahora sí, a atraparlos en el aire!', 'carcajada', 'zapato'],
  ['Mateo', 'hombre', 'Agarro uno. El otro me hace una zancadilla y salgo volando de verdad.', 'zancadilla', 'zapato'],
  ['Lila', 'mujer', 'Pasas sobre dos butacas y aterrizas sentado al revés. Punto para nosotros.', 'reves', 'zapato'],
  ['Nico', 'hombre', 'Mis dos medias se aliaron con ellos. Ahora el equipo enemigo tiene refuerzos.', 'medias', 'globo'],
  ['Lila', 'mujer', 'Entonces corremos juntos: tú, yo, Nico y el guardia, en una sola fila.', 'equipo', 'zapato'],
  ['Guardia', 'hombre', 'Corro con la gorra en la mano. La gorra también quiere inscribirse.', 'trote', 'silbato'],
  ['Mateo', 'hombre', 'La gorra despega, planea sobre las luces y se pone sola en el zapato líder.', 'planeo', 'globo'],
  ['Lila', 'mujer', 'Con gorra se cree campeón y empieza a firmar autógrafos en el aire.', 'autografo', 'zapato'],
  ['Mateo', 'hombre', 'El otro zapato se pone celoso y le quita la gorra de un puntapié.', 'celoso', 'zapato'],
  ['Nico', 'hombre', 'Se pelean la gorra, dan saltos y se olvidan de que nosotros seguimos corriendo.', 'pelea', 'globo'],
  ['Lila', 'mujer', '¡Vamos primeros! Doblo en la fila siete y casi piso la mano de Mateo.', 'ventaja', 'zapato'],
  ['Mateo', 'hombre', 'Tomo la curva agachado. Un cordón suelto me roza la oreja como un látigo.', 'curva', 'zapato'],
  ['Guardia', 'hombre', '¡Cuidado con la salida! Si cruzan la puerta, la peli no vuelve a andar.', 'salida', 'silbato'],
  ['Lila', 'mujer', 'Me planto en la salida con los brazos abiertos. Ellos frenan y resbalan.', 'bloqueo', 'zapato'],
  ['Mateo', 'hombre', 'Resbalan, giran como trompos y quedan mirando hacia la pantalla otra vez.', 'trompo', 'zapato'],
  ['Nico', 'hombre', '¡Eso! Les hago porra con el calcetín. Se ofenden y arrancan de vuelta.', 'porra', 'globo'],
  ['Lila', 'mujer', 'Los persigo por el pasillo central. Las butacas aplauden solas a nuestro paso.', 'persecucion', 'zapato'],
  ['Mateo', 'hombre', 'Un banquillo de la peli se cae de la pantalla y rueda entre mis pies.', 'banquillo', 'pelota'],
  ['Lila', 'mujer', 'Salto el banquillo, Mateo lo patea sin querer y nos adelanta por la derecha.', 'brinco', 'zapato'],
  ['Guardia', 'hombre', 'El silbato saca una tarjeta amarilla imaginaria y nos la muestra muy serio.', 'tarjeta', 'silbato'],
  ['Nico', 'hombre', 'Me río tan fuerte que tropiezo, ruedo y adelanto igual, de pura suerte.', 'tropiezo', 'globo'],
  ['Lila', 'mujer', 'La suerte también corre. Hoy va con nosotros y lleva una capa invisible.', 'suerte', 'zapato'],
  ['Mateo', 'hombre', '¿Capa invisible? Entonces ¿por qué le veo los cordones flotando atrás?', 'capa', 'globo'],
  ['Lila', 'mujer', 'Porque los cordones no se enteraron de que la capa era invisible. Sigan.', 'cordones', 'zapato'],
  ['Nico', 'hombre', 'Conozco un atajo por la fila de adelante. ¡Agáchense, que el techo es bajo!', 'atajo', 'globo'],
  ['Mateo', 'hombre', 'Me agacho tarde. Un zapato me pasa por arriba y me despeina la chasquilla.', 'despeine', 'zapato'],
  ['Lila', 'mujer', 'Quedas con la chasquilla parada. Pareces un superhéroe con prisa y sin capa.', 'heroe', 'zapato'],
  ['Guardia', 'hombre', 'Si son superhéroes, yo soy el árbitro. Y el árbitro también puede ganar.', 'arbitro', 'silbato'],
  ['Mateo', 'hombre', 'El guardia abre los brazos. Los zapatos rebotan en su pancita como en un muro.', 'barrera', 'pelota'],
  ['Lila', 'mujer', '¡Boing! Salen disparados hacia la pantalla. Nico, no te quedes mirando.', 'boing', 'zapato'],
  ['Nico', 'hombre', '¡Miren el piso! De la peli se cayó una cáscara de plátano gigante.', 'cascara', 'banana'],
  ['Mateo', 'hombre', 'La piso, salgo en tobogán y atravieso media sala sentado y gritando.', 'piso', 'banana'],
  ['Lila', 'mujer', 'Te sigo en el mismo tobogán. ¡Esto es más rápido que cualquier zapato!', 'tobogan', 'banana'],
  ['Guardia', 'hombre', 'Yo no me subo. Resbalo igual, porque el piso quedó brillante como una pista.', 'brillo', 'silbato'],
  ['Nico', 'hombre', 'Quedamos los cuatro en fila, como bolos, y un zapato nos derriba a todos.', 'bolos', 'banana'],
  ['Lila', 'mujer', 'Me levanto de un salto, agarro la cáscara y se la pongo de sombrero al líder.', 'sombrero', 'banana'],
  ['Mateo', 'hombre', 'Con sombrero de plátano pierde el estilo y corre más lento, de vergüenza.', 'verguenza', 'banana'],
  ['Nico', 'hombre', 'La vergüenza dura poco. Se sacude el sombrero y nos saca otra vez la lengua.', 'lengua', 'globo'],
  ['Lila', 'mujer', 'Les saco la lengua de vuelta y acelero. La meta es la pantalla, no la puerta.', 'meta', 'arco'],
  ['Mateo', 'hombre', 'Si llegamos a la pantalla antes que ellos, la carrera se juega adentro.', 'adentro', 'cohete'],
  ['Guardia', 'hombre', 'La pantalla nos jala como una aspiradora gigante. ¡Sujétense de algo!', 'jalon', 'cohete'],
  ['Lila', 'mujer', '¡Estamos dentro de la peli! Todo es enorme y nosotros quedamos chiquititos.', 'mini', 'cohete'],
  ['Mateo', 'hombre', 'Soy del tamaño de una hormiga con zapatillas. El campeón ni nos ve todavía.', 'hormiga', 'cohete'],
  ['Nico', 'hombre', '¡Eh, campeón, aquí abajo! Mi voz sale fina y él se agacha a buscarnos.', 'grito', 'cohete'],
  ['Lila', 'mujer', 'Su dedo es una columna. Corremos entre los dedos antes de que nos aplaste.', 'dedo', 'cohete'],
  ['Mateo', 'hombre', 'Hay un túnel de cordones. Entro primero y salgo por el otro zapato, mareado.', 'tunel', 'zapato'],
  ['Guardia', 'hombre', 'Yo también entré. Mi silbato, chiquito, pita como un pajarito enojado.', 'pajaro', 'silbato'],
  ['Lila', 'mujer', 'El pajarito nos guía. Cada pitazo corto significa doblar a la izquierda.', 'guia', 'silbato'],
  ['Mateo', 'hombre', 'Doblo a la izquierda y casi choco con una letra gigante de los créditos.', 'letra', 'cohete'],
  ['Nico', 'hombre', 'La letra R se cae y nos sirve de resbalín. Bajamos gritando de gusto.', 'resbalin', 'cohete'],
  ['Lila', 'mujer', 'Al final del resbalín hay una pelota de playa, más alta que nosotros.', 'playa', 'pelota'],
  ['Mateo', 'hombre', 'La empujamos entre los tres. Rueda despacito y aplasta un hilito de pasto.', 'empuje', 'pelota'],
  ['Guardia', 'hombre', 'Ese pasto es la cancha. Al fondo veo un arco del tamaño de un edificio.', 'cancha', 'arco'],
  ['Lila', 'mujer', '¡Ese arco es la meta! Si metemos la pelota, los zapatos tienen que volver.', 'volver', 'arco'],
  ['Mateo', 'hombre', 'Empujo con el hombro. La pelota apenas se mueve y yo quedo hundido en ella.', 'hombro', 'pelota'],
  ['Nico', 'hombre', 'Me lanzo de cabeza, suavecito, y la pelota da un bote enorme hacia el arco.', 'bote', 'pelota'],
  ['Lila', 'mujer', '¡Sigue, sigue! Corro al lado de la pelota y la apuro con las dos manos.', 'apuro', 'pelota'],
  ['Guardia', 'hombre', 'Soplo el silbato tan fuerte que el viento la empuja los últimos metros.', 'viento', 'silbato'],
  ['Mateo', 'hombre', '¡Gol! La pelota entra, el arco se sacude y las luces de la cancha parpadean.', 'gol', 'arco'],
  ['Lila', 'mujer', 'Los zapatos rojos aparecen, se miran y empiezan a aplaudir con las lengüetas.', 'lenguetas', 'zapato'],
  ['Nico', 'hombre', 'Hacen una reverencia. Creo que acaban de aceptarnos como campeones de verdad.', 'reverencia', 'globo'],
  ['Mateo', 'hombre', 'Una corona de papel cae del cielo de la peli y me queda chueca, pero me queda.', 'corona', 'globo'],
  ['Guardia', 'hombre', 'El silbato anuncia el resultado: niños cuatro, zapatos tres. Y se pone a llorar.', 'resultado', 'silbato'],
  ['Lila', 'mujer', 'No llores, silbato. Tú también corriste. Te vamos a dibujar en la copa.', 'copa', 'silbato'],
  ['Mateo', 'hombre', 'La copa es la pelota, con nuestros nombres escritos en marcador imaginario.', 'nombres', 'pelota'],
  ['Nico', 'hombre', 'Escribo Nico con letra enorme. La pelota se ríe y la letra se pone dorada.', 'dorado', 'globo'],
  ['Lila', 'mujer', 'Todo se pone dorado. Los zapatos se atan solos y vuelven a los pies del campeón.', 'atan', 'zapato'],
  ['Mateo', 'hombre', 'El campeón nos guiña un ojo, arranca y esta vez la carrera sigue en la tela.', 'guino', 'cohete'],
  ['Guardia', 'hombre', 'La pantalla nos devuelve de un tirón. Caemos en las butacas, todavía chiquitos.', 'tiron', 'cohete'],
  ['Lila', 'mujer', 'Crezco de golpe y casi golpeo el techo con la cabeza. Ya tengo mi tamaño.', 'crecer', 'cohete'],
  ['Mateo', 'hombre', 'Yo crezco y me enredo en mi propia polera. Salgo de ahí como de un saco.', 'saco', 'cohete'],
  ['Nico', 'hombre', 'Mi calcetín vuelve a mi pie, pide perdón y se queda quieto por fin.', 'perdon', 'globo'],
  ['Lila', 'mujer', 'En la pantalla, los zapatos corren donde deben: adentro, no por nuestra sala.', 'ensala', 'zapato'],
  ['Mateo', 'hombre', 'El marcador muestra nuestros nombres al lado del campeón. Salimos en la peli.', 'marcador', 'pelota'],
  ['Guardia', 'hombre', 'Saco una foto con el silbato. Sale movida, porque nadie se quedó quieto.', 'foto', 'silbato'],
  ['Nico', 'hombre', 'Miran los créditos: especialista en calcetines, Nico. Yo aplaudo solo.', 'creditos', 'globo'],
  ['Lila', 'mujer', 'Aplaudimos todos. Hasta las butacas hacen clac clac, como si tuvieran manos.', 'aplauso', 'zapato'],
  ['Mateo', 'hombre', 'El clac clac sigue el ritmo de la carrera. La sala entera es una hinchada.', 'hinchada', 'zapato'],
  ['Guardia', 'hombre', 'Yo hincho por los niños. Se me cae la gorra y la dejo, porque ya cumplió.', 'hincho', 'silbato'],
  ['Lila', 'mujer', 'La gorra rueda sola hasta la pantalla, saluda y se queda de mascota.', 'mascota', 'globo'],
  ['Mateo', 'hombre', 'La mascota de la peli ahora es una gorra. Mejor final que el de la sinopsis.', 'sinopsis', 'globo'],
  ['Nico', 'hombre', 'La sinopsis era aburrida. La de verdad tuvo tobogán, gol y un silbato llorón.', 'lloron', 'silbato'],
  ['Lila', 'mujer', 'Mañana pido la de los cohetes. Si se salen, esta vez yo salgo primera.', 'cohetes', 'cohete'],
  ['Mateo', 'hombre', 'Si se sale un cohete, yo le pongo nombre y lo llevo a dar una vuelta a la sala.', 'vuelta', 'cohete'],
  ['Guardia', 'hombre', 'Mañana las normas cambian: se puede correr, siempre que al final haya un gol.', 'normas', 'silbato'],
  ['Nico', 'hombre', 'Trato hecho. Yo traigo el calcetín de la suerte y un chiste peor que el de hoy.', 'trato', 'globo'],
  ['Lila', 'mujer', 'Último relevo: le paso el ritmo a Mateo y él se lo pasa a Nico sin parar.', 'relevo', 'zapato'],
  ['Mateo', 'hombre', 'Recibo la posta, giro y se la entrego al guardia, que pita y sigue corriendo.', 'posta', 'zapato'],
  ['Guardia', 'hombre', 'Nunca corrí tan contento. El silbato va en mi bolsillo, dando botes de gusto.', 'bolsillo', 'silbato'],
  ['Nico', 'hombre', 'Los botes del silbato suenan a canción. La sala la tararea sin que nadie la enseñe.', 'cancion', 'silbato'],
  ['Lila', 'mujer', 'Tarareo yo también y mis pies siguen el compás. Ya no hay nadie parado.', 'compas', 'zapato'],
  ['Mateo', 'hombre', 'Brinco una butaca, luego otra, y la tercera me devuelve el salto como trampolín.', 'trampolin', 'zapato'],
  ['Lila', 'mujer', 'Uso el mismo trampolín, doy una voltereta y aterrizo de pie, con los brazos arriba.', 'voltereta', 'zapato'],
  ['Nico', 'hombre', 'Mi voltereta sale chueca y termino aplaudiendo igual, porque el intento fue grande.', 'chueca', 'globo'],
  ['Guardia', 'hombre', 'El intento cuenta. En mi libreta anoto: equipo completo, cero zapatos sueltos.', 'libreta', 'silbato'],
  ['Lila', 'mujer', 'La libreta se cierra sola de un golpe, como si también estuviera apurada.', 'cierra', 'zapato'],
  ['Mateo', 'hombre', 'El apuro ahora es bueno: queremos ver el final antes de que se acabe la tarde.', 'tarde', 'zapato'],
  ['Nico', 'hombre', 'La tarde cabe en la sala. Afuera puede esperar. Adentro vamos ganando.', 'ganando', 'globo'],
  ['Lila', 'mujer', 'Vamos ganando y no paramos de movernos, ni para celebrar. Celebramos corriendo.', 'corriendo', 'zapato'],
  ['Mateo', 'hombre', 'Festejo con un baile cortito: dos pasos, un giro y un dedo apuntando al cielo.', 'baile', 'pelota'],
  ['Guardia', 'hombre', 'Bailo el mismo paso, muy tieso, y el silbato se muere de risa en el bolsillo.', 'tieso', 'silbato'],
  ['Nico', 'hombre', 'La risa del silbato es un pitido agudo. Hasta los zapatos de la peli lo copian.', 'copian', 'zapato'],
  ['Lila', 'mujer', 'Si ellos copian nuestra risa, la carrera de mañana va a ser un chiste con piernas.', 'piernas', 'zapato'],
  ['Mateo', 'hombre', 'Un chiste con piernas es mi deporte favorito. Sobre todo si termino de pie.', 'deporte', 'zapato'],
  ['Guardia', 'hombre', 'De pie y en movimiento. Así se mira una peli en esta sala, desde hoy.', 'depie', 'silbato'],
  ['Nico', 'hombre', 'Desde hoy traigo calcetines extra, por si alguno quiere volver a ser corredor.', 'extra', 'globo'],
  ['Lila', 'mujer', 'Se apagan las luces de la carrera y se prenden las nuestras. Ganamos, equipo.', 'final', 'zapato'],
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

export function cineObjetos(accion, u) {
  const t = Math.max(0, Math.min(1, u || 0));
  const esc = CINE_ESCENAS.find(e => e.accion === accion);
  const tipo = (esc && esc.tipo) || 'zapato';
  const x = Math.round(28 + t * 560);
  const y = Math.round(188 - Math.abs(Math.sin(t * Math.PI * 2)) * 70);
  return [
    { tipo, x, y, a: +(t * 9).toFixed(3) },
    { tipo: 'blob', x: Math.round(50 + ((t * 1.35) % 1) * 500), y: Math.round(64 + Math.sin(t * Math.PI * 6) * 28 + 24), a: +t.toFixed(3), color: '#f8fafc' },
  ];
}

// Un cuadro del capítulo. `lt` va de 0 a 1 dentro de la escena y nadie se queda quieto.
export function frameCine(esc, lt) {
  const t = Math.max(0, Math.min(1, lt == null ? (esc.lt || 0) : lt));
  const accion = esc.accion;
  const bob = Math.sin(t * Math.PI * 16);
  const salto = Math.abs(bob);
  const lx = esc.lila[0] + (esc.lila[1] - esc.lila[0]) * t + bob * 12;
  const mx = esc.mateo[0] + (esc.mateo[1] - esc.mateo[0]) * t - bob * 12;
  let yLila = 246 - salto * 26;
  let yMateo = 246 - salto * 22;
  if (esc.tipo === 'banana') yMateo = 246 + t * 42;
  if (accion === 'saltan' || accion === 'brinco' || accion === 'voltereta') yLila = 246 - Math.sin(t * Math.PI) * 88;
  const extra = [];
  if (esc.quien === 'Nico') extra.push({ nombre: 'Nico', color: '#facc15', x: Math.round(48 + t * 300), y: Math.round(258 - salto * 18) });
  if (esc.quien === 'Guardia') extra.push({ nombre: 'Guardia', color: '#94a3b8', x: Math.round(560 - t * 200), y: Math.round(244 - salto * 16) });
  return {
    accion,
    fondo: fondoDe(accion),
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
