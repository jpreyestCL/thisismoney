// Modo ladrón: persecución de 3 min, ropa solo ahí, Tito y la celda de 10 min.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIDA_ZOMBIE, VIDA_POLICIA, PERSECUCION_SEG, CELDA_LADRON_SEG, DEUDA_TITO, LLAMADA_SEG, NOCHES_TITO,
  arrestoLadron, asaltoTienda, atrapaPolicia, cajasNuevas, clavePartida, compraTeMarca, comprarRopa, condenaCumplida, continuarMundoLadron, deudaTito, enLaCaja, esCamuflaje, famaInicial, impactoOficial,
  masBuscado, mostrarCartel, mundoLadronNuevo, normalizarCajas, objetivoLadron, oficialMuere, pagarTito, puedeComprarRopa, puedeVerTito, policiaReconoce, radioCaptura, trasDelito,
  CAJA_MALL_RADIO, CAJA_RADIO, CAPTURA_LADRON_AUTO, CAPTURA_LADRON_PIE, CAPTURA_NORMAL_AUTO, CAPTURA_NORMAL_PIE, CASILLEROS_BOVEDA, PLATA_CASILLERO, POLICIA_FACTOR, bovedaNueva, bovedaPuedeAbrir, normalizarBoveda, plataBoveda, vaciarCaja, velocidadPolicia,
  precioArmaTito, precioRegaloTito, saquearCasillero, tickLlamada, tickPersecucion,
  ALARMA_BANCO_SEG, empezarAlarmaBanco, tickAlarmaBanco,
  OYE_GOLPE, golpeSeEntera, persecucionSiCaen,
  cobrarTitoAuto,
  casilleroApuntado, puestosCasilleros,
  titoEntrega, titoPuedeDarArma, togglearBoveda,
} from '../src/modo-ladron.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

test('un policía que te ve te persigue 3 minutos aunque no hayas hecho nada', () => {
  assert.equal(PERSECUCION_SEG, 180);
  let p = tickPersecucion(null, 2, false);
  assert.equal(p.activa, false, 'si nadie te ve, no hay persecución');
  p = tickPersecucion(null, 0.4, true);
  assert.equal(p.arranco, true);
  assert.equal(p.left, 180);
  assert.equal(p.activo ?? p.activa, true);
  p = tickPersecucion(p, 30, false);
  assert.equal(p.left, 150, 'si te pierde de vista el tiempo sigue');
  assert.equal(p.activa, true);
  p = tickPersecucion({ left: 1, activa: true }, 1.2, false);
  assert.equal(p.termino, true);
  assert.equal(p.activa, false, 'a los 3 minutos se van si no te ven');
  p = tickPersecucion({ left: 0.3, activa: true }, 0.3, true);
  assert.equal(p.left, 180, 'si te vuelven a ver, otros 3 minutos');
  assert.equal(p.activa, true);
});

test('la ropa solo se compra en el modo ladrón y el camuflaje es un conjunto', () => {
  assert.equal(puedeComprarRopa({ modoLadron: false, money: 9000 }), false);
  assert.equal(puedeComprarRopa(null), false);
  const fuera = comprarRopa({ modoLadron: false, money: 9000 }, 'camuflaje');
  assert.equal(fuera.ok, false);
  assert.equal(fuera.razon, 'modo');
  const puesta = comprarRopa({ modoLadron: true, money: 5000 }, 'camuflaje');
  assert.equal(puesta.ok, true);
  assert.equal(puesta.puesta, 'camuflaje');
  assert.equal(puesta.camuflaje, true);
  assert.equal(puesta.money, 4100);
  assert.equal(esCamuflaje('camuflaje'), true);
  assert.equal(esCamuflaje('chaqueta'), false);
  assert.equal(comprarRopa({ modoLadron: true, money: 10 }, 'gorra').razon, 'plata');
});

