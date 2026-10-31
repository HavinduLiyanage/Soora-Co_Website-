import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CatalogView from '@/components/catalog-view';
import { brandCollections } from '@/lib/collections';
import { getBrands, getProducts } from '@/lib/repository';
export function generateStaticParams() { return brandCollections.map(b => ({slug: b.slug})); }
export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const brand = brandCollections.find(b => b.slug === slug);
  return {title: brand ? `${brand.name} watches` : 'Brand not found'};
}
export default async function Page({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const brand = brandCollections.find(b => b.slug === slug);
  if (!brand) notFound();
  return <Suspense fallback={<div className="wrap loading">Loading collection…</div>}><CatalogView products={getProducts()} brands={getBrands()} fixedBrand={brand.name} intro={brand}/></Suspense>;
}
