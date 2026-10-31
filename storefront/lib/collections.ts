import { brandSlug } from './admin/schema';
import type { Gender } from './catalog';

export const categories: {slug: string; name: Gender; heading: string; description: string; image: string}[] = [
  {slug:'men', name:'Men', heading:'For your everyday.', description:'From a quiet classic to a statement on your wrist. Find your next watch.', image:'/images/steel.png'},
  {slug:'women', name:'Women', heading:'A little everyday elegance.', description:'Explore watches that bring a little more to the everyday.', image:'/images/dress.png'},
  {slug:'unisex', name:'Unisex', heading:'Good design is for everyone.', description:'Clean lines, timeless shapes. Choose the watch that feels like you.', image:'/images/digital.png'},
];
export const brandCollections = [
  {slug:'seiko', name:'Seiko', heading:'Discover Seiko.', description:'Explore Seiko watches in the Soora & Co. collection.', image:'/images/steel.png'},
  {slug:'casio', name:'Casio', heading:'Discover Casio.', description:'Explore Casio watches in the Soora & Co. collection.', image:'/images/digital.png'},
  {slug:'citizen', name:'Citizen', heading:'Discover Citizen.', description:'Explore Citizen watches in the Soora & Co. collection.', image:'/images/dress.png'},
  {slug:'tissot', name:'Tissot', heading:'Discover Tissot.', description:'Explore Tissot watches in the Soora & Co. collection.', image:'/images/leather.png'},
];
export const brandPath = (name: string) => '/brands/' + brandSlug(name) + '/';
export const categoryPath = (name: string) => '/watches/' + name.toLowerCase() + '/';
