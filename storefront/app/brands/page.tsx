import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getBrands,getProducts } from '@/lib/repository';
export const metadata={title:'Our brands'};
export default function Page(){return <section className="wrap information-page"><span className="eyebrow">FIND YOUR FAVOURITES</span><h1>A world of watches.</h1><p className="lead">Explore the collection, one brand at a time.</p><div className="brand-directory">{getBrands().map(b=><Link href={'/brands/'+b.toLowerCase()+'/'} key={b}><span className={'brand-word '+b.toLowerCase()}>{b.toUpperCase()}</span><span>{getProducts().filter(p=>p.brand===b).length} watches <ArrowUpRight size={20}/></span></Link>)}</div></section>}
