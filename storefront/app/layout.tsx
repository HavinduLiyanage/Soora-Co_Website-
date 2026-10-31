import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
import { Header, Footer } from '@/components/store';
export const metadata: Metadata = {title:{default:'Soora & Co. | Find your next watch',template:'%s | Soora & Co.'},description:'Explore the Soora & Co. watch collection. A private frontend design preview with sample inventory.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/><main id="main">{children}</main><Footer/></body></html>}
