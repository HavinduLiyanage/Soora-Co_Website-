import assert from 'node:assert/strict';
const origin=process.env.QA_ORIGIN || 'https://soora-co-website-bice.vercel.app';
const queue=['/','/watches/','/deals/','/brands/','/search/','/wholesale/','/contact/','/faq/','/policies/','/about/'];
const seen=new Set(),assets=new Set(),failures=[];
while(queue.length){const batch=queue.splice(0,4).filter(p=>!seen.has(p));for(const p of batch)seen.add(p);await Promise.all(batch.map(async path=>{const r=await fetch(origin+path);const html=await r.text();if(r.status!==200||html.includes('Something went wrong'))failures.push({path,status:r.status});for(const m of html.matchAll(/href="(\/[^"?#]*)"/g)){const p=m[1];if(!p.startsWith('/_next')&&!p.startsWith('/admin')&&!p.startsWith('/api')&&!p.includes('.')&&!seen.has(p)&&!queue.includes(p))queue.push(p)}for(const m of html.matchAll(/(?:src|srcSet)="([^" ]+)/g)){if(m[1].startsWith('/images/'))assets.add(m[1])}}))}
for(const path of assets){const r=await fetch(origin+path);if(!r.ok)failures.push({path,status:r.status})}
const missing=await fetch(origin+'/watches/qa-does-not-exist/');assert.equal(missing.status,404);
console.log(JSON.stringify({pages:seen.size,images:assets.size,failures,missingProduct404:true},null,2));if(failures.length)process.exitCode=1;
