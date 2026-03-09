/**
 * Local bottle images (PNG). All under src/assets/images; non-PNGs were converted to PNG.
 * Product name -> require() for local, or fallback to generic bottle for catalog-only products.
 */

const Campari = require('./Campari.png');
const Aperol = require('./Aperol.png');
const Bacardi8y = require('./Bacardi-8-y.png');
const BelsazarRed = require('./Belsazar-red.png');
const AngosturaPremiumRum = require('./Angostura-Premium-Rum.png');
const AngosturaPremiumRumReserva = require('./Angostura-Premium-Rum-Reserva.png');
const Botran18AnejoRum = require('./Botran-18-Anejo-Rum.png');
const SierraMilenarioReposado = require('./Sierra-Milenario-Reposado.png');

// Fallback for products without a dedicated asset (use generic rum/spirit bottle)
const defaultBottle = AngosturaPremiumRum;

export const BOTTLE_IMAGES = {
  'Campari': Campari,
  'Aperol Aperitivo Italiano': Aperol,
  'Heineken': defaultBottle,
  'Red Bull': defaultBottle,
  'Belsazar Red': BelsazarRed,
  'Sierra Milenario Reposado': SierraMilenarioReposado,
  'Bacardi 8 y': Bacardi8y,
  'Botran 18 Anejo Rum': Botran18AnejoRum,
  'Angostura Premium Rum': AngosturaPremiumRum,
  'Angostura Premium Rum Reserva': AngosturaPremiumRumReserva,
  'Ableforths Rumbullion!': defaultBottle,
  'Ardbeg Drum': defaultBottle,
  'Ayrum Verdejo blanco': defaultBottle,
  'Banks 5 Island Blend Rum': defaultBottle,
};

/**
 * Returns Image source: local require() (number) or { uri } for DB image, or null.
 * RN Image accepts both number (asset) and { uri: string }.
 */
export function getBottleImage(product) {
  if (!product) return null;
  const local = BOTTLE_IMAGES[product.name];
  if (local != null) return local;
  const uri = product.image;
  return uri ? { uri } : null;
}
