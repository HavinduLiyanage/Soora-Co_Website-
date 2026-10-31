import type { NextConfig } from 'next';
// Vercel runs Next.js server features; the existing local review remains exportable.
const serverBuild = process.env.VERCEL === '1' || process.env.SOORA_OUTPUT === 'server';
const config: NextConfig = {
  ...(serverBuild ? {} : { output: 'export' as const }),
  trailingSlash: true,
  images: { unoptimized: true },
};
export default config;
