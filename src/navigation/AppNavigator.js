/**
 * Bar Inventory app navigation: Bottom Tabs (Areas, Purchase prices, Reports)
 * with nested Stack for Areas → ProductList → AddProduct → InventoryMode.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, Icons } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';
import AreasScreen from '../screens/AreasScreen';
import ProductListScreen from '../screens/ProductListScreen';
import AddProductScreen from '../screens/AddProductScreen';
import AddNewProductScreen from '../screens/AddNewProductScreen';
import PurchasePriceScreen from '../screens/PurchasePriceScreen';
import InventoryModeScreen from '../screens/InventoryModeScreen';
import ReportsScreen from '../screens/ReportsScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AreasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Areas" component={AreasScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="AddNewProduct" component={AddNewProductScreen} />
      <Stack.Screen name="InventoryMode" component={InventoryModeScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryBlue,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Areas"
        component={AreasStack}
        options={{
          tabBarLabel: t('tabAreas'),
          tabBarIcon: ({ color, size }) => (
            <Icon name={Icons.description} size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EKPreise"
        component={PurchasePriceScreen}
        options={{
          tabBarLabel: t('tabPurchasePrices'),
          tabBarIcon: ({ color, size }) => (
            <Icon name={Icons.euro} size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ErgebnisListen"
        component={ReportsScreen}
        options={{
          tabBarLabel: t('tabReports'),
          tabBarIcon: ({ color, size }) => (
            <Icon name={Icons.barChart} size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return <TabNavigator />;
}
