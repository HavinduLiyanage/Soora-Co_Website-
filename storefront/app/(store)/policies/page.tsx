import Link from 'next/link';
export const metadata={title:'Store policies — preview', robots:{index:false,follow:true}};
const sections=[
 ['Delivery & collection','Delivery areas, charges, estimated timings, collection location and handling of delays need confirmation.'],
 ['Returns & exchanges','The store needs to confirm eligibility, time limits, watch condition requirements, exclusions and how to request a return.'],
 ['Warranty & product details','Warranty provider, coverage, duration, proof of purchase and service process need confirmation for each product.'],
 ['Payment & order confirmation','Accepted payment methods, any deposit requirements and the point at which an order is confirmed need approval.'],
 ['Privacy & contact','Before launch, the store must confirm its contact details, data handling, service providers, retention and any analytics or cookie use.'],
];
export default function Page(){return <section className="wrap information-page policy-page"><span className="eyebrow">STORE INFORMATION</span><h1>A little clarity,<br/>before you enquire.</h1><p className="lead">Delivery, orders and aftercare in one place.</p><div className="draft-notice"><strong>Draft page · Awaiting store confirmation</strong><p>This page is a content checklist for the preview. It does not establish store policies. Confirm the terms with Soora & Co. before placing an order.</p></div><div className="policy-sections">{sections.map(([title,text],i)=><section key={title}><span className="eyebrow">0{i+1}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}</div><Link className="text-link" href="/faq/">Read the questions & answers →</Link></section>}
