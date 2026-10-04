// El Edificio Mirador: conserje en el hall, ascensor con botonera, escaleras y
// departamentos numerados de $10000 con living, cocina, baño y pieza.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DISTRITOS, LUGARES, callesDelMapa, rectCalle, rectDistrito, seCruzan, validarMapa } from '../src/city-map.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Mismas medidas que TORRE en index.html (w 32 × d 20, más la marquesina al frente).
const TORRE = { x: LUGARES.torre.x, z: LUGARES.torre.z, w: 32, d: 20 };
const rect = (b, mx = 0, mz = mx) => ({
  minX: b.x - b.w / 2 - mx, maxX: b.x + b.w / 2 + mx,
  minZ: b.z - b.d / 2 - mz, maxZ: b.z + b.d / 2 + mz,
});

test('el edificio cabe en su manzana y no pisa la calle', () => {
  const r = rect(TORRE, .5, 2);
  const limite = rectDistrito(DISTRITOS.find(d => d.id === 'torre'));
  assert.ok(r.minX >= limite.minX && r.maxX <= limite.maxX, 'se sale de la manzana en x');
  assert.ok(r.minZ >= limite.minZ && r.maxZ <= limite.maxZ, 'se sale de la manzana en z');
  for (const calle of callesDelMapa()) assert.ok(!seCruzan(rectCalle(calle), rect(TORRE)), `se monta sobre ${calle.id}`);
  assert.deepEqual(validarMapa(), []);
});

