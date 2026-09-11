import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(html,/id="fuelWarning" role="status"/);
assert.match(html,/const lowFuel = !!\(car && !car\.helicopter && car\.fuel < 25\)/);
assert.match(html,/car\.fuel <= 0 \? '⛽ SIN GASOLINA/);
assert.match(html,/fuelWarning\.classList\.toggle\('critical'/);
assert.match(html,/Cargar gasolina · \$3 por unidad/);
console.log('fuel warning: ok');
