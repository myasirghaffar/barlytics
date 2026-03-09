# Icons

Central icon definitions for the Bar Inventory app. Uses **MaterialIcons** from `react-native-vector-icons`. The font must be linked for icons to display (not show as □ or X).

- **Android:** `android/app/build.gradle` applies `react-native-vector-icons/fonts.gradle` so `MaterialIcons.ttf` is copied at build time.
- **iOS:** `MaterialIcons.ttf` is in `ios/Barbrain/Fonts/` and added to the Xcode project; `Info.plist` has `UIAppFonts` → `MaterialIcons.ttf`.

## Usage

```js
import { Icon, Icons, AREA_ICONS } from '../assets/icons';

// Use the Icon component with a constant
<Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />

// Area list icons (localBar, restaurant, warehouse, etc.)
<Icon name={AREA_ICONS[index]} size={24} color={colors.white} />
```

## Adding new icons

1. Add the MaterialIcons name to the `Icons` object in `index.js`.
2. Use `Icons.yourName` in your component.

Icon set: **MaterialIcons** from `react-native-vector-icons`.  
Browse names: [Material Icons](https://fonts.google.com/icons?selected=Material+Icons)
