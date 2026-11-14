import { brandSlug } from './admin/schema';
import type { Gender } from './catalog';

export const categories: {slug: string; name: Gender; heading: string; description: string; image: string}[] = [
  {slug:'men', name:'Men', heading:'For your everyday.', description:'From a quiet classic to a statement on your wrist. Find your next watch.', image:''},
  {slug:'women', name:'Women', heading:'A little everyday elegance.', description:'Explore watches that bring a little more to the everyday.', image:''},
  {slug:'unisex', name:'Unisex', heading:'Good design is for everyone.', description:'Clean lines, timeless shapes. Choose the watch that feels like you.', image:''},
];
export const brandCollections = [
  {slug:'seiko', name:'Seiko', heading:'Discover Seiko.', description:'Explore Seiko watches in the Soora & Co. collection.', image:''},
  {slug:'casio', name:'Casio', heading:'Discover Casio.', description:'Explore Casio watches in the Soora & Co. collection.', image:''},
  {slug:'citizen', name:'Citizen', heading:'Discover Citizen.', description:'Explore Citizen watches in the Soora & Co. collection.', image:''},
  {slug:'tissot', name:'Tissot', heading:'Discover Tissot.', description:'Explore Tissot watches in the Soora & Co. collection.', image:''},
];
export const brandPath = (name: string) => '/brands/' + brandSlug(name) + '/';
export const categoryPath = (name: string) => '/watches/' + name.toLowerCase() + '/';
