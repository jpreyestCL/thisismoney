import assert from 'node:assert/strict';
import { PARK, newPark, parkDate, startCampaign, maintainPark, settleParkDay, parkReport } from '../src/park-business.js';
const good = newPark(); const first = settleParkDay(good, () => .7);
assert.equal(first.ticket, 200);
assert.equal(first.revenue, first.visitors * 200);
assert.equal(good.cash, PARK.capital + first.profit);
assert.ok(first.profit > 0);
const bad = settleParkDay(newPark(), () => .01);
assert.ok(bad.profit < 0, 'tormentas y averías pueden generar pérdidas');
const promo = newPark(); assert.ok(startCampaign(promo, 'family'));
assert.equal(startCampaign(promo, 'social'), false, 'no apilar campañas');
const sale = settleParkDay(promo, () => .7);
assert.equal(sale.ticket, 160);
assert.equal(sale.costs.acciones, 600);
assert.equal(promo.cash, PARK.capital + sale.profit, 'no cobrar dos veces el marketing');
settleParkDay(promo, () => .7); assert.equal(promo.campaign, null);
const poor = newPark(); poor.cash = 0;
assert.equal(startCampaign(poor, 'radio'), false);
assert.equal(settleParkDay(poor, () => .7).visitors, 0);
assert.equal(poor.cash, -1600, 'los costos cerrados quedan adeudados');
const worn = newPark(); worn.condition = 20;
assert.equal(settleParkDay(worn, () => .7).visitors, 0);
assert.ok(maintainPark(worn)); assert.ok(worn.condition > 25);
const long = newPark(); long.cash = 1e8;
for (let i = 0; i < 400; i++) { long.condition = 100; settleParkDay(long, () => .7); }
assert.equal(parkReport(long, 'year').length, 2);
assert.equal(parkReport(long, 'month').length, 14);
for (const period of ['day', 'month', 'year']) {
  assert.equal(parkReport(long, period).reduce((s,r) => s+r.profit,0), long.history.reduce((s,r) => s+r.profit,0));
}
assert.equal(parkDate(365), '2027-01-01');
const restored = JSON.parse(JSON.stringify(promo));
assert.deepEqual(restored, promo);
assert.equal(settleParkDay(restored, () => .7).date, '2026-01-03');
console.log('park business: ok');
