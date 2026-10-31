import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product-detail';
import { getProduct,getProducts } from '@/lib/repository';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const p=await getProduct((await params).slug);return {title:p?`${p.brand} ${p.name}`:'Watch not found'}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const product=await getProduct((await params).slug);if(!product)notFound();return <ProductDetail product={product} related={(await getProducts()).filter(p=>p.id!==product.id&&p.variants.some(v=>v.stock>0)).slice(0,4)}/>}
