import type { ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & {src: string; priority?: boolean};
export function WatchImage({src, priority = false, sizes, ...props}: Props) {
  if (!src) return <span className="photo-pending" role="img" aria-label="Product photo not yet available"><span>SOORA & CO.</span><small>Photo coming soon</small></span>;
  const name = src.match(/^\/images\/(hero|steel|dress|digital|leather)\.png$/)?.[1];
  if (!name) return <img src={src} {...props} sizes={sizes} loading={priority ? 'eager' : props.loading || 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined}/>;
  const widths = name === 'hero' ? [640, 1280, 1920] : [320, 640, 960];
  return <img {...props} src={`/images/optimized/${name}-${widths[1]}.webp`} srcSet={widths.map(width => `/images/optimized/${name}-${width}.webp ${width}w`).join(', ')} sizes={sizes || '(max-width:600px) 45vw, (max-width:800px) 44vw, 25vw'} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined}/>;
}
