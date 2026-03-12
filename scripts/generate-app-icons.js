/**
 * Generate Android and iOS app icons from barlogo.png.
 * Run: node scripts/generate-app-icons.js
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const logoPath = path.join(root, 'barlogo.png');

// Android: mipmap density → size in px
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// iOS: filename (without path) → size in px
const iosSizes = {
  'icon-20.png': 20,
  'icon-29.png': 29,
  'icon-40.png': 40,
  'icon-58.png': 58,
  'icon-60.png': 60,
  'icon-76.png': 76,
  'icon-80.png': 80,
  'icon-87.png': 87,
  'icon-120.png': 120,
  'icon-152.png': 152,
  'icon-167.png': 167,
  'icon-180.png': 180,
  'icon-1024.png': 1024,
};

async function generate() {
  if (!fs.existsSync(logoPath)) {
    throw new Error('Logo not found: ' + logoPath);
  }

  const image = sharp(logoPath);

  async function makeIcon(size) {
    return image.clone().resize(size, size).png().toBuffer();
  }

  // Android
  const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res');
  for (const [folder, size] of Object.entries(androidSizes)) {
    const dir = path.join(androidRes, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const buf = await makeIcon(size);
    const iconPath = path.join(dir, 'ic_launcher.png');
    const roundPath = path.join(dir, 'ic_launcher_round.png');
    fs.writeFileSync(iconPath, buf);
    fs.writeFileSync(roundPath, buf);
    console.log('Android:', folder, size + 'px');
  }

  // iOS
  const iosDir = path.join(root, 'ios', 'Barbrain', 'Images.xcassets', 'AppIcon.appiconset');
  if (!fs.existsSync(iosDir)) fs.mkdirSync(iosDir, { recursive: true });
  for (const [filename, size] of Object.entries(iosSizes)) {
    const buf = await makeIcon(size);
    fs.writeFileSync(path.join(iosDir, filename), buf);
    console.log('iOS:', filename, size + 'px');
  }

  console.log('Done. Barbrain app icons generated from barlogo.png');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
