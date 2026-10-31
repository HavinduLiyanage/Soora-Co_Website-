'use client';
import {useState} from 'react';
import {ArrowRight, Check, Copy} from 'lucide-react';
export default function WholesaleEnquiry() {
  const [message,setMessage]=useState('');
  const [copied,setCopied]=useState(false);
  const [copyError,setCopyError]=useState(false);
  return <div className="wholesale-composer"><form onSubmit={e=>{
    e.preventDefault(); const values=new FormData(e.currentTarget);
    setMessage(`Hi Soora & Co., I'd like to discuss a wholesale enquiry.\n${values.get('business')?`Business: ${values.get('business')}\n`:''}Approximate quantity: ${values.get('quantity')} watches\nInterested in: ${values.get('interest')}\nPlease share availability, wholesale pricing and order terms.`);
    setCopied(false);setCopyError(false);
  }}><h2>Tell us what you have in mind.</h2><p>Prepare an enquiry to discuss directly with the store.</p><label htmlFor="business">Business name <span>(optional)</span></label><input id="business" name="business" autoComplete="organization" maxLength={100}/><label htmlFor="quantity">Approximate number of watches</label><input id="quantity" name="quantity" type="number" min="1" max="100000" step="1" required inputMode="numeric" placeholder="e.g. 20"/><label htmlFor="interest">Brands, models or styles</label><textarea id="interest" name="interest" required maxLength={1500} rows={4} placeholder="Tell us which watches interest you…"/><button className="button dark" type="submit">Prepare enquiry <ArrowRight size={17}/></button><p className="fine-print">Preview only. This form does not send or save your details.</p></form>
  {message&&<section className="prepared-message" aria-label="Prepared wholesale enquiry"><span className="eyebrow">YOUR ENQUIRY PREVIEW</span><h2>Ready for a conversation.</h2><label htmlFor="wholesale-message">Your message</label><textarea id="wholesale-message" rows={9} value={message} onChange={e=>{setMessage(e.target.value);setCopied(false)}}/><button className="button outline" onClick={async()=>{try{await navigator.clipboard.writeText(message);setCopied(true);setCopyError(false)}catch{setCopyError(true)}}}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?'Message copied':'Copy message'}</button><p className="fine-print" role="status">{copyError?'Copy is unavailable in this browser. Select and copy the message above.':copied?'Copied. Nothing has been sent.':'Live WhatsApp contact will be enabled when the store confirms its number.'}</p></section>}
  </div>;
}
