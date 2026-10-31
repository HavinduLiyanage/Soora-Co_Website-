import { Suspense } from 'react';
import CatalogView from '@/components/catalog-view';
import { getBrands,getProducts,getBanner } from '@/lib/repository';
export const metadata={title:'Current deals'};
export default async function Page(){return <Suspense fallback={<div className="loading wrap">Preparing the offers…</div>}><CatalogView products={await getProducts()} brands={await getBrands()} dealsOnly banner={await getBanner('deals')}/></Suspense>}
