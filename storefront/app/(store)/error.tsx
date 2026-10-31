'use client';
export default function StoreError({reset}:{reset:()=>void}) {return <section className="wrap information-page"><span className="eyebrow">WE’LL BE RIGHT BACK</span><h1>The collection couldn’t load.</h1><p>Please try again in a moment.</p><button className="button dark" onClick={reset}>Try again</button></section>;}
