import fs from 'node:fs/promises';
import sharp from 'sharp';
const inventory=JSON.parse(await fs.readFile('lib/inventory.json','utf8'));
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#039;',"'").replaceAll('&quot;','"');
const get=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw new Error(`${r.status} ${url}`);return r;};
await fs.mkdir('.cache/images',{recursive:true});
await fs.mkdir('public/images/products',{recursive:true});
const listings=await Promise.all(['https://ranasinghewatchworks.lk/product?sort=price_asc&type=watch','https://ranasinghewatchworks.lk/product?per_page=96&type=watch','https://www.ranasinghewatchworks.lk/product?per_page=96&sort=newest&type=watch'].map(async url=>(await get(url)).text()));
const links=[...new Set(listings.flatMap(s=>[...s.matchAll(/href="(https:\/\/(?:www\.)?ranasinghewatchworks\.lk\/product\/[^"?#]+)"/g)].map(m=>decode(m[1]))))];
const manifest=JSON.parse(await fs.readFile('lib/product-image-sources.json','utf8').catch(()=>'[]')); 
for(let offset=0;offset<inventory.length;offset+=4){
 await Promise.all(inventory.slice(offset,offset+4).map(async p=>{
  if(manifest.some(m=>m.model===p.id))return;
  const ref=p.id.toLowerCase();
  const url=links.find(u=>u.split('/').pop().split('-').join('').includes(ref.replaceAll('-','')));
  if(!url){console.log('MISSING PAGE',p.id);return;}
  const html=await (await get(url)).text();
  await fs.writeFile('.cache/images/'+ref+'.html',html);
  const title=decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]*>/g,'').trim()||'');
  if(!title.toUpperCase().includes(p.id)){console.log('TITLE MISMATCH',p.id,title);return;}
  const image=decode(html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/)?.[1]||'');
  if(!image.includes('/storage/')||image.includes('/settings/')){console.log('MISSING IMAGE',p.id);return;}
  const bytes=Buffer.from(await (await get(image)).arrayBuffer());
  const metadata=await sharp(bytes).metadata();
  const path=`/images/products/${ref}.webp`;
  await sharp(bytes).rotate().resize({width:1000,height:1000,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile('public'+path);
  manifest.push({model:p.id,title,page:url,image,local:path,width:metadata.width,height:metadata.height});
  console.log('MATCH',p.id,metadata.width,metadata.height);
 }));
}
await fs.writeFile('lib/product-image-sources.json',JSON.stringify(manifest.sort((a,b)=>a.model.localeCompare(b.model)),null,2)+'\n');
console.log(`Sourced ${manifest.length}/${inventory.length}; catalog not changed until visual review.`);
