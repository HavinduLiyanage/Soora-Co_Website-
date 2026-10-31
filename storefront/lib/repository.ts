import 'server-only';
import { cache } from 'react';
import { products } from './fixtures';
import { db } from './server/db';
import { defaultSettings, activeBanner, type Banner, type StoreSettings } from './admin/schema';
import type { Product } from './catalog';
export const liveCatalog = () => process.env.CATALOG_SOURCE === 'database';
// Per-request memoisation only. Never replace real stock with fixtures on database failure.
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!liveCatalog()) return products;
  const {rows}=await db().query("select published_data from store_products where status='published' order by updated_at desc");
  return rows.map(r=>r.published_data as Product);
});
export async function getProduct(slug:string) {return (await getProducts()).find(p=>p.slug===slug);}
export async function getBrands() {return [...new Set((await getProducts()).map(p=>p.brand))].sort();}
export const getSettings=cache(async ():Promise<StoreSettings> => {
  if (!liveCatalog()) return defaultSettings;
  const {rows}=await db().query('select data from store_settings where id=1');
  if (!rows.length) throw new Error('Store settings are missing.');
  return rows[0].data;
});
export async function getBanner(placement:Banner['placement']) {
  if (!liveCatalog()) return undefined;
  const {rows}=await db().query("select published_data from store_banners where status='published' order by updated_at desc");
  return activeBanner(rows.map(r=>r.published_data),placement);
}
