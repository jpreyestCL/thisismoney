// Mall del Sur: no pisa calles ni otros edificios, y el carrito junta lo elegido.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  AVENIDAS, DISTRITOS, MALL, callesDelMapa, enCalle, rectCalle, rectDistrito, seCruzan, validarMapa,
} from '../src/city-map.js';
import {
  CINE_DURACION, CINE_ESCENAS, PALOMITAS_PRECIO, SUPER_FILAS, SUPER_PASO, casasConPrecio, cineContinuo, escenaCine, mallAgregar, mallPuedePagar, mallTotal, modoEscena, puestosSuper,
} from '../src/mall.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

const edificio = MALL.edificio;
const huella = {
  minX: edificio.x - edificio.w / 2 - 0.3,
  maxX: edificio.x + edificio.w / 2 + 0.3,
  minZ: edificio.z - edificio.d / 2 - 0.3,
  maxZ: edificio.z + edificio.d / 2 + 0.3,
};

test('el mall no cruza calles ni otros edificios', () => {
  assert.deepEqual(validarMapa(), []);
  const propio = rectDistrito(DISTRITOS.find(d => d.id === 'mall'));
  assert.ok(huella.minX >= propio.minX && huella.maxX <= propio.maxX, 'se sale del terreno en x');
  assert.ok(huella.minZ >= propio.minZ && huella.maxZ <= propio.maxZ, 'se sale del terreno en z');
  for (const calle of callesDelMapa()) {
    assert.ok(!seCruzan(rectCalle(calle), huella), `el edificio pisa ${calle.id}`);
  }
  for (const d of DISTRITOS) {
    if (d.id === 'mall') continue;
    assert.ok(!seCruzan(rectDistrito(d), huella), `el edificio pisa ${d.id}`);
  }
  assert.equal(enCalle(MALL.adentro.x, MALL.adentro.z), false, 'el interior quedó sobre la calle');
  assert.ok(AVENIDAS.some(av => av.ramal === 'mall'), 'falta el ramal de acceso');
  assert.ok(huella.maxZ < rectCalle(AVENIDAS.find(av => av.id === 'ramal_mall')).minZ, 'la fachada entra en el ramal');
});

test('el carrito junta lo elegido y no cobra si no alcanza', () => {
  const vacio = [];
  const conCasa = mallAgregar(vacio, { kind: 'casa', key: 'casa_clasica', name: 'Casa clásica', price: 530, piezas: { wallWood: 4, door: 1, roof: 1 } });
  const lleno = mallAgregar(conCasa, { kind: 'tienda', key: 'wallWood', name: 'Pared madera', price: 60 });
  assert.equal(vacio.length, 0, 'agregar no debe tocar el carrito anterior');
  assert.equal(lleno.length, 2);
  assert.equal(lleno[0].key, 'casa_clasica');
  assert.equal(lleno[1].key, 'wallWood');
  assert.equal(mallTotal(lleno), 590);
  const corto = mallPuedePagar(100, lleno, false);
  assert.equal(corto.ok, false);
  assert.equal(corto.razon, 'plata');
  assert.equal(corto.cobra, 0);
  assert.equal(mallPuedePagar(590, lleno, false).ok, true);
  assert.equal(mallPuedePagar(590, lleno, false).cobra, 590);
  assert.equal(mallPuedePagar(0, lleno, true).ok, true);
  assert.equal(mallPuedePagar(0, lleno, true).cobra, 0);
  assert.equal(mallPuedePagar(999, [], false).razon, 'vacio');
  const precios = { wallWood: 60, wallRock: 120, wallMetal: 500, wallDoor: 260, pilar: 120, door: 90, roof: 200, window: 50 };
  const casas = casasConPrecio(precios);
  assert.equal(casas.length, 10);
  assert.ok(casas.every(c => c.price > 0 && c.kind === 'casa'));
});

