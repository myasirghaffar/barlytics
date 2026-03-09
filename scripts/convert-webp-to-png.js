/**
 * One-time script: convert .webp bottle images in src/assets/images to .png
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '..', 'src', 'assets', 'images');

const webpFiles = [
  'Botran-18-Anejo-Rum.webp',
  "Angostura-Premium-Rum-Reserva'.webp",
];

async function convert() {
  for (const file of webpFiles) {
    const src = path.join(imagesDir, file);
    const base = file.replace(/\.webp$/i, '').replace(/'/g, '');
    const dest = path.join(imagesDir, `${base}.png`);
    if (!fs.existsSync(src)) {
      console.warn('Skip (not found):', src);
      continue;
    }
    await sharp(src)
      .png()
      .toFile(dest);
    console.log('Converted:', file, '->', `${base}.png`);
  }
}

convert().catch((err) => {
  console.error(err);
  process.exit(1);
});
