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

// Capítulo de cine, unos 10 minutos: empieza en la sala, se arma un problema
// y termina con la función salvada. Cada quien hace algo distinto.
// La voz dice solo `texto`: hombre grave o mujer aguda, sin «dice».
// lila/mateo son [desde, hasta] en la pantalla; el final de una es el inicio de la otra.
export const CINE_ESCENAS = Object.freeze([
  escena('Lila', 'mujer', '¡Por fin! La puerta de la sala está abierta y ya huelo la mantequilla.', 'llegar', [80, 150], [40, 40]),
  escena('Mateo', 'hombre', 'Pedí el balde gigante. Si se acaba antes del susto, pido otro.', 'comer', [150, 150], [40, 130]),
  escena('Lila', 'mujer', 'Tienes una palomita pegada en la ceja. Pareces un rey del maíz.', 'ceja', [150, 190], [130, 130]),
  escena('Mateo', 'hombre', 'Me la dejo. Así, si me duermo, el cine sabe que pagué entrada.', 'sentarse', [190, 190], [130, 180]),
  escena('Lila', 'mujer', 'La película es un caracol haciendo la tarea. Quiero aventura, no sumas.', 'caracol', [190, 230], [180, 180]),
  escena('Mateo', 'hombre', 'Se apagó la pantalla. O se durmió el caracol, o alguien cortó la luz.', 'oscuro', [230, 230], [180, 230]),
  escena('Lila', 'mujer', '¡Mira el pasillo! Rueda una palomita dorada, brillante como medalla.', 'dorada', [230, 270], [230, 230]),
  escena('Mateo', 'hombre', 'La pesco. Pesa más que las otras y tiene un dibujo en la mantequilla.', 'recoger', [270, 270], [230, 280]),
  escena('Lila', 'mujer', 'Es un mapa. La X queda detrás de la pantalla, junto a una puerta chica.', 'mapa', [270, 310], [280, 280]),
  escena('Mateo', 'hombre', '¿Y si la X es solo una mancha de soda? Igual yo voto por buscar el tesoro.', 'mancha', [310, 310], [280, 330]),
  escena('Lila', 'mujer', 'Agáchate. Avanzamos por la orilla, que el pasillo está muy alumbrado.', 'agachar', [310, 360], [330, 330]),
  escena('Mateo', 'hombre', '¡Una sombra se llevó un balde de la fila de atrás! Corrió en puntillas.', 'sombra', [360, 360], [330, 390]),
  escena('Lila', 'mujer', 'Si es un fantasma, mal negocio: los fantasmas no tienen estómago.', 'fantasma', [360, 400], [390, 390]),
  escena('Mateo', 'hombre', 'Entonces es un fantasma maleducado. Se llevó el balde y ni saludó.', 'apetito', [400, 400], [390, 430]),
  escena('Lila', 'mujer', 'Huellas amarillas en el piso. La mantequilla las delata hasta la butaca siete.', 'huellas', [400, 450], [430, 430]),
  escena('Mateo', 'hombre', 'Me arrodillo. Debajo hay una respiración y huele a perro después de la lluvia.', 'rodilla', [450, 450], [430, 480]),
  escena('Lila', 'mujer', '¡Me estornudó el zapato! Eso tiene nariz, bigotes y cero vergüenza.', 'estornudo', [450, 490], [480, 480]),
  escena('Mateo', 'hombre', 'No lo asustes. Si es un monstruo, le convido palomitas y negociamos.', 'ofrecer', [490, 490], [480, 520]),
  escena('Lila', 'mujer', 'Es un perrito con capa de servilletas. Por eso, de lejos, parecía un fantasma.', 'capa', [490, 530], [520, 520]),
  escena('Mateo', 'hombre', '¡Y sale un niño! La capa le queda enorme, casi le tapa las zapatillas.', 'nino', [530, 530], [520, 560]),
  escena('Nico', 'hombre', 'No soy un ladrón. Me llamo Nico. Perdí a mi mamá cuando fui al baño.', 'hola', [530, 530], [560, 560]),
  escena('Lila', 'mujer', 'Tu mamá está en el hall, vendiendo palomitas con las otras señoras.', 'mama', [530, 490], [560, 560]),
  escena('Nico', 'hombre', 'Canela tenía hambre. Junté lo del fondo de los baldes para que comiera.', 'canela', [490, 490], [560, 560]),
  escena('Mateo', 'hombre', '¿Y el mapa lo dibujó el gato con la pata? Vi un gato con bigotes de mantequilla.', 'gato', [490, 490], [560, 520]),
  escena('Lila', 'mujer', 'El gato pisó la mantequilla y dejó estrellas. El mapa igual es de alguien.', 'gato2', [490, 450], [520, 520]),
  escena('Mateo', 'hombre', 'Venía pegado a mi boleto. Al fondo avisa: la cabina no abre sin la palabra.', 'boleto', [450, 450], [520, 470]),
  escena('Lila', 'mujer', 'La cabina está detrás de la pantalla. Vamos antes de que el gato se coma la pista.', 'correr', [450, 380], [470, 470]),
  escena('Mateo', 'hombre', '¡Resbalé con un vaso de soda! Mi entrada al misterio fue de pompas.', 'resbalon', [380, 380], [470, 410]),
  escena('Lila', 'mujer', 'Te ayudo. Quedaste brillando. Si el guardia te ve, piensa que eres un farol.', 'reir', [380, 340], [410, 410]),
  escena('Mateo', 'hombre', 'Empujo la puertita y no cede. Le hice una reverencia y tampoco le importó.', 'puerta', [340, 340], [410, 360]),
  escena('Lila', 'mujer', 'Viene el guardia por el pasillo. Esconde al perro y pon cara de público.', 'guardia', [340, 300], [360, 360]),
  escena('Guardia', 'hombre', '¡Alto ahí! Los ladrones de palomitas siempre traen una historia larga.', 'alto', [300, 300], [360, 360]),
  escena('Mateo', 'hombre', 'Señor, devolvemos un perrito. Mi balde sigue conmigo y hasta con su tapa.', 'inocente', [300, 300], [360, 330]),
  escena('Lila', 'mujer', 'Mateo, la cola de Canela sale por tu chaqueta como una bandera.', 'cola', [300, 270], [330, 330]),
  escena('Mateo', 'hombre', 'Es mi cinturón. Hoy se levantó contento y por eso saluda a la gente.', 'cinturon', [270, 270], [330, 300]),
  escena('Nico', 'hombre', 'Canela, silencio. Ya. Ladró igual. El truco del cinturón quedó en el suelo.', 'ladrido', [270, 270], [300, 300]),
  escena('Guardia', 'hombre', 'Conozco ese mapa. Es del dueño: el foco del proyector se fundió y no hay función.', 'dueno', [270, 240], [300, 300]),
  escena('Lila', 'mujer', '¿El tesoro es un foco? Yo imaginaba monedas. Sin luz, el cine se queda mudo.', 'foco', [240, 210], [300, 300]),
  escena('Mateo', 'hombre', 'Pruebo la palabra palomitas. La puerta zumba y sigue más cerrada que antes.', 'clave', [210, 210], [300, 260]),
  escena('Lila', 'mujer', 'Pruebo Canela. Otro zumbo. Creo que la puerta se está divirtiendo con nosotros.', 'canela2', [210, 190], [260, 260]),
  escena('Nico', 'hombre', 'Mamá repite lo del balde rojo. La palabra va escrita al revés, en la base.', 'balde', [190, 190], [260, 260]),
  escena('Mateo', 'hombre', 'Volteo el balde. En la base está SALA, con letras gordas y una mancha de sal.', 'vuelta', [190, 190], [260, 220]),
  escena('Lila', 'mujer', 'Sala. Se escucha un clic y la puertita cede. Adentro huele a polvo dulce.', 'abrir', [190, 150], [220, 220]),
  escena('Mateo', 'hombre', 'Hay una caja con un foco de repuesto. Brilla como si hubiera estado esperando.', 'caja', [150, 150], [220, 180]),
  escena('Lila', 'mujer', 'Tú lo enroscas. Yo afirmo la escalera. Si te caes, el caracol gana la peli.', 'escalera', [150, 130], [180, 180]),
  escena('Mateo', 'hombre', 'Listo. La pantalla parpadea y el caracol se va de vacaciones para siempre.', 'pantalla', [130, 130], [180, 150]),
  escena('Lila', 'mujer', 'Ahora la pantalla muestra el hall. Tu mamá pregunta a las señoras por ti.', 'hall', [130, 200], [150, 150]),
  escena('Nico', 'hombre', '¡Ahí está! Corro con Canela. A mamá se le cae el balde y ni le importa.', 'correr2', [200, 200], [150, 200]),
  escena('Lila', 'mujer', 'Se abrazan tan fuerte que la capa de servilletas sale volando hasta la caja.', 'abrazo', [200, 250], [200, 200]),
  escena('Mateo', 'hombre', 'El dueño nos regala palomitas. Le pregunto si el caracol vuelve la otra semana.', 'premio', [250, 250], [200, 250]),
  escena('Guardia', 'hombre', 'Ni de broma. El caracol renunció. Esta sala estrena aventuras de verdad.', 'no', [250, 280], [250, 250]),
  escena('Lila', 'mujer', 'Mira: salimos nosotros en la pantalla, con el perro y el balde gigante.', 'heroes', [280, 320], [250, 250]),
  escena('Mateo', 'hombre', 'En los créditos, el gato figura como especialista en mantequilla. Merecido.', 'credito', [320, 320], [250, 290]),
  escena('Lila', 'mujer', 'Volvamos a las butacas. Ahora sí quiero ver cómo termina nuestra propia peli.', 'sentar', [320, 360], [290, 290]),
  escena('Mateo', 'hombre', 'La próxima traigo dos baldes: uno para comer y otro por si trae mapa.', 'dos', [360, 360], [290, 330]),
  escena('Lila', 'mujer', 'Se apagan las luces. Si aparece otro misterio, yo me levanto primero.', 'final', [360, 390], [330, 330]),
]);

