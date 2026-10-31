import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CatalogView from '@/components/catalog-view';
import { brandCollections } from '@/lib/collections';
import { getBrands, getProducts } from '@/lib/repository';
import { brandSlug } from '@/lib/admin/schema';
export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const brand = (await getBrands()).find(b => brandSlug(b) === slug);
  return {title: brand ? `${brand} watches` : 'Brand not found'};
}
export default async function Page({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const products=await getProducts(); const brands=await getBrands();
  const name=brands.find(b=>brandSlug(b)===slug);
  if (!name) notFound();
  const brand=brandCollections.find(b=>b.slug===slug) || {name,heading:`Discover ${name}.`,description:`Explore ${name} watches in the Soora & Co. collection.`,image:products.find(p=>p.brand===name)!.variants[0].image};
  return <Suspense fallback={<div className="wrap loading">Loading collection…</div>}><CatalogView products={products} brands={brands} fixedBrand={name} intro={brand}/></Suspense>;
}
