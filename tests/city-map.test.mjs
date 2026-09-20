import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  AVENIDAS, CERROS, DISTRITOS, LUGARES, SEMAFOROS,
  callesDelMapa, distritoEn, enCalle, manzanasLibres, rectCalle, rectDistrito, seCruzan, validarMapa,
} from '../src/city-map.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('el mapa no tiene nada encima de nada', () => {
  assert.deepEqual(validarMapa(), []);
});

test('cada lugar del juego vive dentro de su distrito', () => {
  for (const [nombre, lugar] of Object.entries(LUGARES)) {
    const distrito = DISTRITOS.find(d => d.id === lugar.distrito);
    assert.ok(distrito, `${nombre} apunta a un distrito inexistente`);
    assert.equal(distritoEn(lugar.x, lugar.z)?.id, distrito.id, `${nombre} quedó en otro distrito`);
  }
});

test('las manzanas del centro caben entre las avenidas', () => {
  for (const d of DISTRITOS) {
    const r = rectDistrito(d);
    for (const av of AVENIDAS) {
      if (av.ramal === d.id) continue;
      assert.ok(!seCruzan(rectCalle(av), r), `${av.id} cruza ${d.id}`);
    }
  }
});

test('la cuadrícula de calles se cruza y forma manzanas', () => {
  const calles = callesDelMapa();
  const verticales = calles.filter(c => !c.horizontal && !c.ramal);
  const horizontales = calles.filter(c => c.horizontal && !c.ramal);
  assert.equal(verticales.length, 7);
  assert.equal(horizontales.length, 7);
  for (const c of calles) assert.ok(c.len > 0, `${c.id} mide ${c.len}`);
  assert.equal(SEMAFOROS.length, 9);
  for (const s of SEMAFOROS) assert.ok(enCalle(s.x, s.z), 'el semáforo tiene que estar en un cruce');
});

test('cada zona de las afueras tiene su calle de acceso', () => {
  for (const id of ['aeropuerto', 'acuatico', 'diversiones', 'desiertoEste', 'playa', 'dunasNorte']) {
    assert.ok(AVENIDAS.some(av => av.ramal === id), `falta el ramal a ${id}`);
  }
});

test('los cerros quedan fuera de la ciudad', () => {
  for (const cerro of CERROS) {
    assert.ok(Math.abs(cerro.x) > 150 || Math.abs(cerro.z) > 150, 'un cerro quedó dentro del anillo');
  }
});

test('la playa y las dunas quedan del lado del mar, y el resto en tierra firme', () => {
  const playa = DISTRITOS.find(d => d.id === 'playa');
  assert.ok(rectDistrito(playa).maxX < -150, 'la playa debe quedar en la costa oeste');
  for (const d of DISTRITOS) {
    if (d.id === 'playa') continue;
    const r = rectDistrito(d);
    const enElMar = r.minX < -150 && r.minZ > -365 && r.maxZ < 55;
    assert.ok(!enElMar, `${d.id} quedó dentro del océano`);
  }
});

test('las manzanas sin barrio quedan como áreas verdes accesibles', () => {
  const libres = manzanasLibres();
  assert.ok(libres.length > 0, 'la cuadrícula debería dejar manzanas verdes');
  for (const m of libres) {
    assert.equal(distritoEn(m.x, m.z), null, `la manzana (${m.x},${m.z}) ya tiene distrito`);
    assert.ok(!enCalle(m.x, m.z), `la manzana (${m.x},${m.z}) cayó sobre el asfalto`);
    assert.ok(m.w > 0 && m.d > 0, 'una manzana verde quedó sin terreno');
  }
});

test('la autopista del anillo está marcada y rodea la ciudad', () => {
  const anillo = callesDelMapa().filter(c => c.anillo);
  assert.equal(anillo.length, 4, 'el anillo son dos avenidas verticales y dos horizontales');
  assert.match(html, /r\.anillo \? 0 : /);   // en la autopista no se estaciona
});

test('index.html construye el mundo con el mapa compartido', () => {
  assert.match(html, /from '\.\/src\/city-map\.js/);
  assert.match(html, /const HOUSE = new THREE\.Vector3\(LUGARES\.casa\.x, 0, LUGARES\.casa\.z\)/);
  assert.match(html, /makeStore\(LUGARES\.super\.x, LUGARES\.super\.z/);
  assert.match(html, /makeStore\(LUGARES\.armeria\.x, LUGARES\.armeria\.z/);
  assert.match(html, /const roads = callesDelMapa\(\)/);
  assert.match(html, /function buildSkyline\(/);           // rascacielos del centro
  assert.match(html, /function tryTurn\(/);                 // los autos doblan en los cruces
  assert.match(html, /timDump\.auditCity = /);              // auditor de la ciudad (?debug=1)
  assert.match(html, /timDump\.auditTraffic = /);           // auditor del tráfico (?debug=1)
  assert.match(html, /timDump\.auditSkiRoad = /);           // auditor del camino al cerro nevado
  assert.doesNotMatch(html, /makeStadium\(70, 25/);         // los estadios ya no están sueltos
});

test('ya no quedan coordenadas viejas sueltas en index.html', () => {
  for (const viejo of [
    /const HOUSE = new THREE\.Vector3\(14, 0, 14\)/,
    /const SUPER_POS = new THREE\.Vector3\(40, 0, -18\)/,
    /const BANK_POS = new THREE\.Vector3\(58, 0, -24\)/,
    /const AIRPORT = new THREE\.Vector3\(120, 0, -150\)/,
    /function buildNeighborhood\(/,
  ]) assert.doesNotMatch(html, viejo);
});
