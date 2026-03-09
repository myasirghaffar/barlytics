# Images

## Bottle images

- **`bottleImages.js`** – Maps product names to local PNG assets via `require()`. All bottle images live in this folder.
- **Adding a new bottle:** Add a PNG file (e.g. `MySpirit.png`), then in `bottleImages.js` add a `require('./MySpirit.png')` and map the product name to it.
- **Non-PNG assets:** To convert WebP (or other formats) to PNG, run from project root:  
  `node scripts/convert-webp-to-png.js`  
  (Edit the script to include the file names to convert.)

## Other assets

- `logo.png`, `splash_logo.png` – app branding.
