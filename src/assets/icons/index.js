/**
 * Central icon definitions for Bar Inventory app.
 * Uses MaterialIcons from react-native-vector-icons.
 * Import: import { Icon, Icons } from '../assets/icons';
 */
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Re-export Icon component (MaterialIcons)
export const Icon = MaterialIcons;

/**
 * Icon name constants – use these for consistency and easy refactoring.
 */
export const Icons = {
  // Navigation & actions
  arrowBack: 'arrow-back',
  add: 'add',
  addCircleOutline: 'add-circle-outline',
  close: 'close',
  check: 'check',
  edit: 'edit',
  settings: 'settings',
  helpOutline: 'help-outline',
  remove: 'remove',

  // Search & content
  search: 'search',
  searchOff: 'search-off',

  // Areas & layout
  store: 'store',
  folderOpen: 'folder-open',
  description: 'description',
  viewList: 'view-list',
  viewModule: 'view-module',

  // Bar / products
  localBar: 'local-bar',
  restaurant: 'restaurant',
  warehouse: 'warehouse',

  // Tabs & reports
  euro: 'euro',
  barChart: 'bar-chart',
  assessment: 'assessment',
  inventory2: 'inventory-2',
  warning: 'warning',
  history: 'history',

  // Purchase & export
  attachMoney: 'attach-money',
  pictureAsPdf: 'picture-as-pdf',
  tableChart: 'table-chart',
  cropSquare: 'crop-square',
  list: 'list',

  // Offline & misc
  offlinePin: 'offline-pin',
  playArrow: 'play-arrow',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',
  keyboardArrowDown: 'keyboard-arrow-down',
};

/** Area list icon names (by index) */
export const AREA_ICONS = [
  Icons.localBar,
  Icons.restaurant,
  Icons.warehouse,
  Icons.viewModule,
  Icons.viewModule,
];

export default Icon;
