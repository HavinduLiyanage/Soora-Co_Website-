import { Suspense } from 'react';
import CatalogView from './catalog-view';
import { categories } from '@/lib/collections';
import { getBrands, getProducts } from '@/lib/repository';
import type { Gender } from '@/lib/catalog';
export default async function CategoryPage({gender}: {gender: Gender}) {
  const intro = categories.find(c => c.name === gender)!;
  return <Suspense fallback={<div className="wrap loading">Loading collection…</div>}><CatalogView products={await getProducts()} brands={await getBrands()} fixedGender={gender} intro={intro}/></Suspense>;
}
