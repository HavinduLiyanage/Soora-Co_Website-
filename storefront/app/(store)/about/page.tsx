import { WatchImage } from '@/components/watch-image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export const metadata={title:'About'};
export default function Page(){return <section className="wrap information-page"><span className="eyebrow">SOORA & CO. · WHOLESALE & RETAIL</span><h1>A small detail.<br/>A lasting impression.</h1><p className="lead">Good watches for your everyday.</p><div className="about-layout"><WatchImage src="/images/hero.png" alt="Champagne-dial watch on stone"/><div><h2>Find your kind of time.</h2><p>Explore watches by brand, style and price. When something catches your eye, start a conversation with Soora & Co. to confirm the details and arrange your purchase.</p><Link className="button dark" href="/watches/">Explore the collection <ArrowUpRight size={17}/></Link><p className="fine-print">Store story, address and policies will be added with the client’s approved content.</p></div></div></section>}
