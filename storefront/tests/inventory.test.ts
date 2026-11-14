import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productSchema} from '../lib/admin/schema.ts';
import {enquiryMessage, filterProducts, isDeal, type Product} from '../lib/catalog.ts';
const products = JSON.parse(readFileSync(new URL('../lib/inventory.json',import.meta.url),'utf8')) as Product[];
test('client import has 38 unique validated products and no demo records or invented discounts',()=>{
  assert.equal(products.length,38);
  assert.equal(new Set(products.map(p=>p.id)).size,38);
  for(const p of products){productSchema.parse(p);assert.ok(!p.id.startsWith('DEMO-'));assert.equal(isDeal(p),false);assert.equal(p.variants[0].image,'');assert.equal(p.variants[0].availabilityUnconfirmed,true);}
  assert.equal(products[0].variants[0].priceMinor,1795000);
  assert.equal(products[37].variants[0].priceMinor,10000000);
  assert.equal(products[36].id,'EFV-C100D-1AVDF');
});
test('unconfirmed inventory does not claim available stock or imply restocking in enquiries',()=>{
  assert.equal(filterProducts(products,{available:true}).length,0);
  assert.equal(filterProducts(products,{brand:'Casio'}).length,35);
  assert.equal(filterProducts(products,{brand:'Seiko'}).length,3);
  assert.doesNotMatch(enquiryMessage(products[0],products[0].variants[0],'https://example.test'),/restocking|Stock quantity/);
});
