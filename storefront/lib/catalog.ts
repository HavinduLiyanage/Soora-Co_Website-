export type Gender = 'Men' | 'Women' | 'Unisex';
export type Sale = { priceMinor: number; startsAt: string; endsAt: string };
export type Variant = { id: string; colour: string; swatch: string; image: string; priceMinor: number; stock: number; sale?: Sale };
export type Product = { id: string; slug: string; brand: string; name: string; gender: Gender; style: string; movement: string; strap: string; description: string; variants: Variant[]; featured?: boolean };
export function priceOf(variant: Variant, at = new Date()) {
  const sale = variant.sale;
  const active = !!sale && sale.priceMinor >= 0 && sale.priceMinor < variant.priceMinor && at.getTime() >= Date.parse(sale.startsAt) && at.getTime() < Date.parse(sale.endsAt);
  const current = active && sale ? sale.priceMinor : variant.priceMinor;
  return { current, original: variant.priceMinor, onSale: active, discount: active ? Math.round((1 - current / variant.priceMinor) * 100) : 0 };
}
export function displayVariant(product: Product, at = new Date(), dealsOnly = false) {
  const available = product.variants.filter(v => v.stock > 0 && (!dealsOnly || priceOf(v, at).onSale));
  const candidates = available.length ? available : product.variants;
  return [...candidates].sort((a, b) => priceOf(a, at).current - priceOf(b, at).current)[0];
}
export function isDeal(product: Product, at = new Date()) { return product.variants.some(v => v.stock > 0 && priceOf(v, at).onSale); }
export function money(minor: number) { return `LKR ${new Intl.NumberFormat('en-LK', {minimumFractionDigits:minor%100?2:0,maximumFractionDigits:2}).format(minor / 100)}`; }
export type Filters = { q?: string; gender?: string; brand?: string; price?: string; sort?: string; available?: boolean; dealsOnly?: boolean };
export function filterProducts(products: Product[], filters: Filters, at = new Date()) {
  const query = normalizeSearch(filters.q || '');
  const result = products.filter(p => {
    const searchable = normalizeSearch(`${p.name} ${p.brand} ${p.id} ${p.style} ${p.movement} ${p.strap} ${p.gender} ${p.variants.map(v => v.colour).join(' ')}`);
    if (query && !query.split(' ').every(term => searchable.includes(term)) && query.replaceAll(' ', '') !== normalizeSearch(p.id).replaceAll(' ', '')) return false;
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.brand && p.brand !== filters.brand) return false;
    if (filters.dealsOnly && !isDeal(p, at)) return false;
    if (filters.available && !p.variants.some(v => v.stock > 0)) return false;
    const price = priceOf(displayVariant(p, at, filters.dealsOnly), at).current;
    if (filters.price === 'under-30000' && price >= 3000000) return false;
    if (filters.price === '30000-60000' && (price < 3000000 || price > 6000000)) return false;
    if (filters.price === 'over-60000' && price <= 6000000) return false;
    return true;
  });
  return result.sort((a,b) => {
    if (filters.sort === 'price-low' || filters.sort === 'price-high') {
      const difference = priceOf(displayVariant(a,at,filters.dealsOnly),at).current - priceOf(displayVariant(b,at,filters.dealsOnly),at).current;
      return filters.sort === 'price-low' ? difference : -difference;
    }
    if (filters.sort === 'saving') return priceOf(displayVariant(b,at,filters.dealsOnly),at).discount - priceOf(displayVariant(a,at,filters.dealsOnly),at).discount;
    return Number(!!b.featured) - Number(!!a.featured);
  });
}
export function normalizeSearch(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
export function catalogUrl(path: string, values: Record<string, string | boolean | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value === true) params.set(key, '1');
    else if (typeof value === 'string' && value.trim()) params.set(key, value.trim());
  });
  return path + (params.size ? '?' + params.toString() : '');
}
export function enquiryMessage(product: Product, variant: Variant, origin: string, at = new Date()) {
  return `Hi Soora & Co., ${variant.stock > 0 ? "I'm interested in" : "I'd like to ask about restocking"} the ${product.brand} ${product.name}.\nReference: ${product.id}\nDial: ${variant.colour}\nDisplayed price: ${money(priceOf(variant, at).current)}\n${origin}/watches/${product.slug}/\nCould you confirm availability and details?`;
}
