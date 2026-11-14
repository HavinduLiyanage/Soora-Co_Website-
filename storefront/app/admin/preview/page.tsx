import Dashboard from '@/components/admin/dashboard';
import inventory from '@/lib/inventory.json';
import type { Product } from '@/lib/catalog';
import { defaultSettings } from '@/lib/admin/schema';
export default function PreviewPage() {
  const records = (inventory as Product[]).map((data, i) => ({
    id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    data, published_data: data, status: 'published' as const,
    version: 1, updated_at: '2026-11-14T00:00:00Z',
  }));
  return <Dashboard demo owner="Store owner" initialProducts={records}
    initialBanners={[]} initialSettings={{data: defaultSettings, version: 1}} live={false}/>;
}
