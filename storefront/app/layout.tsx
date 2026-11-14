import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
export const metadata: Metadata = {title:{default:'Soora & Co. | Find your next watch',template:'%s | Soora & Co.'},description:'Explore the Soora & Co. watch collection. Browse models and prices, and enquire directly with the store.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
