import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceOf, isDeal, displayVariant, filterProducts, enquiryMessage, type Product, type Variant } from '../lib/catalog.ts';
const sale = {priceMinor:4800000,startsAt:'2026-10-01T00:00:00Z',endsAt:'2026-11-01T00:00:00Z'};
const variant: Variant = {id:'black',colour:'Black',swatch:'#000',image:'sample.png',priceMinor:6000000,stock:2,sale};
const product: Product = {id:'S01',slug:'sport',brand:'Seiko',name:'Sport',gender:'Men',style:'Sport',movement:'Automatic',strap:'Steel',description:'Sample',variants:[variant]};
const now=new Date('2026-10-31T00:00:00Z');
test('sale starts inclusively, expires exclusively, and computes the correct saving',()=>{assert.equal(priceOf(variant,new Date(sale.startsAt)).current,4800000);assert.equal(priceOf(variant,now).discount,20);assert.equal(priceOf(variant,new Date(sale.endsAt)).current,6000000)});
test('invalid or increased sale prices never produce discounts',()=>{assert.equal(priceOf({...variant,sale:{...sale,priceMinor:6500000}},now).onSale,false);assert.equal(priceOf({...variant,sale:{...sale,priceMinor:-1}},now).onSale,false)});
test('sold-out discounts do not enter Deals and an available variant is preferred',()=>{const p={...product,variants:[{...variant,stock:0},{...variant,id:'white',colour:'White',stock:2,sale:undefined,priceMinor:7000000}]};assert.equal(isDeal(p,now),false);assert.equal(displayVariant(p,now).id,'white')});
test('Deals prices and sorting use an eligible sale variant rather than a cheaper regular variant',()=>{const p={...product,variants:[{...variant,id:'cheap',sale:undefined,priceMinor:1000000},variant]};assert.equal(displayVariant(p,now,true).id,'black');assert.equal(filterProducts([p],{dealsOnly:true,price:'under-30000'},now).length,0)});
test('search, gender, price and stock filters compose',()=>{assert.equal(filterProducts([product],{q:'SEIKO',gender:'Men',price:'30000-60000',available:true},now).length,1);assert.equal(filterProducts([product],{gender:'Unisex'},now).length,0);assert.equal(filterProducts([product],{q:'no match'},now).length,0)});
test('enquiry text reflects selected variant, current price and product URL',()=>{const message=enquiryMessage(product,variant,'https://example.test',now);assert.match(message,/Dial: Black/);assert.match(message,/48,000/);assert.match(message,/https:\/\/example.test\/watches\/sport\//);assert.match(enquiryMessage(product,{...variant,stock:0},'https://example.test',now),/restocking/)});

test('search accepts independent words, different word order, colour and strap',()=>{
 assert.equal(filterProducts([product],{q:'Seiko automatic'},now).length,1);
 assert.equal(filterProducts([product],{q:'BLACK steel SEIKO'},now).length,1);
 assert.equal(filterProducts([product],{q:'Seiko quartz'},now).length,0);
});
test('model references can be searched without punctuation',()=>{
 const referenceProduct={...product,id:'DEMO-S01'};
 assert.equal(filterProducts([referenceProduct],{q:'demos01'},now).length,1);
 assert.equal(filterProducts([referenceProduct],{q:'demo s01'},now).length,1);
});
test('sale expiry removes products from deals and restores the regular price',()=>{
 const expired=new Date('2026-11-01T00:00:00Z');
 assert.equal(filterProducts([product],{dealsOnly:true},expired).length,0);
 assert.equal(priceOf(variant,expired).current,6000000);
});
