import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const position = { x: 0, y: 0, z: 0, copy(p) { Object.assign(this, { x:p.x, y:p.y, z:p.z }); }, set(x,y,z) { Object.assign(this,{x,y,z}); } };
const butler = { position, rotation: {}, userData: { task:'idle', order:null, hired:true } };
const state = { running: true, planet:'tierra', money:1000, inv:{food:0} };
let answer = '', message = '';
const context = vm.createContext({ butler, state, player:{position:{x:0,y:0,z:0}}, platusKeepers:[{x:40,z:-31}], countryKeepers:[], effectivePrice:i=>i.price, typing:false, BUTLER_HOME:{x:0,z:0}, BUTLER_SUPER:{x:40,z:-31}, butlerSpaceTaps:[], mountainHeightAt:()=>0, releaseLock(){}, prompt:()=>answer, toast:t=>{message=t;}, saveGame(){}, tone(){}, setTimeout(){}, swingLimbs(){}, dist2D:(a,b)=>Math.hypot(a.x-b.x,a.z-b.z), moveToward(e,t,step){const d=Math.hypot(t.x-e.position.x,t.z-e.position.z);e.position.x+=(t.x-e.position.x)*step/d;e.position.z+=(t.z-e.position.z)*step/d;} });
vm.runInContext(html.slice(html.indexOf('const STORE_A ='),html.indexOf('// Mayordomo:')), context);
vm.runInContext(html.slice(html.indexOf('const STORE_B'),html.indexOf('// Dibuja un producto')), context);
vm.runInContext(html.slice(html.indexOf('function normalizeButlerText'),html.indexOf('function payButlerWeeklyWage')), context);
vm.runInContext(html.slice(html.indexOf('function buyItem(item)'),html.indexOf('function setWeaponColor')), context);
const run = code => vm.runInContext(code,context);
const order = text => {answer=text;run('requestButlerOrder()');};
order('ve al supermercado y compra 3 paredes de madera');
assert.equal(state.money,820);assert.equal(butler.userData.order.qty,3);
order('compra 2 techos'); assert.equal(butler.userData.order.item.key,'wallWood','no reemplazar encargos pendientes');
state.money=0; // El jugador gastó todo su saldo disponible durante el trayecto.
for(let i=0;i<400;i++) run('updateButler(.05)');
assert.equal(state.inv.wallWood,3,'compra con dinero reservado aunque el saldo esté vacío');
assert.equal(state.money,0,'no cobrar dos veces');
for(let i=0;i<400;i++) run('updateButler(.05)');
assert.equal(butler.userData.order,null);
state.money=1000;order('compra papas en el supermercado');
assert.equal(butler.userData.order.item.key,'papas','no confundir papas con arma para papá');
const saved = JSON.parse(JSON.stringify({hired:true,task:butler.userData.task,x:position.x,z:position.z,order:{key:'papas',qty:1,reserved:70,bought:0}}));
context.saved=saved;run('restoreButler(saved)');
run('updateButler(0)');position.copy({x:40,z:-31});run('updateButler(.05)');assert.equal(state.inv.food,1);
assert.equal(state.money,930);
context.saved={...saved,task:'return',order:{...saved.order,reserved:0,bought:1}};
run('restoreButler(saved)');run('updateButler(0)');position.copy({x:0,z:0});run('updateButler(.05)');
assert.equal(state.inv.food,1,'cargar regreso no duplica compras');
order('compra cosas para la casa en el supermercado');assert.equal(butler.userData.task,'idle');assert.match(message,/No reconocí/);
order('compra comida y carne');assert.equal(butler.userData.order,null);assert.match(message,/un producto por viaje/);
order('compra 3 cocas');assert.equal(butler.userData.order.item.key,'coca');
run('resetButler()');state.money=10;order('compra 2 techos');assert.equal(butler.userData.order,null);
assert.ok(html.includes('restoreButler(d.butlerState)'));
assert.ok(html.includes('task: butler.userData.task'));
console.log('butler: ok');

