import { stockStatus, type Variant } from '@/lib/catalog';

export function StockChip({ variant }: { variant: Variant }) {
  const status = stockStatus(variant);
  return <span className={`stock-chip ${status}`}><span aria-hidden="true" />{status === 'in_stock' ? 'In stock' : status === 'out_of_stock' ? 'Out of stock' : 'Confirm availability'}</span>;
}
