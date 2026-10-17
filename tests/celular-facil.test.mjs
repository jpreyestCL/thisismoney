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
  assert.match(sw, /const VERSION = 'tim-v112'/);
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