test('Tito cobra 500 cada 3 días y sin pago no da más armas', () => {
  assert.equal(DEUDA_TITO, 500);
  assert.equal(NOCHES_TITO, 3);
  assert.equal(deudaTito(0, 0), 0);
  assert.equal(deudaTito(1, 0), 0);
  assert.equal(deudaTito(2, 0), 0, 'el segundo día todavía no se cobra');
  assert.equal(deudaTito(3, 0), 500);
  assert.equal(deudaTito(5, 0), 500);
  assert.equal(deudaTito(6, 0), 1000);
  assert.equal(titoPuedeDarArma(2, 0), true, 'con el pago al día sí da armas');
  assert.equal(titoPuedeDarArma(3, 0), false, 'si no pagas, no da más');
  assert.equal(precioArmaTito(1800, false, true), 1800, 'fuera del modo se pagan');
  assert.equal(precioArmaTito(1800, true, true), 0, 'en el modo el arma es gratis');
  assert.equal(precioArmaTito(600, true, false), 600, 'el flag viejo no marca las balas');
  assert.equal(precioRegaloTito(600, true, 'balas'), 0, 'en el modo las balas son gratis');
  assert.equal(precioRegaloTito(600, false, 'balas'), 600, 'fuera del modo las balas siguen con precio');
  assert.equal(precioRegaloTito(220, true, 'humo'), 0, 'en el modo la bomba de humo es gratis');
  assert.equal(precioRegaloTito(220, false, 'humo'), 220, 'fuera del modo el humo se paga');
  assert.equal(precioRegaloTito(240, true, 'confeti'), 240, 'el confeti no entra en el regalo');
  assert.equal(titoEntrega(2, 0, 'balas', true), true);
  assert.equal(titoEntrega(2, 0, 'humo', true), true);
  assert.equal(titoEntrega(3, 0, 'balas', true), false, 'si no pagas, no hay balas');
  assert.equal(titoEntrega(3, 0, 'humo', true), false, 'si no pagas, no hay bombas');
  assert.equal(titoEntrega(3, 0, 'arma', true), false);
  assert.equal(titoEntrega(3, 0, 'balas', false), true, 'fuera del modo la deuda no bloquea la compra');
  const corto = pagarTito(100, 3, 0);
  assert.equal(corto.ok, false);
  assert.equal(corto.deuda, 500);
  const pago = pagarTito(2000, 6, 0);
  assert.equal(pago.ok, true);
  assert.equal(pago.money, 1000);
  assert.equal(pago.pagadoHasta, 6);
  assert.equal(deudaTito(6, pago.pagadoHasta), 0);
  assert.equal(titoPuedeDarArma(6, pago.pagadoHasta), true);
  assert.equal(deudaTito(9, pago.pagadoHasta), 500);
});

