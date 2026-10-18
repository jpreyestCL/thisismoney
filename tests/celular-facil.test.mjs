// Celular: comprar con el dedo y un botón de pantalla completa.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

function bloque(nombre) {
  const i = html.indexOf('function ' + nombre);
  assert.ok(i >= 0, 'falta ' + nombre);
  return html.slice(i, html.indexOf('\nfunction ', i + 1));
}

test('el celular tiene botón de comprar y de pantalla completa', () => {
  assert.match(html, /<button id="shopBuyBtn"/);
  assert.match(html, /<button id="fsBtn"/);
  assert.match(html, /body\.touch #fsBtn\s*\{[^}]*display:\s*flex/);
  assert.match(html, /#fsBtn\s*\{[^}]*display:\s*none/);
  assert.match(html, /ui\('shopBuyBtn'\)\.onclick = comprarDesdeLista/);
  assert.match(html, /ui\('fsBtn'\)\.onclick = toggleFullscreen/);
  const pantalla = bloque('toggleFullscreen');
  assert.match(pantalla, /requestFullscreen/);
  assert.match(pantalla, /exitFullscreen/);
  assert.equal(html.split('requestFullscreen').length - 1, 1, 'la pantalla completa solo se pide desde el botón');
  assert.doesNotMatch(bloque('startGame'), /requestFullscreen|toggleFullscreen/);
  assert.match(sw, /const VERSION = 'tim-v120'/);
});

test('en el celular un toque compra y en PC se sigue manteniendo E', () => {
  const tactil = bloque('tryBuyStandTouch');
  assert.match(tactil, /document\.body\.classList\.contains\('touch'\)/);
  assert.match(tactil, /return false/);
  assert.match(bloque('updateBuying'), /keys\['KeyE'\]/);
  assert.match(bloque('tryFamilyOrCitizenInteract'), /productoDeSuperCerca\(\)/);
  assert.match(html, /!tryBuyStandTouch\(\)/);
  assert.match(html, /id="toqueFuera"/);
  assert.match(html, /body\.touch\.recuadro #lookLayer\s*\{[^}]*pointer-events:\s*none/);
  assert.match(html, /body\.touch #mallCatalogo\s*\{[^}]*min-height:\s*150px/);
});

test('en el celular la fila del vendedor recibe el toque', () => {
  assert.match(html, /body\.touch\.recuadro #hud\s*\{[^}]*z-index:\s*20/);
  assert.match(html, /#jobBtn\s*\{[^}]*z-index:\s*7/);
  assert.match(html, /row\.onclick = \(\) => buyShopItem\(it\)/);
  assert.match(bloque('comprarDesdeLista'), /buyShopItem\(item\)/);
  assert.match(html, /<button id="shopBuyBtn"/);
});

test('en táctil un toque compra y los avisos usan una clase más chica', () => {
  assert.match(html, /function tryComprarAlTocar\(\)/);
  assert.match(html, /tryComprarAlTocar\(\)/);
  const mall = bloque('mallElegirItem');
  assert.match(mall, /classList\.contains\('touch'\)/);
  assert.match(mall, /buyItem\(item\)/);
  assert.match(mall, /mallAgregar\(mallCart/);
  assert.match(html, /id="toast" class="aviso"/);
  assert.match(html, /id="objective" class="aviso"/);
  assert.match(html, /id="missions" class="aviso"/);
  assert.match(html, /id="jobBtn" class="aviso"/);
  assert.match(html, /body\.touch \.aviso\s*\{[^}]*font-size:\s*10px/);
});
