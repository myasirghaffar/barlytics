/**
 * Bar Inventory app navigation: Bottom Tabs (Areas, Purchase prices, Reports)
 * with nested Stack for Areas → ProductList → AddProduct → InventoryMode.
 */
import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Icons } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';
import AreasScreen from '../screens/AreasScreen';
import ProductListScreen from '../screens/ProductListScreen';
import AddProductScreen from '../screens/AddProductScreen';
import AddNewProductScreen from '../screens/AddNewProductScreen';
import PurchasePriceScreen from '../screens/PurchasePriceScreen';
import InventoryModeScreen from '../screens/InventoryModeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import EditProductScreen from '../screens/EditProductScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 24;

function AreasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Areas" component={AreasScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="AddNewProduct" component={AddNewProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen name="InventoryMode" component={InventoryModeScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryBlue,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : 8,
          minHeight: 70,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarLabelPosition: 'below-icon',
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Areas"
        component={AreasStack}
        options={{
          tabBarLabel: t('tabAreas'),
          tabBarIcon: ({ color }) => (
            <Icon name={Icons.description} size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EKPreise"
        component={PurchasePriceScreen}
        options={{
          tabBarLabel: t('tabPurchasePrices'),
          tabBarIcon: ({ color }) => (
            <Icon name={Icons.euro} size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ErgebnisListen"
        component={ReportsScreen}
        options={{
          tabBarLabel: t('tabReports'),
          tabBarIcon: ({ color }) => (
            <Icon name={Icons.barChart} size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return <TabNavigator />;
}