test('en el modo la deuda de Tito se paga sola si hay $500', () => {
  const pobre = cobrarTitoAuto(499, 3, 0);
  assert.equal(pobre.ok, false);
  assert.equal(pobre.cobrado, 0);
  assert.equal(pobre.money, 499, 'si no alcanza no cobra ni deja la plata en negativo');
  assert.equal(pobre.pagadoHasta, 0);
  assert.equal(titoPuedeDarArma(3, pobre.pagadoHasta), false);
  assert.equal(titoEntrega(3, pobre.pagadoHasta, 'arma', true), false);
  assert.equal(titoEntrega(3, pobre.pagadoHasta, 'balas', true), false);
  assert.equal(titoEntrega(3, pobre.pagadoHasta, 'humo', true), false);
  const justo = cobrarTitoAuto(500, 3, 0);
  assert.equal(justo.ok, true);
  assert.equal(justo.cobrado, 500);
  assert.equal(justo.money, 0);
  assert.equal(justo.deuda, 0);
  assert.equal(titoPuedeDarArma(3, justo.pagadoHasta), true);
  assert.equal(titoEntrega(3, justo.pagadoHasta, 'arma', true), true);
  assert.equal(titoEntrega(3, justo.pagadoHasta, 'balas', true), true);
  assert.equal(titoEntrega(3, justo.pagadoHasta, 'humo', true), true);
  assert.equal(precioRegaloTito(1800, true, 'arma'), 0, 'al día, el arma sigue en $0');
  assert.equal(precioRegaloTito(600, true, 'balas'), 0);
  assert.equal(precioRegaloTito(220, true, 'humo'), 0);
  assert.equal(precioRegaloTito(1800, false, 'arma'), 1800, 'fuera del modo el precio no cambia');
  const parcial = cobrarTitoAuto(700, 6, 0);
  assert.equal(parcial.cobrado, 500, 'con dos períodos solo cobra el que alcanza');
  assert.equal(parcial.money, 200);
  assert.equal(parcial.deuda, 500);
  assert.equal(titoPuedeDarArma(6, parcial.pagadoHasta), false);
  const despues = cobrarTitoAuto(500, 6, parcial.pagadoHasta);
  assert.equal(despues.cobrado, 500);
  assert.equal(despues.money, 0);
  assert.equal(despues.deuda, 0);
  assert.equal(titoEntrega(6, despues.pagadoHasta, 'balas', true), true);
  const todo = cobrarTitoAuto(2000, 6, 0);
  assert.equal(todo.cobrado, 1000);
  assert.equal(todo.money, 1000);
  assert.equal(todo.deuda, 0);
  const temprano = cobrarTitoAuto(800, 2, 0);
  assert.equal(temprano.cobrado, 0);
  assert.equal(temprano.money, 800, 'antes de los 3 días no descuenta');
  assert.match(html, /function cobrarDeudaTito\(\) \{\n  if \(!state\.modoLadron\) return;/);
  assert.match(html, /if \(state\.modoLadron\) cobrarDeudaTito\(\)/);
  assert.match(html, /Le pagaste \$' \+ r\.cobrado \+ ' a Tito'/);
});

test('en el modo ladrón entras a ver a Tito sin los $20.000', () => {
  assert.equal(puedeVerTito(true, 0, false, 20000), true);
  assert.equal(puedeVerTito(false, 0, false, 20000), false);
  assert.equal(puedeVerTito(false, 19999, false, 20000), false);
  assert.equal(puedeVerTito(false, 20000, false, 20000), true, 'fuera del modo sigue el candado');
  assert.equal(puedeVerTito(false, 0, true, 20000), true);
  assert.match(html, /const ALLEY = \{ unlock: 20000/);
  assert.match(html, /puedeVerTito\(!!state\.modoLadron/);
  assert.match(html, /En el modo ladrón entras a verlo gratis/);
  assert.match(html, /cada ' \+ NOCHES_TITO \+ ' días/);
  assert.match(html, /state\.night % NOCHES_TITO === 0/);
});

test('la cárcel de 10 minutos te quita todo el dinero y sigues en el modo', () => {
  const a = arrestoLadron(4321);
  assert.equal(CELDA_LADRON_SEG, 600);
  assert.equal(a.segundos, 600);
  assert.equal(a.money, 0);
  assert.equal(a.quitado, 4321);
  assert.equal(a.sigueModo, true);
  assert.equal(arrestoLadron(0).quitado, 0);
});

test('policías y guardias aguantan varias veces lo de un zombie', () => {
  assert.ok(VIDA_POLICIA >= VIDA_ZOMBIE * 5);
  const golpe = oficialMuere(VIDA_POLICIA, VIDA_ZOMBIE);
  assert.equal(golpe.muerto, false);
  assert.equal(golpe.hp, VIDA_POLICIA - VIDA_ZOMBIE);
  assert.equal(oficialMuere(12, 20).muerto, true);
});

test('al empezar casi no te reconocen y el cartel no sale', () => {
  assert.equal(famaInicial(), 0);
  assert.equal(masBuscado(0), false);
  assert.equal(mostrarCartel(0), false);
  assert.equal(policiaReconoce(0, false), false);
  assert.equal(policiaReconoce(0, true), false);
  let acum = 0;
  let llamo = false;
  for (let i = 0; i < 30; i++) {
    const r = tickLlamada(acum, 1, true, famaInicial(), false);
    acum = r.acum;
    if (r.llama) llamo = true;
  }
  assert.equal(llamo, false, 'media minuto mirándote al empezar no alcanza para la llamada');
  assert.equal(tickPersecucion(null, 30, false).activa, false);
});

test('un npc tarda 8 segundos en llamar y recién ahí te persiguen', () => {
  assert.equal(LLAMADA_SEG, 8);
  const fama = compraTeMarca(0, true);
  assert.equal(masBuscado(fama), true);
  let acum = 0;
  for (let i = 0; i < 7; i++) {
    const r = tickLlamada(acum, 1, true, fama, false);
    acum = r.acum;
    assert.equal(r.llama, false, 'antes de los 8 segundos la policía todavía no sale');
  }
  assert.equal(tickPersecucion(null, 7, false).activa, false);
  const fin = tickLlamada(acum, 1, true, fama, false);
  assert.equal(fin.llama, true);
  const chase = tickPersecucion(null, 0, fin.llama);
  assert.equal(chase.activa, true);
  assert.equal(chase.left, 180);
  const lejos = tickLlamada(6, 4, false, fama, false);
  assert.equal(lejos.llama, false);
  assert.ok(lejos.acum < 6);
});

test('comprar un arma y ropa te deja más buscado; el camuflaje casi no', () => {
  assert.equal(compraTeMarca(0, false), 0, 'fuera del modo comprar no te marca');
  const arma = compraTeMarca(famaInicial(), true);
  const ropa = compraTeMarca(arma, true);
  assert.equal(arma, 1);
  assert.equal(ropa, 2);
  assert.equal(mostrarCartel(ropa), true);
  assert.equal(policiaReconoce(ropa, false), true);
  assert.equal(policiaReconoce(ropa, true), false);
  let acum = 0;
  let llamo = false;
  for (let i = 0; i < 40; i++) {
    const r = tickLlamada(acum, 1, true, ropa, true);
    acum = r.acum;
    if (r.llama) llamo = true;
  }
  assert.equal(llamo, false, 'con el camuflaje puesto casi no te reconocen');
  acum = 0;
  llamo = false;
  for (let i = 0; i < 8; i++) {
    const r = tickLlamada(acum, 1, true, ropa, false);
    acum = r.acum;
    if (r.llama) llamo = true;
  }
  assert.equal(llamo, true, 'sin el camuflaje y ya más buscado, el npc delata');
});

test('en la celda no queda el aviso de persecución', () => {
  const encerrado = objetivoLadron({
    celda: true, persigue: true, tiempo: '2:40', llamando: true, falta: '0:05', masBuscado: true,
  });
  assert.equal(encerrado, '');
  const suelto = objetivoLadron({ celda: false, persigue: true, tiempo: '2:40', masBuscado: true });
  assert.match(suelto, /TE VIERON/);
  assert.match(suelto, /la policía te persigue/);
  assert.match(suelto, /2:40/);
  const salio = objetivoLadron({ celda: false, persigue: false, masBuscado: true });
  assert.doesNotMatch(salio, /TE VIERON/);
  assert.match(html, /objetivoLadron\(/);
  assert.match(html, /state\.cellArrest = \{ left: segundos, ladron: !!state\.modoLadron \};\n  state\.ladronChase = null;\n  state\.ladronLlamada = 0;/);
  assert.match(html, /if \(!state\.cellArrest && state\.wanted > 0 && !state\.modoLadron\)/);
});

test('el asalto deja plata y algo de la tienda', () => {
  const seq = [0.1, 0.9];
  let i = 0;
  const botin = asaltoTienda(() => seq[i++ % seq.length]);
  assert.ok(botin.plata >= 150 && botin.plata <= 400);
  assert.ok(botin.cosa && botin.cosa.key && botin.cosa.n > 0);
});

test('el juego engancha el modo sin cambiar la celda de 1 minuto', () => {
  assert.match(html, /id="modoLadronBtn"/);
  assert.match(html, /MODO LADRÓN/);
  assert.match(html, /id="pauseLadron"/);
  assert.match(html, /modo-ladron\.js\?v=13/);
  assert.match(html, /tickLlamada\(/);
  assert.match(html, /compraTeMarca\(/);
  assert.match(html, /mostrarCartel\(/);
  assert.match(html, /llamando a la policía/);
  assert.match(html, /const POLICE_CELL_SEC = 60/);
  assert.match(html, /arrestoLadron\(/);
  assert.match(html, /tickPersecucion\(/);
  assert.match(html, /puedeComprarRopa\(/);
  assert.match(html, /deudaTito\(/);
  assert.match(html, /SE BUSCA/);
  assert.match(sw, /modo-ladron\.js\?v=13/);
  assert.match(sw, /const VERSION = 'tim-v101'/);
  assert.match(html, /function tryBoveda\(\) \{\n  if \(!state\.modoLadron\) return false;/);
  assert.match(html, /precioRegaloTito\(item\.price, !!state\.modoLadron, tipo\)/);
  assert.match(html, /resetBovedaPartida\(\)/);
  assert.match(html, /bovedaAbierta: !!state\.bovedaAbierta/);
});

test('la bóveda nace cerrada y llena, y un casillero vaciado no se rellena', () => {
  assert.equal(CASILLEROS_BOVEDA, 25);
  assert.equal(PLATA_CASILLERO, 1500);
  const nueva = bovedaNueva();
  assert.equal(nueva.abierta, false);
  assert.equal(nueva.vacios.length, 0);
  assert.equal(plataBoveda(nueva), 25 * 1500);
  assert.equal(saquearCasillero(nueva, 0).razon, 'cerrada');
  const abierta = togglearBoveda(nueva);
  assert.equal(abierta.abierta, true);
  assert.equal(abierta.vacios.length, 0);
  const uno = saquearCasillero(abierta, 3);
  assert.equal(uno.ok, true);
  assert.equal(uno.plata, 1500);
  assert.deepEqual(uno.boveda.vacios, [3]);
  const otra = saquearCasillero(uno.boveda, 3);
  assert.equal(otra.ok, false);
  assert.equal(otra.razon, 'vacio');
  assert.equal(plataBoveda(uno.boveda), 24 * 1500);
  let b = uno.boveda;
  for (let i = 0; i < 25; i++) {
    if (i === 3) continue;
    b = saquearCasillero(b, i).boveda;
  }
  assert.equal(plataBoveda(b), 0);
  assert.equal(b.vacios.length, 25);
  const seguida = normalizarBoveda(b);
  assert.equal(seguida.vacios.length, 25, 'continuar conserva los casilleros vacíos');
  const deCero = bovedaNueva();
  assert.equal(deCero.abierta, false);
  assert.equal(deCero.vacios.length, 0);
  const sucia = normalizarBoveda({ abierta: true, vacios: [0, 0, 99, -1, 24, '2'] });
  assert.equal(sucia.abierta, true);
  assert.deepEqual(sucia.vacios, [0, 24, 2]);
});

test('los 25 casilleros se apuntan y se saquean desde adentro', () => {
  const x0 = 121.15, z0 = -18.9, x1 = 125.2, z1 = z0 + 4.05;
  const puestos = puestosCasilleros(x0, z0, x1, z1);
  assert.equal(puestos.length, 25);
  const muro = 0.14;
  for (const p of puestos) {
    assert.ok(p.z - p.hz >= z0 + muro + 0.08, 'el casillero ' + p.i + ' se mete en el muro sur');
    assert.ok(p.z + p.hz <= z1 - muro - 0.08, 'el casillero ' + p.i + ' se mete en el muro norte');
    assert.ok(p.x - p.hx >= x0 + 0.2, 'el casillero ' + p.i + ' se mete en el fondo');
    assert.ok(p.y - p.hy >= 0.2, 'el casillero ' + p.i + ' se mete en el suelo');
  }
  const ojo = { x: 123.2, y: 1.7, z: -16.875 };
  let b = { abierta: true, vacios: [] };
  for (const p of puestos) {
    const hit = casilleroApuntado(puestos, ojo.x, ojo.y, ojo.z, p.x - ojo.x, p.y - ojo.y, p.z - ojo.z, 5);
    assert.equal(hit && hit.i, p.i, 'desde adentro la mira no da en el casillero ' + p.i);
    const r = saquearCasillero(b, p.i);
    assert.equal(r.ok, true);
    assert.equal(r.plata, 1500);
    b = r.boveda;
  }
  assert.equal(b.vacios.length, 25);
  assert.equal(plataBoveda(b), 0);
  const v = puestos[12];
  const otraVez = casilleroApuntado(puestos, ojo.x, ojo.y, ojo.z, v.x - ojo.x, v.y - ojo.y, v.z - ojo.z, 5);
  assert.equal(otraVez && otraVez.i, 12, 'el vacío del medio no le cede la mira al de al lado');
  assert.equal(saquearCasillero(b, 12).razon, 'vacio');
  const puerta = { x: 124.7, y: 1.7, z: -16.875 };
  for (const id of [0, 2, 4, 20, 22, 24]) {
    const p = puestos[id];
    const hit = casilleroApuntado(puestos, puerta.x, puerta.y, puerta.z, p.x - puerta.x, p.y - puerta.y, p.z - puerta.z, 5);
    assert.equal(hit && hit.i, id, 'junto a la puerta la mira no da en el casillero ' + id);
  }
  const tb = html.indexOf('function tryBoveda()');
  const saqueo = html.indexOf('saquearCasillero(estadoBoveda()', tb);
  const cierre = html.indexOf('togglearBoveda(estadoBoveda()', tb);
  assert.ok(saqueo > tb && saqueo < cierre, 'E vacía el casillero de la mira antes de cerrar la bóveda');
  assert.match(html, /puestosCasilleros\(x0, z0, x1, z1\)/);
  assert.match(html, /Sacar \$' \+ PLATA_CASILLERO \+ ' de este casillero'/);
});

test('dos partidas ladrón nuevas no heredan el lugar de la otra', () => {
  const jugado = {
    px: 88, pz: -44, money: 7777, ladronFama: 3, fama: 9,
    ropaPuesta: 'chaqueta', ropaLadron: { chaqueta: true },
    guns: { bm_pistola: true },
    placed: [{ key: 'wallWood', x: 6, z: 5 }],
    modoLadron: true,
  };
  const uno = mundoLadronNuevo(jugado, 2000);
  const dos = mundoLadronNuevo({ px: uno.px + 30, pz: -80, money: 99999, ladronFama: 4, ropaPuesta: 'gorra', guns: { bm_rifle: true }, placed: [{ key: 'door' }] }, 2000);
  assert.equal(uno.px, 10);
  assert.equal(uno.pz, 16);
  assert.equal(uno.money, 2000);
  assert.equal(uno.fama, 0);
  assert.equal(uno.ropaPuesta, null);
  assert.deepEqual(uno.ropa, {});
  assert.deepEqual(uno.guns, {});
  assert.deepEqual(uno.placed, []);
  assert.equal(uno.modoLadron, true);
  assert.notEqual(uno.px, jugado.px);
  assert.notEqual(uno.pz, jugado.pz);
  assert.equal(dos.px, 10);
  assert.equal(dos.pz, 16);
  assert.equal(dos.fama, 0);
  assert.deepEqual(dos.guns, {});
  assert.deepEqual(dos.placed, []);
  assert.notEqual(dos.px, 40);
  const sigue = continuarMundoLadron(jugado);
  assert.equal(sigue.px, 88);
  assert.equal(sigue.pz, -44);
  assert.equal(sigue.fama, 3);
  assert.equal(sigue.ropaPuesta, 'chaqueta');
  assert.equal(sigue.guns.bm_pistola, true);
  assert.equal(sigue.placed.length, 1);
  assert.equal(sigue.modoLadron, true);
  const otra = continuarMundoLadron({ px: 40, pz: -12, ladronFama: 1, modoLadron: true, guns: {}, placed: [] });
  assert.equal(otra.px, 40);
  assert.equal(otra.pz, -12);
  assert.notEqual(otra.px, sigue.px);
  assert.equal(clavePartida('AnaLadron'), 'tim_save_AnaLadron');
  assert.equal(clavePartida('LuisLadron'), 'tim_save_LuisLadron');
  assert.notEqual(clavePartida('AnaLadron'), clavePartida('LuisLadron'));
  assert.equal(clavePartida(''), 'tim_save');
  assert.equal(clavePartida(null), 'tim_save');
  assert.match(html, /function profileKey\(name\) \{ return clavePartida\(name\); \}/);
  assert.match(html, /function saveKey\(\) \{ return clavePartida\(currentProfile\); \}/);
  assert.match(html, /const fresco = mundoLadronNuevo\(null, state\.money\)/);
  assert.match(html, /state\.cellArrest = null;/);
  assert.match(html, /const lugar = state\.modoLadron \? continuarMundoLadron\(d\) : null;/);
  assert.match(html, /const POLICE_CELL_SEC = 60/);
});

test('la plata del asalto sale de la caja, una vez, y la otra caja sigue llena', () => {
  const seq = [0.2, 0.1, 0.6, 0.3];
  let i = 0;
  const rng = () => seq[i++ % seq.length];
  assert.deepEqual(cajasNuevas(), { super: false, mall: false });
  assert.deepEqual(normalizarCajas(null), { super: false, mall: false });
  assert.deepEqual(normalizarCajas({ super: 1, mall: 0, otra: true }), { super: true, mall: false });
  const super1 = vaciarCaja(cajasNuevas(), 'super', rng);
  assert.equal(super1.ok, true);
  assert.ok(super1.plata >= 150 && super1.plata <= 400);
  assert.ok(super1.cosa && super1.cosa.n > 0);
  assert.equal(super1.cajas.super, true);
  assert.equal(super1.cajas.mall, false);
  const otraVez = vaciarCaja(super1.cajas, 'super', rng);
  assert.equal(otraVez.ok, false);
  assert.equal(otraVez.razon, 'vacia');
  assert.equal(otraVez.plata, 0);
  const mall = vaciarCaja(super1.cajas, 'mall', rng);
  assert.equal(mall.ok, true);
  assert.equal(mall.cajas.mall, true);
  assert.equal(mall.cajas.super, true);
  assert.equal(vaciarCaja(mall.cajas, 'mall', rng).razon, 'vacia');
  assert.equal(vaciarCaja(cajasNuevas(), 'bodega', rng).razon, 'no');
  assert.equal(enLaCaja(36, -26.4, 36, -26.4, CAJA_RADIO), true);
  assert.equal(enLaCaja(28, -35, 36, -26.4, CAJA_RADIO), false, 'el pasillo del súper no es la caja');
  assert.equal(enLaCaja(16.2, -208.2, 16.2, -210, CAJA_MALL_RADIO), true);
  assert.equal(enLaCaja(40, -200, 16.2, -210, CAJA_MALL_RADIO), false);
  assert.match(html, /vaciarCaja\(state\.cajasVacias, zona\)/);
  assert.match(html, /cajasVacias: normalizarCajas\(state\.cajasVacias\)/);
  assert.match(html, /state\.cajasVacias = cajasNuevas\(\)/);
  assert.match(html, /Robar la caja /);
  assert.match(html, /cajasPago\.super = \{ x: cx \+ hw - 3, z: cz \+ hd - 2\.4 \}/);
  assert.match(html, /cajasPago\.mall = \{ x: 16\.2, z: -210 \}/);
});

test('en el modo la policía va un 15% más lenta y solo atrapa si ya persigue y está encima', () => {
  assert.equal(POLICIA_FACTOR, 0.85);
  assert.equal(velocidadPolicia(7.4, true), 7.4 * 0.85);
  assert.equal(velocidadPolicia(18, true), 18 * 0.85);
  assert.equal(velocidadPolicia(6.2, true), 6.2 * 0.85);
  assert.equal(velocidadPolicia(22, false), 22, 'fuera del modo la velocidad no cambia');
  assert.equal(velocidadPolicia(7, false), 7);
  assert.equal(CAPTURA_NORMAL_PIE, 1.9);
  assert.equal(CAPTURA_NORMAL_AUTO, 3.4);
  assert.equal(CAPTURA_LADRON_PIE, 0.75);
  assert.equal(CAPTURA_LADRON_AUTO, 1.5);
  assert.ok(CAPTURA_LADRON_PIE < CAPTURA_NORMAL_PIE - 0.8);
  assert.ok(CAPTURA_LADRON_AUTO < CAPTURA_NORMAL_AUTO - 1.5);
  assert.equal(radioCaptura(false, false), 1.9);
  assert.equal(radioCaptura(false, true), 3.4);
  assert.equal(radioCaptura(true, false), 0.75);
  assert.equal(radioCaptura(true, true), 1.5);
  assert.equal(atrapaPolicia(false, 0.1, true, false), false, 'si no te persigue, estar al lado no esposan');
  assert.equal(atrapaPolicia(false, 0, true, true), false);
  assert.equal(atrapaPolicia(true, 1.5, true, false), false, 'el radio viejo de 1,9 ya no alcanza');
  assert.equal(atrapaPolicia(true, 0.75, true, false), true);
  assert.equal(atrapaPolicia(true, 0.76, true, false), false);
  assert.equal(atrapaPolicia(true, 2, true, true), false, 'al volante, 2 m sigue siendo menos que 3,4 y no basta');
  assert.equal(atrapaPolicia(true, 1.5, true, true), true);
  assert.equal(atrapaPolicia(false, 1.9, false, false), true, 'fuera del modo, pasar cerca sí atrapa');
  assert.equal(atrapaPolicia(false, 1.91, false, false), false);
  assert.equal(atrapaPolicia(false, 3.4, false, true), true);
  assert.equal(atrapaPolicia(false, 3.41, false, true), false);
  const normal = html.slice(html.indexOf('function updatePolice(dt)'), html.indexOf('function policeCatch()'));
  assert.match(normal, /const catchD = driving \? 3\.4 : 1\.9/);
  assert.match(normal, /const speed = \(driving \? 22 : 7\)/);
  assert.doesNotMatch(normal, /atrapaPolicia|velocidadPolicia/);
  const ladron = html.slice(html.indexOf('function updatePoliciaLadron(dt)'), html.indexOf('function cajaDePagoCerca()'));
  assert.match(ladron, /const yaPersigue = !!\(state\.ladronChase && state\.ladronChase\.activa\)/);
  assert.match(ladron, /const puedeAtrapar = yaPersigue && !state\.ladronLimpio && !\(state\.sueltaPolicia > 0\)/);
  assert.match(ladron, /atrapaPolicia\(puedeAtrapar, d, true, !!state\.driving\)/);
  assert.match(ladron, /atrapaPolicia\(puedeAtrapar, d, true, false\)/);
  assert.match(ladron, /velocidadPolicia\(state\.driving \? 18 : 7\.4, true\)/);
  assert.match(ladron, /moveToward\(p, meta, 2\.1 \* dt\)/);
  assert.doesNotMatch(ladron, /velocidadPolicia\(2\.1/);
});

test('al cumplir la condena se apaga la persecución y caminar no la enciende', () => {
  const libre = condenaCumplida();
  assert.equal(libre.chase, null);
  assert.equal(libre.llamada, 0);
  assert.equal(libre.wanted, 0);
  assert.equal(libre.wantedLevel, 0);
  assert.equal(libre.limpio, true);
  assert.equal(trasDelito(true, 'caminar'), true);
  assert.equal(trasDelito(true, 'caja'), false);
  assert.equal(trasDelito(true, 'boveda'), false);
  assert.equal(trasDelito(true, 'tienda'), false);
  assert.equal(trasDelito(true, 'golpe'), false);
  assert.equal(trasDelito(false, 'caminar'), false);
  const aviso = objetivoLadron({ celda: false, limpio: true, persigue: true, tiempo: '2:40', masBuscado: true });
  assert.equal(aviso, '');
  assert.doesNotMatch(aviso, /TE VIERON/);
  assert.match(html, /state\.ladronLimpio = eraLadron \? libre\.limpio : false/);
  assert.match(html, /state\.sueltaPolicia = 1/);
  assert.match(html, /if \(state\.sueltaPolicia > 0\) continue/);
  assert.match(html, /const catchD = driving \? 3\.4 : 1\.9/);
  assert.match(html, /marcarDelitoLadron\('caja'\)/);
  assert.match(html, /avisarRoboBanco\(\)/);
  assert.match(html, /marcarDelitoLadron\('tienda'\)/);
  assert.match(html, /marcarDelitoLadron\('golpe'\)/);
  assert.match(html, /ladronLimpio: !!state\.ladronLimpio/);
});

test('las balas y los golpes le bajan vida al policía y a 0 muere', () => {
  const deLejos = impactoOficial({ x: 0, y: 1.2, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 8 }, 60, 1.15);
  assert.ok(deLejos);
  assert.equal(deLejos.cabeza, false);
  const cabeza = impactoOficial({ x: 0, y: 1.85, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 6 }, 60, 1.15);
  assert.ok(cabeza && cabeza.cabeza);
  const quemarropa = impactoOficial({ x: 0, y: 1.2, z: -0.3 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 0 }, 60, 1.15);
  assert.ok(quemarropa, 'a menos de 0,2 m la bala también pega');
  assert.equal(impactoOficial({ x: 0, y: 1.2, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 3, y: 0, z: 8 }, 60, 1.15), null);
  let hp = VIDA_POLICIA;
  const tiro = oficialMuere(hp, 9);
  assert.equal(tiro.muerto, false);
  assert.equal(tiro.hp, VIDA_POLICIA - 9);
  hp = tiro.hp;
  while (hp > 0) hp = oficialMuere(hp, 9).hp;
  assert.equal(oficialMuere(hp, 9).muerto, true);
  assert.equal(oficialMuere(VIDA_POLICIA, 26).hp, VIDA_POLICIA - 26);
  assert.match(html, /impactoOficial\(from, dir, pies, range, ancho\)/);
  assert.match(html, /pegarOficial\(oficialBala\.person, dmgBala\)/);
  assert.match(html, /pegarOficial\(oficial, dmg\)/);
  assert.match(html, /pegarOficial\(oficial, state\.weaponDmg\)/);
  assert.match(html, /pegarOficial\(person, dmg\)/);
  assert.match(html, /laserEquipped\(\) \? 30 : MELEE_REACH/);
});

test('matar a los policías apaga la persecución y pegar no avisa solo', () => {
  assert.equal(OYE_GOLPE, 5);
  assert.equal(golpeSeEntera(0), true);
  assert.equal(golpeSeEntera(5), true, 'a 5 bloques el policía sí se entera');
  assert.equal(golpeSeEntera(5.01), false);
  assert.equal(golpeSeEntera(16), false, 'verlo de lejos no es oír el golpe');
  assert.equal(golpeSeEntera(null), false);
  const sola = persecucionSiCaen(true, 0);
  assert.equal(sola.acabo, true);
  assert.equal(sola.activa, false);
  const queda = persecucionSiCaen(true, 2);
  assert.equal(queda.acabo, false);
  assert.equal(queda.activa, true);
  assert.equal(persecucionSiCaen(false, 0).acabo, false);
  assert.match(html, /function registrarGolpeLadron\(\)/);
  assert.match(html, /Los policías ya no te persiguen/);
  assert.match(html, /persecucionSiCaen\(perseguia, policiaPersiguiendoVivos\(\)\)/);
  assert.match(html, /if \(golpeSeEntera\(distanciaPoliciaViva\(\)\)\)/);
  assert.match(html, /if \(!npcVeElGolpe\(\)\) return/);
  assert.match(html, /!state\.golpeCalla && policiaReconoce\(fama, camu\)/);
  assert.match(html, /if \(state\.modoLadron\) return;/);
  assert.match(html, /state\.ladronLimpio = true;/);
  assert.equal(trasDelito(true, 'caja'), false, 'un delito nuevo puede volver a ensuciar');
  assert.equal(trasDelito(true, 'golpe'), false);
});

test('el robo del banco tarda 3 minutos en llegar a la policía', () => {
  assert.equal(ALARMA_BANCO_SEG, 180);
  const empieza = empezarAlarmaBanco(0);
  assert.equal(empieza.left, 180);
  assert.equal(empieza.arranco, true);
  const sigue = empezarAlarmaBanco(100);
  assert.equal(sigue.left, 100, 'saquear otro casillero no reinicia la espera');
  assert.equal(sigue.arranco, false);
  const medio = tickAlarmaBanco(180, 60);
  assert.equal(medio.sabe, false);
  assert.equal(medio.left, 120);
  const fin = tickAlarmaBanco(0.4, 0.5);
  assert.equal(fin.sabe, true);
  assert.equal(fin.left, 0);
  assert.equal(tickAlarmaBanco(0, 1).sabe, false);
  const callado = objetivoLadron({ celda: false, limpio: false, persigue: false, alarma: 179, callado: true, alarmaTxt: '2:59', masBuscado: true });
  assert.match(callado, /2:59/);
  assert.doesNotMatch(callado, /TE VIERON/);
  const ya = objetivoLadron({ celda: false, limpio: false, persigue: true, tiempo: '1:00', alarma: 100, callado: false, masBuscado: true });
  assert.match(ya, /TE VIERON/);
  assert.equal(trasDelito(true, 'caja'), false);
  assert.equal(trasDelito(true, 'tienda'), false);
  assert.equal(trasDelito(true, 'golpe'), false);
  assert.match(html, /function avisarRoboBanco\(\)/);
  assert.match(html, /La policía ya sabe que robaron el banco/);
  assert.match(html, /const callado = !!state\.bancoSilencio && \(state\.alarmaBanco \|\| 0\) > 0/);
  assert.match(html, /state\.bancoSilencio = false/);
  assert.doesNotMatch(html, /marcarDelitoLadron\('boveda'\)/);
});

test('la bóveda no se abre con la cajera viva y matarla es un golpe', () => {
  assert.equal(bovedaPuedeAbrir(false, true), false);
  assert.equal(bovedaPuedeAbrir(false, false), false);
  assert.equal(bovedaPuedeAbrir(true, true), false);
  assert.equal(bovedaPuedeAbrir(true, false), true);
  assert.equal(trasDelito(true, 'golpe'), false);
  assert.match(html, /bovedaPuedeAbrir\(true, cajeraViva\(\)\)/);
  assert.match(html, /if \(enPuertaBanco\(\) && !puertaBovedaCerca\(2\.15\)\) return false/);
  assert.match(html, /BANK\.frente \+ 2\.2/);
  assert.match(html, /BANK\.frente - 3\.2/);
  assert.match(html, /function oficialesYCajera\(\)/);
  assert.match(html, /for \(const person of oficialesYCajera\(\)\)/);
  assert.match(html, /if \(person\.userData\.cajera\)/);
  assert.match(html, /if \(!person\.userData\.cajera\) marcarDelitoLadron\('golpe'\)/);
  assert.match(html, /state\.cajeraMuerta = true/);
  assert.match(html, /cajeraMuerta: !!state\.cajeraMuerta/);
  assert.match(html, /if \(!state\.cajeraMuerta\) state\.bovedaAbierta = false/);
  const golpes = html.split('oficialesYCajera()').length - 1;
  assert.ok(golpes >= 3, 'puños, balas y flechas pasan por la misma lista que la policía');
});
