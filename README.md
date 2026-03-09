# Barbrain – Bar Inventory Management App

Mobile bar inventory app for quick stock counting, product management, and reports. Offline-first with SQLite, clean UI, and support for multiple areas (stations).

### Features

- **Areas**: Manage bar areas/stations; tap an area to see its products.
- **Products**: Add from catalog or create new (name, volume, category, price, image).
- **Inventory mode**: Adjust bottle fill levels with a slider; track full vs partial bottles.
- **Purchase prices**: Set and edit purchase price (€) per product.
- **Reports**: View total bottles, stock value, low stock; export PDF/Excel.
- **Language**: English (primary) and German; switcher in the header.

---

## Project Structure

- **`src/App.js`**: App entry, splash, navigation container.
- **`src/screens/`**
  - `AreasScreen` – List of areas, language switcher, search.
  - `ProductListScreen` – Products in the current area; add from catalog or new.
  - `AddProductScreen` – Catalog search and “Add new product” entry.
  - `AddNewProductScreen` – Form to add a product (name, volume, category, price, image).
  - `InventoryModeScreen` – Count/inventory with bottle fill sliders.
  - `PurchasePriceScreen` – Edit purchase prices.
  - `ReportsScreen` – Totals and export.
- **`src/components/`** – SearchBar, ProductItem, BottleFillSlider, FloatingAddButton, etc.
- **`src/context/`** – InventoryContext, LanguageContext.
- **`src/database/`** – SQLite init and product/area operations.
- **`src/i18n/`** – Translations (en/de).
- **`src/theme/`** – Colors, spacing, shadows.

---

## Requirements

- Node.js **20+**
- React Native CLI: Xcode + iOS Simulator (macOS), Android Studio + SDK/emulator

---

## Setup & Running

```bash
npm install
```

**Android:** `npm run android`  
**iOS:** `cd ios && pod install && cd ..` then `npm run ios`

Metro: `npm start` (in a separate terminal if needed).

---

## Building

- **Android:** `cd android && ./gradlew assembleDebug` → `app/build/outputs/apk/debug/app-debug.apk`
- **iOS:** Open `ios/Barbrain.xcworkspace` in Xcode → Product → Archive for release/TestFlight.

---

## Renaming the project folder (optional)

The app and npm package are already named **Barbrain**. If your project folder is still `oche-app` and you want the IDE (e.g. Cursor) to show **Barbrain** or **barbrain-app**:

1. **Close** this project in Cursor/VS Code.
2. In Terminal, from the **parent** of the project (e.g. `Documents/React-Native/`), run:
   ```bash
   mv oche-app barbrain-app
   ```
3. **Reopen** the project by opening the folder `barbrain-app` (File → Open Folder).
4. Run `npm run android` or `npm run ios` once so generated config (e.g. autolinking) picks up the new path.

---

App name and display: **Barbrain**.  
Bundle/package identifiers (e.g. `com.oche`) are unchanged for stability.