// Contratación obligatoria, pago semanal y persistencia del calendario.
run('resetButler()'); state.money=1000; state.night=3;
order('compra comida'); assert.equal(butler.userData.order,null); assert.match(message,/Primero contrata/);
run('updateButler(.05)'); assert.equal(butler.visible,false);
run("buyItem(STORE_A.find(i => i.key === 'mayordomo'))");
assert.equal(state.money,500); assert.equal(butler.userData.hired,true);assert.equal(butler.visible,true);
run("buyItem(STORE_A.find(i => i.key === 'mayordomo'))");assert.equal(state.money,500,'no cobrar contratación duplicada');
vm.runInContext(html.slice(html.indexOf('function payButlerWeeklyWage'),html.indexOf('const STORE_B')),context);
for(let i=4;i<=9;i++){state.night=i;run('payButlerWeeklyWage()');}
assert.equal(state.money,500,'sin sueldo antes de siete días');
state.night=10;run('payButlerWeeklyWage()');assert.equal(state.money,400);
run('payButlerWeeklyWage()');assert.equal(state.money,400,'no duplicar pago en el mismo amanecer');
state.night=11;run('payButlerWeeklyWage()');
context.saved=JSON.parse(JSON.stringify({...butler.userData,x:0,z:0}));run('restoreButler(saved)');
assert.equal(butler.userData.workDays,1);assert.equal(butler.userData.hired,true);
state.money=30;
for(let i=12;i<=17;i++){state.night=i;run('payButlerWeeklyWage()');}
assert.equal(state.money,0);assert.equal(butler.userData.wageDebt,70);
state.money=200;
for(let i=18;i<=24;i++){state.night=i;run('payButlerWeeklyWage()');}
assert.equal(state.money,30);assert.equal(butler.userData.wageDebt,0);
context.saved={task:'toStore',order:{key:'comida',qty:1,reserved:100}};
run('restoreButler(saved)');assert.equal(butler.userData.hired,false);assert.equal(state.money,130,'devolver fondos de encargos anteriores sin contratación');
run('payButlerWeeklyWage()');assert.equal(state.money,130);
console.log('butler employment: ok');

// Cada nombre del catálogo debe resolverse al producto correcto.
for (const item of run('butlerCatalog()')) {
  context.productName=item.name;
  assert.equal(run('butlerFindItem(normalizeButlerText("compra " + productName)).key'),item.key,item.name);
}
for (const [text,key] of [['compra 3 sillas','silla'],['compra dos paredes de metal','wallMetal'],['compra una espada de obsidiana','espada_obsidiana'],['compra 2 semillas de tomate','semillas_tomate']]) {
  context.productName=text;assert.equal(run('butlerFindItem(normalizeButlerText(productName)).key'),key);
}
assert.equal(run('butlerQuantity("ve a un supermercado y compra tres techos")'),3);
assert.equal(run('butlerQuantity("compra semillas de tomate x6")'),1);
run('resetButler()');butler.userData.hired=true;state.money=10000;state.totalEarned=0;state.planet='tierra';
order('compra dos sillas');assert.equal(butler.userData.order.qty,2);
run('updateButler(0)');position.copy({x:40,z:-31});run('updateButler(.05)');assert.equal(state.inv.silla,2);
run('resetButler()');butler.userData.hired=true;
order('compra moto');assert.equal(butler.userData.order,null);assert.match(message,/desbloquea/);
order('compra jetpack alien');assert.equal(butler.userData.order,null);assert.match(message,/otro planeta/);
state.planet='platus';order('compra jetpack alien');assert.equal(butler.userData.order.item.key,'jetpack');
run('updateButler(0)');position.copy({x:40,z:-31});run('updateButler(.05)');assert.equal(state.hasJetpack,true);
run('resetButler()');butler.userData.hired=true;state.planet='tierra';
context.effectivePrice=i=>Math.round(i.price*.8);
order('compra dos sillas');assert.equal(butler.userData.order.item.price,64);
context.saved={hired:true,task:'toStore',order:{key:'silla',qty:2,price:64,reserved:128,planet:'tierra'}};
run('restoreButler(saved)');assert.equal(butler.userData.order.item.price,64);
state.planet='platus';run('updateButler(.05)');assert.equal(butler.userData.order.reserved,128,'no completar pedido del otro planeta');
console.log('butler full catalog: ok');
