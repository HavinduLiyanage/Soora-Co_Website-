import sharp from 'sharp';
import {mkdir, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const directory = fileURLToPath(new URL('../public/images/', import.meta.url));
await mkdir(directory + 'optimized', {recursive:true});
let original = 0, delivery = 0;
for (const name of ['hero','steel','dress','digital','leather']) {
  const source = directory + name + '.png';
  original += (await stat(source)).size;
  for (const width of name === 'hero' ? [640,1280,1920] : [320,640,960]) {
    const target = `${directory}optimized/${name}-${width}.webp`;
    await sharp(source).resize({width}).webp({quality:84}).toFile(target);
    if (width === (name === 'hero' ? 1280 : 640)) delivery += (await stat(target)).size;
  }
}
console.log(`Images prepared. Original set: ${original} bytes; medium delivery set: ${delivery} bytes (${Math.round((1-delivery/original)*100)}% smaller).`);