const MODOS_CINE = Object.freeze({
  llegar: 'sala', comer: 'sala', ceja: 'sala', sentarse: 'sala', caracol: 'sala', sentar: 'sala', dos: 'sala', final: 'sala',
  oscuro: 'oscuro',
  dorada: 'oro', recoger: 'oro', mapa: 'oro', mancha: 'oro',
  agachar: 'pasillo', sombra: 'pasillo', fantasma: 'pasillo', apetito: 'pasillo', huellas: 'pasillo', correr: 'pasillo',
  rodilla: 'butaca', estornudo: 'butaca', ofrecer: 'butaca',
  capa: 'capa', nino: 'capa',
  hola: 'nino', mama: 'nino', canela: 'nino',
  gato: 'gato', gato2: 'gato',
  boleto: 'boleto',
  resbalon: 'resbalon', reir: 'resbalon',
  puerta: 'puerta', clave: 'puerta', canela2: 'puerta', balde: 'puerta', vuelta: 'puerta',
  guardia: 'guardia', alto: 'guardia', inocente: 'guardia', cola: 'guardia', cinturon: 'guardia', ladrido: 'guardia', dueno: 'guardia',
  foco: 'foco', caja: 'foco', escalera: 'foco',
  abrir: 'abrir',
  pantalla: 'pantalla', hall: 'pantalla', correr2: 'pantalla', abrazo: 'pantalla', premio: 'pantalla',
  no: 'heroes', heroes: 'heroes', credito: 'heroes',
});

export function modoEscena(accion) {
  return MODOS_CINE[accion] || 'sala';
}

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
