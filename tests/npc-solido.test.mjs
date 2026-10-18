import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearIndice, moverNpc } from '../src/npc-solido.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

function edificio() {
  const indice = crearIndice();
  const caja = { minX: -4, maxX: 4, minZ: 2, maxZ: 12 };
  indice.llenar([caja]);
  const radio = 0.42;
  return (x, z) => !!indice.tocar(x, z, radio);
}

test('un NPC no entra en un edificio y sigue moviéndose', () => {
  const ocupado = edificio();
  let x = 0, z = 0;
  const estado = { quieto: 0, lado: 1 };
  let seMovio = false;
  for (let i = 0; i < 200; i++) {
    const ax = x, az = z;
    const m = moverNpc(x, z, 0, 0.3, ocupado, estado, 0.05);
    x = m.x; z = m.z;
    if (Math.hypot(x - ax, z - az) > 0.001) seMovio = true;
    assert.equal(ocupado(x, z), false, `entró en (${x.toFixed(2)}, ${z.toFixed(2)})`);
  }
  assert.equal(seMovio, true);
  assert.ok(Math.abs(x) > 0.4, 'no se quedó pegado al centro del muro');
});

test('contra un muro largo se desliza de lado', () => {
  const ocupado = (px, pz) => pz > 1.6 && pz < 8 && Math.abs(px) < 30;
  let x = 0, z = 0;
  const estado = { quieto: 0, lado: 1 };
  let quietos = 0;
  for (let i = 0; i < 50; i++) {
    const m = moverNpc(x, z, 0, 0.25, ocupado, estado, 0.05);
    if (Math.hypot(m.x - x, m.z - z) < 1e-4) quietos++;
    x = m.x; z = m.z;
    assert.ok(z <= 1.6, 'atravesó el muro');
  }
  assert.ok(Math.abs(x) > 0.5, 'no se deslizó');
  assert.ok(quietos < 4, 'se congeló contra el muro');
});

test('un muro fino no se atraviesa de un paso largo', () => {
  const ocupado = (px) => px > -0.15 && px < 0.15;
  const estado = { quieto: 0, lado: 1 };
  const m = moverNpc(-0.8, 0, 2, 0, ocupado, estado, 0.05);
  assert.ok(m.x < -0.15, `atravesó: x=${m.x}`);
  assert.ok(m.x > -0.8 - 0.01, 'retrocedió de más');
});

test('un callejón sin salida lo hace retroceder, no entrar', () => {
  const ocupado = (px, pz) => pz > 0.15 || Math.abs(px) > 0.12;
  const estado = { quieto: 0, lado: 1 };
  const m = moverNpc(0, 0, 0, 0.3, ocupado, estado, 0.05);
  assert.ok(m.z < -0.2, `no retrocedió: z=${m.z}`);
  assert.ok(m.z <= 0.15);
  assert.ok(Math.abs(m.x) <= 0.12);
});

test('si queda metido en un edificio, sale de a pasitos', () => {
  const ocupado = (x, z) => Math.abs(x) < 5 && Math.abs(z) < 5;
  let x = 0.2, z = -0.4;
  const estado = { quieto: 0, lado: 1 };
  for (let i = 0; i < 40; i++) {
    const m = moverNpc(x, z, 0, 0.2, ocupado, estado, 0.05);
    assert.ok(Math.hypot(m.x - x, m.z - z) <= 0.31, 'se teletransportó');
    x = m.x; z = m.z;
  }
  assert.equal(ocupado(x, z), false);
});

test('si lleva un rato sin avanzar, cambia de lado solo', () => {
  const estado = { quieto: 0, lado: 1 };
  let cambio = false;
  let x = 1, z = 2;
  for (let i = 0; i < 20; i++) {
    const m = moverNpc(x, z, 0.2, 0, () => true, estado, 0.05);
    x = m.x; z = m.z;
    if (m.cambio) cambio = true;
  }
  assert.equal(x, 1);
  assert.equal(z, 2);
  assert.equal(cambio, true);
  assert.equal(estado.lado, -1);
});

test('el índice encuentra cajas en coordenadas negativas sin recorrer de más', () => {
  const indice = crearIndice();
  const lejos = [];
  for (let i = 0; i < 600; i++) lejos.push({ minX: 100 + (i % 25) * 3, maxX: 101 + (i % 25) * 3, minZ: 100 + ((i / 25) | 0) * 3, maxZ: 101 + ((i / 25) | 0) * 3 });
  const caja = { minX: -20, maxX: -10, minZ: -20, maxZ: -10 };
  indice.llenar(lejos.concat([caja]));
  assert.equal(indice.tocar(-15, -15, 0.4), caja);
  assert.equal(indice.tocar(-9, -15, 0.4), null);
  assert.equal(indice.tocar(0, 0, 0.4), null);
});

test('consultar el índice y mover gente no se arrastra', () => {
  const indice = crearIndice();
  const cajas = [];
  for (let i = 0; i < 600; i++) {
    const x = (i % 30) * 6 - 90, z = ((i / 30) | 0) * 6 - 60;
    cajas.push({ minX: x, maxX: x + 2.2, minZ: z, maxZ: z + 2.2 });
  }
  const t0 = performance.now();
  indice.llenar(cajas);
  for (let n = 0; n < 4000; n++) indice.tocar((n % 50) - 25, ((n / 50) | 0) - 20, 0.42);
  const t1 = performance.now();
  assert.ok(t1 - t0 < 80, `índice lento: ${(t1 - t0).toFixed(1)} ms`);

  const ocupado = (x, z) => !!indice.tocar(x, z, 0.42);
  const gente = Array.from({ length: 25 }, (_, i) => ({ x: -70 + (i % 5) * 4, z: -70 - ((i / 5) | 0) * 3, estado: { quieto: 0, lado: 1 } }));
  const t2 = performance.now();
  for (let f = 0; f < 120; f++) {
    for (const n of gente) {
      const m = moverNpc(n.x, n.z, 0.2, 0.15, ocupado, n.estado, 0.016);
      n.x = m.x; n.z = m.z;
      assert.equal(ocupado(n.x, n.z), false);
    }
  }
  const t3 = performance.now();
  assert.ok(t3 - t2 < 200, `movimiento lento: ${(t3 - t2).toFixed(1)} ms`);
});

test('la gente del juego usa el paso sólido y el cache sube', () => {
  assert.match(html, /npc-solido\.js\?v=1/);
  assert.match(html, /moverNpc\(/);
  assert.match(html, /function esPersona\(/);
  assert.match(html, /gente: true/);
  assert.match(sw, /const VERSION = 'tim-v125'/);
  assert.match(sw, /npc-solido\.js\?v=1/);
  assert.doesNotMatch(html, /n\.position\.x = dest\.x/);
  assert.match(html, /seguirVereda\(/);
  assert.match(html, /avanzarPorTramo\(/);
});
