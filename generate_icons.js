import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgBuffer = readFileSync('public/favicon.svg');

async function generate() {
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .toFile('public/pwa-192x192.png');
    
  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .toFile('public/pwa-512x512.png');
    
  // maskable 512x512
  await sharp(svgBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } }) // match theme color slate-900
    .toFile('public/pwa-512x512-maskable.png');
    
  console.log('Icons generated successfully.');
}

generate().catch(console.error);
