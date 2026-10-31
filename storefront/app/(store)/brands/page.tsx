import Link from 'next/link';
import { brandSlug } from '@/lib/admin/schema';
import { ArrowUpRight } from 'lucide-react';
import { getBrands,getProducts } from '@/lib/repository';
export const metadata={title:'Our brands'};
export default async function Page(){const products=await getProducts();return <section className="wrap information-page"><span className="eyebrow">FIND YOUR FAVOURITES</span><h1>A world of watches.</h1><p className="lead">Explore the collection, one brand at a time.</p><div className="brand-directory">{(await getBrands()).map(b=><Link href={'/brands/'+brandSlug(b)+'/'} key={b}><span className={'brand-word '+b.toLowerCase()}>{b.toUpperCase()}</span><span>{products.filter(p=>p.brand===b).length} watches <ArrowUpRight size={20}/></span></Link>)}</div></section>}
