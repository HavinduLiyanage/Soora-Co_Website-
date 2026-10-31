import { Header, Footer } from '@/components/store';
import { StoreProvider } from '@/components/store-provider';
import { getSettings } from '@/lib/repository';
export const dynamic='force-dynamic';
export default async function StoreLayout({children}:{children:React.ReactNode}) {
  return <StoreProvider settings={await getSettings()}><Header/><main id="main">{children}</main><Footer/></StoreProvider>;
}
