// Modo ladrón: persecución de 3 min, ropa solo ahí, Tito y la celda de 10 min.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIDA_ZOMBIE, VIDA_POLICIA, PERSECUCION_SEG, CELDA_LADRON_SEG, DEUDA_TITO, LLAMADA_SEG,
  arrestoLadron, asaltoTienda, compraTeMarca, comprarRopa, deudaTito, esCamuflaje, famaInicial,
  masBuscado, mostrarCartel, oficialMuere, pagarTito, puedeComprarRopa, policiaReconoce,
  precioArmaTito, tickLlamada, tickPersecucion, titoPuedeDarArma,
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

test('Tito cobra 500 cada 2 días y sin pago no da más armas', () => {
  assert.equal(DEUDA_TITO, 500);
  assert.equal(deudaTito(0, 0), 0);
  assert.equal(deudaTito(1, 0), 0);
  assert.equal(deudaTito(2, 0), 500);
  assert.equal(deudaTito(3, 0), 500);
  assert.equal(deudaTito(4, 0), 1000);
  assert.equal(titoPuedeDarArma(1, 0), true);
  assert.equal(titoPuedeDarArma(2, 0), false);
  assert.equal(precioArmaTito(1800, false, true), 1800, 'fuera del modo se pagan');
  assert.equal(precioArmaTito(1800, true, true), 0, 'en el modo el arma es gratis');
  assert.equal(precioArmaTito(600, true, false), 600, 'las balas siguen con precio');
  const corto = pagarTito(100, 2, 0);
  assert.equal(corto.ok, false);
  assert.equal(corto.deuda, 500);
  const pago = pagarTito(2000, 4, 0);
  assert.equal(pago.ok, true);
  assert.equal(pago.money, 1000);
  assert.equal(pago.pagadoHasta, 4);
  assert.equal(deudaTito(4, pago.pagadoHasta), 0);
  assert.equal(titoPuedeDarArma(4, pago.pagadoHasta), true);
  assert.equal(deudaTito(6, pago.pagadoHasta), 500);
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
  assert.match(html, /modo-ladron\.js\?v=2/);
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
  assert.match(sw, /modo-ladron\.js\?v=2/);
  assert.match(sw, /const VERSION = 'tim-v87'/);
});
