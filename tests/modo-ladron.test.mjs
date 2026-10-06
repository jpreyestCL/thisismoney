// Modo ladrón: persecución de 3 min, ropa solo ahí, Tito y la celda de 10 min.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIDA_ZOMBIE, VIDA_POLICIA, PERSECUCION_SEG, CELDA_LADRON_SEG, DEUDA_TITO,
  arrestoLadron, asaltoTienda, comprarRopa, deudaTito, esCamuflaje, oficialMuere,
  pagarTito, puedeComprarRopa, precioArmaTito, tickDelatar, tickPersecucion, titoPuedeDarArma,
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

test('sin camuflaje un npc tarda en delatarte; con camuflaje casi no', () => {
  let acum = 0;
  let llamo = false;
  for (let i = 0; i < 11; i++) {
    const r = tickDelatar(acum, 1, true, false);
    acum = r.acum;
    if (r.llama) llamo = true;
  }
  assert.equal(llamo, false, 'un rato corto no alcanza');
  assert.equal(tickDelatar(acum, 1, true, false).llama, true);
  acum = 0;
  llamo = false;
  for (let i = 0; i < 40; i++) {
    const r = tickDelatar(acum, 1, true, true);
    acum = r.acum;
    if (r.llama) llamo = true;
  }
  assert.equal(llamo, false);
  const lejos = tickDelatar(10, 4, false, false);
  assert.equal(lejos.llama, false);
  assert.ok(lejos.acum < 10);
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
  assert.match(html, /modo-ladron\.js\?v=1/);
  assert.match(html, /const POLICE_CELL_SEC = 60/);
  assert.match(html, /arrestoLadron\(/);
  assert.match(html, /tickPersecucion\(/);
  assert.match(html, /puedeComprarRopa\(/);
  assert.match(html, /deudaTito\(/);
  assert.match(html, /SE BUSCA/);
  assert.match(sw, /modo-ladron\.js\?v=1/);
  assert.match(sw, /const VERSION = 'tim-v86'/);
});
