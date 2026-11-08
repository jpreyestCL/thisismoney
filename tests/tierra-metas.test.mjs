import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BANCO, FAMILIAS_NUEVAS, GASTOS, JUEGOS_PARQUE, LOTE_VACIO_PRECIO, METAS, META_BASE, META_INGRESO, REJA_GOLPES,
  ahorroDondeTopa, avanceDeMetas, bonoConfianza, bonoJuegos, fiestaLista, generarPedidos, ingresosDeLaNoche,
  interesNocturno, metaPorId, metasAlcanzadas, nivelConfianza, pagoPedido, precioLote, proximaMeta, propinasFiesta,
  rentaLote, rentaNocturna, textoPedido, topeInteres,
} from '../src/tierra-metas.js';
import { CONDOMINIO } from '../src/city-map.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Escalera de metas: ordenada, entre $50.000 y $1.000.000
assert.equal(META_BASE, 50000);
assert.equal(METAS.length, 7);
for (let i = 1; i < METAS.length; i++) assert.ok(METAS[i].at > METAS[i - 1].at, 'metas crecientes');
assert.ok(METAS[0].at > META_BASE && METAS.at(-1).at < 1000000);
for (const m of METAS) { assert.ok(m.precio > 0 && m.precio < m.at, m.id + ' se paga con lo ya ganado'); assert.match(m.nombre + m.desc, /[a-záéíóúñ]/i); }
assert.equal(metaPorId('mansion').at, 400000);
assert.equal(metasAlcanzadas(120000).length, 2);
assert.equal(proximaMeta(0).id, 'piscina');
assert.equal(proximaMeta(5e6), null);
assert.deepEqual(avanceDeMetas(5e6), { sig: null, falta: 0, pct: 100 });
assert.equal(avanceDeMetas(62500).pct, 50);

// Banco: el 5% con tope; la bóveda sube el tope
assert.equal(interesNocturno(10000, false).monto, 500);
assert.equal(interesNocturno(1e6, false).monto, BANCO.topeBase);
assert.equal(interesNocturno(1e6, false).topado, true);
assert.equal(interesNocturno(1e6, true).monto, BANCO.topeBoveda);
assert.equal(interesNocturno(0, true).monto, 0);
assert.ok(topeInteres(true) > topeInteres(false));
assert.equal(ahorroDondeTopa(false), 50000);

// Barrio: precios y rentas
const lotes = CONDOMINIO.lotes;
for (const l of lotes) { assert.ok(precioLote(l) >= LOTE_VACIO_PRECIO * 0 + 8000); assert.ok(rentaLote(l) >= 50); }
assert.equal(precioLote(lotes.find(l => l.venta)), LOTE_VACIO_PRECIO);
assert.equal(rentaNocturna([], 0), 0);
const uno = rentaNocturna([lotes[1]], 0), dos = rentaNocturna([lotes[1], lotes[2]], 0);
assert.ok(dos > uno + rentaLote(lotes[2]), 'cada lote extra sube el pago de todos');
assert.ok(rentaNocturna([lotes[1]], 15) > uno, 'la confianza paga más');
assert.equal(nivelConfianza(999), 5);
assert.equal(bonoConfianza(0), 1);
assert.ok(FAMILIAS_NUEVAS.length >= 6);

// Pedidos: siempre los tres tipos, determinísticos con azar fijo
const vecinos = [{ lote: 'a', nombre: 'Doña Rosa' }, { lote: 'b', nombre: 'Don Lucho' }, { lote: 'c', nombre: 'Marta' }];
const ped = generarPedidos(3, 1, vecinos, () => 0.3);
assert.equal(ped.length, 3);
assert.deepEqual(ped.map(p => p.tipo).sort(), ['caja', 'reja', 'tomates']);
assert.equal(new Set(ped.map(p => p.lote)).size, 3);
assert.deepEqual(generarPedidos(3, 1, [], () => 0.3), []);
assert.ok(generarPedidos(3, 20, vecinos, () => 0.3).every((p, i) => p.pago > ped.find(q => q.tipo === p.tipo).pago));
const tom = ped.find(p => p.tipo === 'tomates');
assert.ok(tom.n >= 4 && tom.n <= 6);
assert.match(textoPedido(tom), /tomates/);
assert.equal(ped.find(p => p.tipo === 'reja').n, REJA_GOLPES);
assert.ok(pagoPedido(tom, 15) > pagoPedido(tom, 0));

// Gastos: ingresos de la noche
assert.equal(ingresosDeLaNoche({ metas: {}, gastos: {}, lotes: [], reputacion: 0, fiestaPendiente: false }).total, 0);
const noche = ingresosDeLaNoche({ metas: { mansion: true, estatua: true }, gastos: { mall: true, estadio: true }, lotes: [lotes[1]], reputacion: 0, fiestaPendiente: true });
assert.equal(noche.total, uno + META_INGRESO.mansion + META_INGRESO.estatua + GASTOS.mall.renta + GASTOS.estadio.renta + propinasFiesta(1));
assert.ok(GASTOS.mall.precio >= 300000 && GASTOS.estadio.precio >= 300000);
assert.equal(fiestaLista(5, 5), false);
assert.equal(fiestaLista(5, 2), true);
assert.equal(fiestaLista(0, undefined), true);
assert.equal(bonoJuegos(100, { barco: true, tazas: true }), 100 * (60 + 35));
assert.equal(bonoJuegos(100, {}), 0);
assert.equal(JUEGOS_PARQUE.length, 3);

// Integración en index.html: bloque propio, import, ganchos y guardado
assert.match(html, /from '\.\/src\/tierra-metas\.js\?v=1'/);
assert.match(html, /\/\/  TIERRA GRANDE · metas/);
assert.match(html, /TYPING_BOXES\.push\('imperiobox'\)/);
assert.match(html, /tierra: imperioGuardar\(\)/);
assert.match(html, /imperioCargar\(d\.tierra\)/);
assert.ok((html.match(/imperioReset\(\)/g) || []).length >= 3, 'se reinicia con partida nueva y al borrar');
assert.match(html, /if \(tryImperio\(\)\) return;/);
assert.match(html, /else if \(imperioAccion\(\)\) action = imperioAccion\(\);/);
assert.match(html, /updateImperio\(dt\);/);
assert.match(html, /imperioCosecha\(pl\.crop, count\);/);
assert.match(html, /label: 'Mi imperio'/);
assert.match(html, /interesNocturno\(state\.bank, imperioMetaOk\('boveda'\)\)/);
assert.doesNotMatch(html, /Math\.round\(state\.bank \* 0\.05\)/, 'el banco ya no paga interés sin tope');
assert.match(html, /\$2\.500 por noche/);
// los edificios de la quinta se registran para esconderse en Platus
assert.match(html, /earthMeshes\.push\(m\)/);
assert.match(html, /earthObstacles\.push\(o\)/);
// no se tocan los módulos sólidos ni el pasto
assert.doesNotMatch(readFileSync(new URL('../src/tierra-metas.js', import.meta.url), 'utf8'), /document|THREE/);

console.log('tierra-metas: ok');
