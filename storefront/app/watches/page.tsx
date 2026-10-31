import { Suspense } from 'react';
import CatalogView from '@/components/catalog-view';
import { getBrands,getProducts } from '@/lib/repository';
export const metadata={title:'The collection'};
export default function Page(){return <Suspense fallback={<div className="loading wrap">Preparing the collection…</div>}><CatalogView products={getProducts()} brands={getBrands()}/></Suspense>}
