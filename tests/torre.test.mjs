// El Edificio Mirador: conserje en el hall, ascensor con botonera, escaleras y
// departamentos numerados de $10000 con living, cocina, baño y pieza.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
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
  assert.match(html, /o\.tipo === 'play'[\s\S]{0,220}abrirMenuPlay\(\)/);
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

test('el depto cobra agua y luz cada 5 días: poco, normal, mucho, y sin plata se corta', () => {
  const ini = html.indexOf('// --- renta-depto:inicio ---');
  const fin = html.indexOf('// --- renta-depto:fin ---');
  assert.ok(ini > 0 && fin > ini, 'falta el bloque de la renta');
  const avisos = [];
  const state = { depto: '201', creative: false, night: 0, money: 20000, servicios: null };
  const ctx = vm.createContext({ state, toast: (m) => avisos.push(String(m)), saveGame() {} });
  vm.runInContext(html.slice(ini, fin), ctx);
  const run = (code) => vm.runInContext(code, ctx);
  const spec = run('rentaDeptoSpec()');
  const aguaUso = 5 * spec.ducha + 10 * spec.lavado;
  const luzUso = spec.visitaS * spec.lucesPorS + spec.visitaS * spec.lamparaPorS + spec.teleS * spec.telePorS;
  assert.equal(aguaUso, spec.aguaNormal, 'la vida normal de agua es el uso de referencia');
  const cuenta = (uso, normal, base) => run(`precioServicio(${uso}, ${normal}, ${base})`);
  const aguaN = cuenta(aguaUso, spec.aguaNormal, spec.agua);
  const luzN = cuenta(luzUso, spec.luzNormal, spec.luz);
  assert.equal(aguaN.precio, 500);
  assert.equal(aguaN.banda, 'normal');
  assert.equal(luzN.precio, 450);
  assert.equal(luzN.banda, 'normal');
  const luzCon = luzUso + spec.horno + spec.congelador + spec.play;
  const luzExtra = cuenta(luzCon, spec.luzNormal, spec.luz);
  assert.equal(luzExtra.precio, 450, 'horno, congelador y Play de vez en cuando siguen en el precio dicho');
  assert.equal(luzExtra.banda, 'normal');
  const pocoA = cuenta(0, spec.aguaNormal, spec.agua);
  const pocoL = cuenta(0, spec.luzNormal, spec.luz);
  assert.equal(pocoA.precio, 250);
  assert.equal(pocoA.banda, 'poco');
  assert.equal(pocoL.precio, 225);
  assert.equal(pocoL.banda, 'poco');
  const muchoA = cuenta(spec.aguaNormal * 3, spec.aguaNormal, spec.agua);
  const muchoL = cuenta(spec.luzNormal * 3, spec.luzNormal, spec.luz);
  assert.equal(muchoA.precio, 1000);
  assert.equal(muchoA.banda, 'mucho');
  assert.equal(muchoL.precio, 900);
  assert.equal(muchoL.banda, 'mucho');
  assert.equal(run('precioServicio(rentaDeptoSpec().aguaNormal * 20, rentaDeptoSpec().aguaNormal, rentaDeptoSpec().agua)').precio, 1000, 'el tope es el doble');

  state.servicios = run('serviciosNuevos(0)');
  state.servicios.agua = aguaUso;
  state.servicios.luz = luzUso;
  state.night = 0;
  assert.equal(run('cobrarCuentasDepto()'), false, 'la noche 0 no cobra');
  assert.equal(state.money, 20000);
  state.night = 4;
  assert.equal(run('cobrarCuentasDepto()'), false, 'antes del día 5 no cobra');
  assert.equal(state.money, 20000);

  state.night = 5;
  avisos.length = 0;
  assert.equal(run('cobrarCuentasDepto()'), true);
  assert.equal(state.money, 20000 - 950);
  assert.equal(state.servicios.agua, 0);
  assert.equal(state.servicios.luz, 0);
  assert.equal(state.servicios.ultima, 5);
  assert.equal(state.servicios.deudaAgua, 0);
  assert.equal(state.servicios.deudaLuz, 0);
  assert.match(avisos[0], /Agua \$500 \(uso normal\)/);
  assert.match(avisos[0], /Luz \$450 \(uso normal\)/);
  state.servicios.agua = aguaUso;
  state.money = 20000;
  assert.equal(run('cobrarCuentasDepto()'), false, 'la misma noche no se cobra dos veces');
  assert.equal(state.money, 20000);

  state.creative = true;
  state.night = 10;
  state.servicios.ultima = 5;
  state.money = 100;
  assert.equal(run('cobrarCuentasDepto()'), false);
  assert.equal(state.money, 100, 'en creativo no se cobra');
  assert.equal(run('puedeUsarAgua()'), true);
  assert.equal(run('puedeUsarLuz()'), true);
  state.creative = false;
  state.depto = null;
  assert.equal(run('cobrarCuentasDepto()'), false, 'sin departamento no hay cuenta');
  state.depto = '201';

  state.night = 10;
  state.money = 0;
  state.servicios = run('serviciosNuevos(5)');
  state.servicios.agua = spec.aguaNormal;
  state.servicios.luz = spec.luzNormal;
  avisos.length = 0;
  assert.equal(run('cobrarCuentasDepto()'), true);
  assert.equal(state.money, 0, 'sin plata la cuenta no queda en cero');
  assert.equal(state.servicios.deudaAgua, 500);
  assert.equal(state.servicios.deudaLuz, 450);
  assert.match(avisos[0], /debes \$500/);
  assert.match(avisos[0], /debes \$450/);
  avisos.length = 0;
  assert.equal(run('puedeUsarAgua()'), false, 'el agua cortada no corre');
  assert.match(avisos.at(-1), /agua está cortada/);
  avisos.length = 0;
  assert.equal(run('puedeUsarLuz()'), false, 'la luz cortada no prende');
  assert.match(avisos.at(-1), /luz está cortada/);

  state.money = 500;
  assert.equal(run('puedeUsarAgua()'), true, 'al usar el depto se cobra la deuda del agua');
  assert.equal(state.money, 0);
  assert.equal(state.servicios.deudaAgua, 0);
  assert.equal(state.servicios.deudaLuz, 450);
  assert.equal(run('puedeUsarLuz()'), false);

  state.night = 11;
  state.money = 450;
  avisos.length = 0;
  assert.equal(run('cobrarCuentasDepto()'), true, 'al amanecer se cobra la deuda pendiente');
  assert.equal(state.money, 0);
  assert.equal(state.servicios.deudaLuz, 0);
  assert.match(avisos[0], /deuda del depto/);

  state.night = 15;
  state.money = 100;
  state.servicios = run('serviciosNuevos(10)');
  state.servicios.agua = spec.aguaNormal;
  state.servicios.luz = spec.luzNormal;
  run('cobrarCuentasDepto()');
  assert.equal(state.money, 0);
  assert.equal(state.servicios.deudaAgua, 400, 'el pago parcial no perdona el resto');
  assert.equal(state.servicios.deudaLuz, 450);

  state.money = 50000;
  state.night = 20;
  state.servicios = run('serviciosNuevos(15)');
  run('cobrarCuentasDepto()');
  assert.equal(state.money, 50000 - 250 - 225, 'poco uso sale a la mitad');
  state.night = 25;
  state.servicios.agua = spec.aguaNormal * 3;
  state.servicios.luz = spec.luzNormal * 3;
  state.money = 50000;
  avisos.length = 0;
  run('cobrarCuentasDepto()');
  assert.equal(state.money, 50000 - 1000 - 900, 'mucho uso llega al doble');
  assert.match(avisos[0], /mucho uso/);

  const guardado = run('serviciosParaSave()');
  const cargado = run(`serviciosDesdeSave(${JSON.stringify(guardado)}, 30)`);
  assert.equal(cargado.ultima, guardado.ultima);
  assert.equal(cargado.deudaAgua, 0);
  assert.equal(cargado.deudaLuz, 0);
  assert.match(html, /servicios: state\.depto \? serviciosParaSave\(\) : null/);
  assert.match(html, /state\.servicios = state\.depto \? serviciosDesdeSave\(d\.servicios, state\.night\) : null/);
  assert.match(html, /state\.servicios = serviciosNuevos\(state\.night\)/);
  assert.match(html, /cobrarCuentasDepto\(\);[^\n]*agua y luz del depto/);
  assert.match(html, /const TORRE_PRECIO = 10000/);
});