test('el departamento cuesta $10000 y se compra con la conserje', () => {
  assert.match(html, /const TORRE_PRECIO = 10000/);
  assert.match(html, /function comprarDepto\(/);
  assert.match(html, /if \(!state\.creative\) addMoney\(-TORRE_PRECIO\)/);
  assert.match(html, /torreConserje/);
});

test('el ascensor tiene botones para elegir el piso y hay escaleras', () => {
  assert.match(html, /function elegirPiso\(/);
  assert.match(html, /id="liftbox"/);
  assert.match(html, /data-lift=/);
  assert.match(html, /function updateTorreLift\(/);
  assert.match(html, /TORRE_HUECO/);
});

test('con E se entra y se sale de los edificios (y los rascacielos suben a la azotea)', () => {
  assert.match(html, /const ENTRADAS = \[\]/);
  assert.match(html, /function tryEntrada\(/);
  assert.match(html, /if \(tryEntrada\(\)\) return;/);
  assert.match(html, /entradaAccion\(\)/);
  for (const nombre of ['Edificio Mirador', 'Banco Central', 'Penal La Roca']) assert.ok(html.includes("nombre: '" + nombre + "'"), nombre);
  assert.match(html, /nombre: 'rascacielos', azotea: true/);
});

test('pararte después de agacharte no te hace atravesar la losa', () => {
  assert.match(html, /if \(ojoAhora > ojoAntes && grounded\) player\.position\.y \+= ojoAhora - ojoAntes;/);
  assert.match(html, /pisoTorre: torreAdentro\(\) \? torreNivel\(\) : 0/);
});

test('bajo techo no llueve y en 1ª persona tu cuerpo solo sale en el espejo', () => {
  assert.match(html, /rainObj\.visible = !bajoTecho\(\)/);
  assert.match(html, /playerAvatar\.visible = cameraMode !== 0 && !state\.driving && !state\.riding;/);
  assert.equal((html.match(/\.add\(lunaConCuerpo\(luna\)\)/g) || []).length, 2);
});

test('el horno se apoya en el piso (no flota)', () => {
  assert.match(html, /oven: 0\.7/);
});

test('saltando en el depto no llegas al piso de arriba ni a otro depto', () => {
  assert.match(html, /function torreTechoOjo\(eye, y\)/);
  assert.match(html, /if \(player\.position\.y > techoTorre\)/);
  assert.equal((html.match(/top <= techoTorre/g) || []).length, 2);   // ni en losas ni encima de muebles/muros
});

test('el cuerpo se sienta, se acuesta y se ducha', () => {
  assert.match(html, /function poseJugador\(\)/);
  assert.match(html, /swingLimbs\(playerAvatar, dt \|\| 0\.016\);\n  poseJugador\(\);/);
  assert.match(html, /cama\.acostado = \{/);
  assert.match(html, /function empezarDucha\(d\)/);
  assert.match(html, /const DUCHA_SEG = 28/);   // el agua dura 4 veces los 7 s de antes
  assert.match(html, /if \(torreEspera\(o, 30\)\) return true;\n    empezarDucha/);   // la espera para volver a ducharte no se alargó
  assert.match(html, /updateDucha\(dt\);/);
  assert.match(html, /if \(ducha\) \{ vy = 0;/);   // dentro de la ducha no se camina
});

test('los muebles del depto están en el súper y usan el mismo builder al colocar', () => {
  const deptoShop = ['mesa', 'silla', 'cama', 'sofa', 'tele', 'mesa_tele', 'alfombra', 'bano', 'espejo', 'congelador', 'lavamanos', 'ducha', 'lampara_pie', 'play'];
  for (const k of deptoShop) assert.match(html, new RegExp("key: '" + k + "'"), 'falta en DECOR_ITEMS: ' + k);
  assert.match(html, /key: 'oven'/);   // horno de cocina (STORE_A)
  assert.match(html, /function buildColocadoDepto\(/);
  assert.match(html, /const DEPTO_SUPER_SHOP_KEYS/);
});

test('los muebles del depto se usan con E', () => {
  for (const t of ['tele', 'play', 'congelador', 'horno', 'lavamanos', 'ducha', 'lampara']) assert.match(html, new RegExp("objeto\\('" + t + "'"));
  for (const k of ['sofa', 'silla', 'bano', 'cama']) assert.match(html, new RegExp("asiento\\('" + k + "'"));
  assert.match(html, /if \(q\.tipo === 'objeto'\) return usarObjetoDepto\(q\.obj\)/);
  assert.match(html, /salida = sitOn\.salida/);   // te paras en un punto libre, no dentro del muro
});

test('el papá entra al Mirador y adentro no hay daño de monstruos', () => {
  assert.match(html, /function enInteriorMirador\(x, z\)/);
  assert.match(html, /function trasladarPapaConLaEntrada\(dest, entrando\)/);
  assert.match(html, /function acompanarPapaMirador\(dt\)/);
  assert.match(html, /if \(en\.nombre === 'Edificio Mirador'\) trasladarPapaConLaEntrada\(dest, !adentro\)/);
  assert.match(html, /if \(enInteriorMirador\(player\.position\.x, player\.position\.z\)\) return;/);
  assert.match(html, /if \(enInteriorMirador\(dad\.position\.x, dad\.position\.z\)\) return;/);
  assert.match(html, /const DUCHA_SEG = 28/);
});

test('la tele pasa programas y el lavamanos anima el lavado', () => {
  assert.match(html, /const PROGRAMAS_TV = \[/);
  assert.match(html, /function cambiarPrograma\(/);
  assert.match(html, /function empezarLavado\(/);
  assert.match(html, /function updateLavado\(/);
  assert.match(html, /id="tvbar"/);
  assert.match(html, /id="lavadofx"/);
  assert.match(html, /if \(o\.tipo === 'play'\) return abrirMenuPlay\(\)/);
  for (const nombre of ['Noticias del día', 'Dibujos animados', 'El partido', 'Cocina en casa', 'El clima', 'La novela', 'Documental', 'Concurso', 'El huerto', 'Buenos días', 'Música', 'Comedia']) {
    assert.ok(html.includes("nombre: '" + nombre + "'"), nombre);
  }
  for (const fn of ['dibujarNoticias', 'dibujarDibujos', 'dibujarPartido', 'dibujarCocina', 'dibujarNovela', 'dibujarDocumental', 'dibujarConcurso', 'dibujarHuertoTv', 'dibujarBuenosDias', 'dibujarMusica', 'dibujarComedia']) {
    assert.match(html, new RegExp('function ' + fn + '\\('));
  }
  for (const frase of ['Este zorro vive en el campo.', '¿Cuánto es dos más tres?', 'Correcto. Ganaste el punto.', 'Incorrecto. Perdiste.', '¿Cuánto es diez menos cuatro?', '¿Dónde está el banco de la ciudad?', '¿Quién llega con la maleta?', '¿Qué animal muestra el documental?', 'Planta la semilla.', 'Le echa agua.', 'Cosecha la manzana.', 'En la avenida hay obras.', 'Hay que salir temprano.', 'Sube la cantante al escenario.', 'Entra un hombre a la tienda.']) {
    assert.ok(html.includes("'" + frase + "'"), frase);
  }
  assert.match(html, /if \(id === 'documental'\) return lineaDocumental/);
  assert.match(html, /if \(id === 'musica'\) return lineaMusica/);
  assert.match(html, /if \(id === 'comedia'\) return lineaComedia/);
  assert.match(html, /if \(id === 'buenosdias'\) return lineaBuenosDias/);
  assert.match(html, /voz: 'periodista', texto/);
  assert.match(html, /arco === 'izq'/);
  assert.match(html, /arco === 'der'/);
  assert.match(html, /momento === 'pase'/);
  assert.doesNotMatch(html, /Peppa|Barcelona|Real Madrid|Manchester/);
  for (const tipo of ['incendio', 'asalto', 'politica', 'ciencia', 'salud', 'escuela', 'playa', 'aeropuerto', 'carcel', 'banco', 'mascota', 'extremo', 'estreno', 'proximo']) {
    assert.ok(html.includes("'" + tipo + "'"), tipo);
  }
  for (const nombre of ['INCENDIO', 'ASALTO', 'POLÍTICA', 'CIENCIA', 'SALUD', 'ESCUELA', 'PLAYA', 'AEROPUERTO', 'CÁRCEL', 'BANCO', 'MASCOTA PERDIDA', 'CLIMA EXTREMO']) {
    assert.ok(html.includes("'" + nombre + "'"), nombre);
  }
  assert.match(html, /tvRotuloNoticia\(ctx, tipo\)/);
  assert.match(html, /const ESTRENO_NOVELA = 'La novela'/);
  assert.match(html, /function dibujarCartelEstreno\(/);
  assert.match(html, /if \(fase\.intro\) \{ dibujarCartelEstreno/);
  assert.match(html, /function diaDePartida\(\)/);
  assert.match(html, /function temporadaActual\(\)/);
  assert.match(html, /function proximoEstreno\(\)/);
  assert.match(html, /function fraseDiasEstreno\(\)/);
  assert.match(html, /Math\.floor\(dia \/ 10\)/);
  const diaFn = html.slice(html.indexOf('function diaDePartida'), html.indexOf('function fichaTemporada'));
  assert.match(diaFn, /state\.night/);
  assert.doesNotMatch(diaFn, /phase === 'NIGHT'/);
  const fraseDias = html.slice(html.indexOf('function fraseDiasEstreno'), html.indexOf('function dibujarViñetaTemporada'));
  assert.match(fraseDias, /state\.night/);
  assert.ok(fraseDias.includes("'Hoy se estrena ' + titulo + '.'"));
  assert.ok(fraseDias.includes("'Falta 1 día para el estreno de ' + titulo + '.'"));
  assert.ok(fraseDias.includes("'Faltan ' + n + ' días para el estreno de ' + titulo + '.'"));
  assert.match(html, /function temporadaQueSeEstrena\(\)/);
  assert.match(html, /novelaTemporadaVista !== temp\.n/);
  assert.match(html, /tipo === 'estreno' \|\| tipo === 'proximo'\) texto = fraseDiasEstreno\(\)/);
  assert.match(html, /ctx\.fillText\(fraseDiasEstreno\(\), 16, 214\)/);
  assert.doesNotMatch(html, /Faltan 0 días|faltan 0 días/);
  assert.match(html, /PRÓXIMO ESTRENO/);
  assert.match(html, /TEMPORADA /);
  assert.match(html, /speechSynthesis/);
  assert.match(html, /es-CL/);
  assert.match(html, /es-ES/);
  assert.match(html, /const TV_NOTICIA_SEG = 15/);
  assert.match(html, /const TV_VOZ_ANTERIOR = \{ marca: 'default', lang: 'es-CL', pitch: 1, rate: 1 \}/);
  assert.match(html, /periodista: \{ marca: 'periodista', pitch: 0\.78, rate: 0\.86 \}/);
  assert.match(html, /comentarista: \{ marca: 'comentarista', pitch: 1\.18, rate: 1\.35 \}/);
  assert.match(html, /hombre: \{ marca: 'hombre', pitch: 0\.45, rate: 0\.92 \}/);
  assert.match(html, /mujer: \{ marca: 'mujer', pitch: 1\.55, rate: 1\.05 \}/);
  assert.match(html, /voz: 'periodista'/);
  assert.match(html, /voz: 'comentarista'/);
  assert.match(html, /voz: habla\[0\] === 'Lila' \? 'mujer' : 'hombre'/);
  assert.match(html, /u\.pitch = ficha\.pitch/);
  assert.match(html, /u\.rate = ficha\.rate/);
  assert.match(html, /u\.volume = 1/);
  assert.match(html, /u\.lang = 'es-CL'/);
  assert.match(html, /let tvUtterance = null/);
  assert.match(html, /tvUtterance = u/);
  assert.match(html, /const TV_OIR_RADIO = 24/);
  assert.match(html, /function teleCerca\(\) \{[\s\S]*?deptoAlrededor\(player\.position/);
  assert.match(html, /function hablarTeleEnGesto\(/);
  assert.match(html, /sinVoz: true, reintento: true/);
  assert.match(html, /texto: habla\[1\]/);
  assert.match(html, /function lineaYaDicha/);
  assert.match(html, /tvLineaOida = linea\.clave/);
  assert.doesNotMatch(html, /habla\[0\] \+ ' dice: '/);
  assert.match(html, /if \(id === 'noticias'\) return 'periodista'/);
  assert.match(html, /if \(id === 'partido'\) return 'comentarista'/);
  assert.match(html, /tvTextoOido === linea\.texto/);
  assert.match(html, /tvTextoPedido = linea\.texto/);
  assert.ok(html.includes('Noticias de la ciudad. Hay obras en el centro.'));
  assert.ok(html.includes('El clima. Llega un frente frío, con doce grados.'));
  assert.doesNotMatch(html, /el periodista dice|periodista dice/);
  const cercaFn = html.slice(html.indexOf('function teleCerca'), html.indexOf('function deptoPantallaCerca'));
  assert.match(cercaFn, /sitOn\.key === 'sofa'/);
  assert.match(cercaFn, /TV_OIR_RADIO/);
  const hablar = html.slice(html.indexOf('function hablarAhora'), html.indexOf('function actualizarVozTele'));
  assert.ok(hablar.indexOf('tvUtterance = u') < hablar.indexOf('syn.speak(u)'));
  assert.ok(hablar.indexOf('prepararVozTele()') < hablar.indexOf('syn.speak(u)'));
  assert.match(html, /voiceschanged/);
  assert.match(html, /function vozEsEspanol/);
  assert.match(html, /la tele necesita una voz en español/);
  assert.match(html, /let soundOn = true/);
  assert.doesNotMatch(hablar, /\.cancel\(/);
  assert.match(html.slice(html.indexOf('function cortarVozTele'), html.indexOf('function hablarAhora')), /\.cancel\(/);
  assert.match(html, /Pase de los /);
  assert.match(html, /arco izquierdo/);
  assert.match(html, /arco derecho/);
  assert.match(html, /function lineaDeLaTele\(/);
  assert.match(html, /if \(!soundOn/);
  for (const titulo of ['El secreto del pasaje', 'Vera vuelve', 'La casa de Lila', 'Cartas de Platus', 'El turno de noche', 'Hermanos del huerto']) {
    assert.ok(html.includes("titulo: '" + titulo + "'"), titulo);
  }
  for (const frase of ['Voy a esconder esto.', 'Volví al pasaje.', 'Pensé que no volvías.', 'Esta casa es mía.', 'Llegó una carta.', 'Yo cubro el turno.', 'El huerto es mío.', 'Hay una llave.', 'Te guardé pan.', 'Pongo los dos nombres.', 'La llevo al buzón.', 'Echo la tranca.', 'Salió una hoja nueva.']) {
    assert.ok(html.includes("'" + frase + "'"), frase);
  }
  assert.match(html, /const intro = 8, ciclo = 4 \* n/);
  assert.match(html, /Math\.min\(n - 1, Math\.floor\(u \* n\)\)/);
  assert.doesNotMatch(html, /const NOVELA_ESCENA_SEG = 16/);
  assert.doesNotMatch(html, /if \(escena === 2\) return null/);
  assert.match(html, /return L\[escena\] \|\| L\[0\]/);
});
