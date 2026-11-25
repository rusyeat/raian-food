import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PRODUCTS,BUSINESS,getOption,findProduct,totals,normaliseCart,buildOrder,validPhone,whatsappURL} from '../dist/domain.js';
const cart=[{id:'doner',optionId:'b15',qty:2},{id:'fries',optionId:'standard',qty:1}];
const contact={name:'Сынақ Клиент',phone:'+7 (775) 000-00-00',address:'Сынақ көшесі, 12',comment:'Сынақ тапсырыс'};
test('menu keeps all 24 prices from supplied menu, including fractional chicken portions',()=>{
 assert.equal(PRODUCTS.length,14);
 assert.equal(PRODUCTS.flatMap(p=>p.options??[{price:p.price}]).length,24);
 assert.deepEqual(findProduct('doner').options.map(o=>o.price),[1300,1590,1800,1990,2200,2800]);
 assert.deepEqual(findProduct('shaurma').options.map(o=>o.price),[1200,1480,2000,2800]);
 assert.deepEqual(findProduct('chicken').options.map(o=>o.price),[1325,2650,3975]);
 assert.equal(getOption(findProduct('cheeseburger'),'standard').price,1550);
});
test('delivery adds exactly 500; pickup and dine-in add zero; empty cart adds zero',()=>{
 assert.deepEqual(totals(cart,'delivery'),{subtotal:4780,delivery:500,total:5280});
 assert.deepEqual(totals(cart,'pickup'),{subtotal:4780,delivery:0,total:4780});
 assert.equal(totals(cart,'dinein').total,4780);assert.equal(totals([],'delivery').total,0);
});
test('invalid saved cart entries are rejected and quantities capped and merged',()=>{
 assert.deepEqual(normaliseCart([{id:'missing',qty:2},{id:'doner',optionId:'wrong',qty:1},{id:'fries',qty:-3},{id:'fries',qty:1.5},null]),[]);
 assert.deepEqual(normaliseCart([{id:'doner',optionId:'c1',qty:95},{id:'doner',optionId:'c1',qty:20}]),[{id:'doner',optionId:'c1',qty:99}]);
 assert.deepEqual(normaliseCart({not:'array'}),[]);
});
test('Kazakhstan phone validates formatting while rejecting incomplete or foreign numbers',()=>{
 assert.equal(validPhone('+7 (775) 975-75-01'),true);assert.equal(validPhone('8 775 975 7501'),true);
 for(const value of ['777','+1 212 555 1234','+7 775 975 75011',''])assert.equal(validPhone(value),false);
});
test('delivery WhatsApp message includes selected variants, quantity, address and exact amount',()=>{
 const msg=buildOrder(cart,'delivery',contact,'kk','RF-TEST');
 for(const text of ['RF-TEST','Сиыр еті · бір жарым','× 2','3980 ₸','5280 ₸','500 ₸',contact.address,contact.phone,'әлі расталмаған','чекті'])assert.ok(msg.includes(text),text);
 const url=new URL(whatsappURL(msg));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/'+BUSINESS.phone);assert.equal(url.searchParams.get('text'),msg);
});
test('delivery requires contact and address; pickup never includes stale delivery address',()=>{
 assert.throws(()=>buildOrder([],'pickup',contact),/EMPTY_CART/);
 assert.throws(()=>buildOrder(cart,'delivery',{...contact,address:''}),/ADDRESS_REQUIRED/);
 assert.throws(()=>buildOrder(cart,'delivery',{...contact,phone:'123'}),/INVALID_CONTACT/);
 assert.throws(()=>buildOrder(cart,'bad',contact),/INVALID_MODE/);
 const msg=buildOrder(cart,'pickup',contact,'ru');assert.ok(msg.includes('Самовывоз'));assert.ok(msg.includes('Доставка: 0 ₸'));assert.ok(!msg.includes(contact.address));
});
test('dine-in table request accepts six tables and up to four guests with no automatic reservation',()=>{
 const details={...contact,table:'6',guests:'4',date:'2026-12-01',time:'18:30'};
 const msg=buildOrder(cart,'dinein',details,'ru');assert.ok(msg.includes('№6 (4 гостей)'));assert.ok(msg.includes('18:30'));assert.ok(msg.includes('Ожидаю подтверждения'));assert.ok(!msg.includes(contact.address));
 for(const invalid of [{table:'7'},{table:'0'},{guests:'5'},{guests:'1.5'},{date:''}])assert.throws(()=>buildOrder(cart,'dinein',{...details,...invalid}),/TABLE_REQUIRED/);
});
