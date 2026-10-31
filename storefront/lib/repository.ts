import { products } from './fixtures';
// Fixture adapter for milestone 1. Replace these functions with published CMS queries in milestone 4.
export function getProducts() { return products; }
export function getProduct(slug: string) { return products.find(p => p.slug === slug); }
export function getBrands() { return [...new Set(products.map(p => p.brand))].sort(); }
