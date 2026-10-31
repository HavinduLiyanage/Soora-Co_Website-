'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { catalogUrl, filterProducts, type Product, type Gender } from '@/lib/catalog';
import { categoryPath } from '@/lib/collections';
import { ProductCard } from './store';
import { WatchImage } from './watch-image';

type Selection = {brand:string; price:string; available:boolean};
type Props = {products:Product[]; brands:string[]; dealsOnly?:boolean; searchPage?:boolean; fixedGender?:Gender; fixedBrand?:string; intro?:{heading:string; description:string; image:string}};
const priceLabels: Record<string,string> = {'under-30000':'Under LKR 30,000','30000-60000':'LKR 30,000–60,000','over-60000':'Over LKR 60,000'};
export default function CatalogView({products,brands,dealsOnly=false,searchPage=false,fixedGender,fixedBrand,intro}:Props) {
  const params=useSearchParams(); const router=useRouter(); const path=usePathname();
  const [q,setQ]=useState(params.get('q')||''); const drawer=useRef<HTMLDialogElement>(null);
  const [now,setNow]=useState(new Date()); const [draft,setDraft]=useState<Selection>({brand:'',price:'',available:false});
  useEffect(()=>setQ(params.get('q')||''),[params]);
  useEffect(()=>{const update=()=>setNow(new Date()); const timer=setInterval(update,60000); window.addEventListener('focus',update); return()=>{clearInterval(timer);window.removeEventListener('focus',update)}},[]);
  const filters={q:params.get('q')||'', gender:fixedGender||(['Men','Women','Unisex'].includes(params.get('gender')||'')?params.get('gender')!:'') ,brand:fixedBrand||(brands.includes(params.get('brand')||'')?params.get('brand')!:''), price:priceLabels[params.get('price')||'']?params.get('price')!:'',sort:params.get('sort')||'', available:params.get('available')==='1',dealsOnly};
  const visible=filterProducts(products,filters,now);
  const update=(changes:Record<string,string|boolean>)=>{
    const next={...filters,...changes};
    router.replace(catalogUrl(path,{q:next.q,gender:fixedGender?'':next.gender,brand:fixedBrand?'':next.brand,price:next.price,sort:next.sort,available:next.available}),{scroll:false});
  };
  const clear=()=>router.replace(path,{scroll:false});
  const fields=(prefix:string,value:Selection,change:(changes:Partial<Selection>)=>void)=><>
    {!fixedBrand&&<label htmlFor={prefix+'brand'}>Brand<select id={prefix+'brand'} value={value.brand} onChange={e=>change({brand:e.target.value})}><option value="">All brands</option>{brands.map(b=><option key={b}>{b}</option>)}</select></label>}
    <label htmlFor={prefix+'price'}>Price<select id={prefix+'price'} value={value.price} onChange={e=>change({price:e.target.value})}><option value="">All prices</option>{Object.entries(priceLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    <label className="availability-filter"><input type="checkbox" checked={value.available} onChange={e=>change({available:e.target.checked})}/> In stock only</label>
  </>;
  const chips=[{key:'q',label:filters.q&&`“${filters.q}”`},{key:'brand',label:!fixedBrand&&filters.brand},{key:'gender',label:!fixedGender&&filters.gender},{key:'price',label:priceLabels[filters.price]},{key:'available',label:filters.available&&'In stock'}].filter(c=>c.label);
  const draftCount=filterProducts(products,{...filters,...draft,brand:fixedBrand||draft.brand},now).length;
  const title=dealsOnly?'Deals':fixedBrand||fixedGender|| (searchPage?'Search':'All watches');
  return <>
    <section className={'collection-hero'+(dealsOnly?' sale-hero':intro?' curated-hero':'')}>
      {dealsOnly&&<WatchImage src="/images/hero.png" alt="" sizes="100vw" priority/>}
      <div className="wrap"><div className="collection-intro"><span className="eyebrow">{dealsOnly?'THE SOORA & CO. EDIT':fixedBrand?'THE BRAND COLLECTION':searchPage?'FIND YOUR FAVOURITE':'FIND SOMETHING THAT FEELS LIKE YOU'}</span><h1>{dealsOnly?<>Good watches.<br/>Better prices.</>:intro?.heading|| (searchPage?'What catches your eye?':'Your next everyday.')}</h1><p>{dealsOnly?'A closer look at our current offers.':intro?.description|| (searchPage?'Search by brand, model, reference or style.':'Explore the collection. Find your kind of time.')}</p></div>{intro&&<WatchImage className="collection-image" src={intro.image} alt="" sizes="(max-width:600px) 35vw, 25vw" priority/>}</div>
    </section>
    <section className="wrap catalog-section">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span>{fixedBrand&&<><Link href="/brands/">Brands</Link><span>/</span></>}{fixedGender&&<><Link href="/watches/">All watches</Link><span>/</span></>}<span>{title}</span></div>
      <div className="catalog-top"><div><h2>{filters.q?`Results for “${filters.q}”`:dealsOnly?'Current deals':'The collection'}</h2><p role="status">{visible.length} {visible.length===1?'watch':'watches'}</p></div><form className="catalog-search" onSubmit={e=>{e.preventDefault();update({q})}}><Search size={18}/><input aria-label="Search the collection" placeholder="Brand, model or style…" value={q} onChange={e=>setQ(e.target.value)}/><button type="submit" aria-label="Apply search"><ArrowRight size={18}/></button></form></div>
      <div className="gender-tabs" aria-label="Category">{['','Men','Women','Unisex'].map(g=>fixedGender?<Link key={g} className={g===fixedGender?'selected':''} aria-current={g===fixedGender?'page':undefined} href={catalogUrl(g?categoryPath(g):'/watches/',{q:filters.q,brand:filters.brand,price:filters.price,sort:filters.sort,available:filters.available})}>{g||'All watches'}</Link>:<button key={g} className={filters.gender===g?'selected':''} aria-pressed={filters.gender===g} onClick={()=>update({gender:g})}>{g||'All watches'}</button>)}</div>
      <div className="filter-row"><div className="desktop-filters">{fields('desktop-',filters,change=>update(change as Record<string,string|boolean>))}</div><button className="button outline filter-toggle" onClick={()=>{setDraft({brand:filters.brand,price:filters.price,available:filters.available});drawer.current?.showModal()}}><SlidersHorizontal size={16}/>Filters{(!fixedBrand&&filters.brand)||filters.price||filters.available?' · Active':''}</button><label className="sort-control">Sort by<select aria-label="Sort watches" value={filters.sort} onChange={e=>update({sort:e.target.value})}><option value="">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>{dealsOnly&&<option value="saving">Biggest saving</option>}</select></label></div>
      {chips.length>0&&<div className="active-filters"><div className="filter-chips">{chips.map(c=><button key={c.key} aria-label={'Remove '+c.label+' filter'} onClick={()=>update({[c.key]:c.key==='available'?false:''})}>{c.label}<X size={13}/></button>)}</div><button onClick={clear}>Clear all</button></div>}
      {visible.length?<div className="product-grid catalog-grid">{visible.map(p=><ProductCard key={p.id} product={p} dealsOnly={dealsOnly} at={now}/>)}</div>:<div className="empty-state"><Search size={34}/><h2>{dealsOnly&&!chips.length?'More good finds soon.':'No watches found.'}</h2><p>{dealsOnly&&!chips.length?'There are no active deals in this collection right now.':'Try fewer keywords, a different brand, or a wider price range.'}</p>{chips.length>0&&<button className="button dark" onClick={clear}>Reset filters <ArrowRight size={16}/></button>}<Link className="text-link" href="/watches/">Browse all watches <ArrowRight size={16}/></Link></div>}
      <div className="catalog-end">{visible.length>0&&<p>You’re all caught up. {visible.length} {visible.length===1?'watch':'watches'} in this selection.</p>}{dealsOnly&&<Link className="text-link" href="/watches/">Explore the full collection<ArrowRight size={16}/></Link>}</div>
    </section>
    <dialog ref={drawer} className="filter-dialog" aria-labelledby="filter-heading" onClick={e=>{if(e.target===e.currentTarget)drawer.current?.close()}}><div className="dialog-head"><h2 id="filter-heading">Refine your collection</h2><button className="icon-button" aria-label="Cancel filters" onClick={()=>drawer.current?.close()}><X/></button></div><div className="drawer-fields">{fields('mobile-',draft,change=>setDraft({...draft,...change}))}</div><button className="button dark" onClick={()=>{update(draft);drawer.current?.close()}}>Show {draftCount} {draftCount===1?'watch':'watches'} <ArrowRight size={17}/></button><div className="drawer-actions"><button className="text-link" onClick={()=>setDraft({brand:fixedBrand||'',price:'',available:false})}>Reset filters</button><button className="text-link" onClick={()=>drawer.current?.close()}>Cancel</button></div></dialog>
  </>;
}