test('el capítulo del cine dura 10 minutos y la voz no dice «dice»', () => {
  assert.equal(CINE_DURACION, 600);
  assert.ok(CINE_ESCENAS.length >= 48, 'el capítulo tiene que ser mucho más largo que 24 escenas');
  assert.deepEqual(cineContinuo(), []);
  assert.equal(escenaCine(0).accion, 'llegar');
  assert.equal(escenaCine(0).quien, 'Lila');
  const seg = CINE_DURACION / CINE_ESCENAS.length;
  assert.equal(escenaCine(seg + 0.05).accion, CINE_ESCENAS[1].accion);
  assert.equal(escenaCine(599).i, CINE_ESCENAS.length - 1);
  assert.equal(escenaCine(600).i, 0);
  const quienes = new Set();
  const modos = new Set();
  let letras = 0;
  for (const esc of CINE_ESCENAS) {
    assert.ok(esc.voz === 'hombre' || esc.voz === 'mujer');
    assert.equal(/dice/i.test(esc.texto), false, esc.texto);
    assert.ok(esc.texto.length > 20);
    quienes.add(esc.quien);
    modos.add(modoEscena(esc.accion));
    letras += esc.texto.length;
  }
  assert.ok(quienes.has('Lila') && quienes.has('Mateo') && quienes.size >= 4);
  assert.ok(modos.size >= 8, 'las escenas tienen que verse distintas');
  assert.ok(CINE_ESCENAS.some(e => e.accion === 'alto'));
  assert.ok(CINE_ESCENAS.some(e => e.accion === 'final'));
  assert.ok(letras > 2500, 'el capítulo tiene que tener bastante texto');
  assert.equal(PALOMITAS_PRECIO, 80);
});

test('el súper pone en góndolas todo el catálogo, sin encimar', () => {
  const items = Array.from({ length: 90 }, (_, i) => ({ key: 'item' + i, name: 'Cosa ' + i, price: 10 + i, color: 0xff0000 }));
  const puestos = puestosSuper(items);
  assert.equal(puestos.length, 90);
  assert.equal(new Set(puestos.map(p => p.key)).size, 90);
  for (const p of puestos) {
    assert.ok(SUPER_FILAS.includes(p.x), 'fuera de las filas');
    assert.ok(p.z <= -192 && p.z >= -216.5, 'se sale del súper en z: ' + p.z);
  }
  for (let i = 0; i < puestos.length; i++) for (let j = i + 1; j < puestos.length; j++) {
    const d = Math.hypot(puestos[i].x - puestos[j].x, puestos[i].z - puestos[j].z);
    assert.ok(d >= SUPER_PASO - 0.02, 'dos productos se pisan');
  }
  const muestra = puestosSuper([
    { key: 'wallWood', name: 'Pared madera', price: 60 },
    { key: 'auto', name: 'Auto', price: 2000 },
    { key: 'rocket', name: 'Cohete', price: 15000 },
  ]);
  assert.deepEqual(muestra.map(p => p.key), ['wallWood', 'auto', 'rocket']);
});

test('el juego engancha el mall sin tocar la celda, el depto ni la tele', () => {
  assert.match(html, /function buildMall\(/);
  assert.match(html, /function sacarDelMall\(/);
  assert.match(html, /function pagarCarritoMall\(/);
  assert.match(html, /id="mallbox"/);
  assert.match(html, /PALOMITAS_PRECIO/);
  assert.match(html, /mallGuardia/);
  assert.match(html, /COMIDAS_MALL/);
  assert.match(html, /const POLICE_CELL_SEC = 60/);
  assert.match(html, /const TORRE_PRECIO = 10000/);
  assert.match(html, /const ESTRENO_NOVELA = 'La novela'/);
  assert.match(html, /city-map\.js\?v=9/);
  assert.match(html, /mall\.js\?v=2/);
  assert.match(html, /SALA 1/);
  assert.match(html, /puestosSuper\(SHOP\)/);
  assert.match(html, /tipo: 'sala'/);
  assert.match(html, /tipo: 'tienda'/);
  assert.match(sw, /const VERSION = 'tim-v80'/);
  assert.match(sw, /city-map\.js\?v=9/);
  assert.match(sw, /mall\.js\?v=2/);
});
