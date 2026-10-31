import { Suspense } from 'react';
import CatalogView from '@/components/catalog-view';
import { getBrands, getProducts } from '@/lib/repository';
export const metadata = {title: 'Search watches', robots: {index:false, follow:true}};
export default async function Page() {return <Suspense fallback={<div className="wrap loading">Loading search…</div>}><CatalogView products={await getProducts()} brands={await getBrands()} searchPage/></Suspense>;}
