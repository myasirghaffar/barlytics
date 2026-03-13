/**
 * Global inventory state: products, categories, current category, offline preference, and DB/API helpers.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_BACKEND_API } from '../config/useApi';
import * as DB from '../database/inventoryDB';
import * as API from '../api/inventoryApi';
import { useAuth } from './AuthContext';

const OFFLINE_STORAGE_KEY = '@barlytics_offline_download';

const dataSource = USE_BACKEND_API ? API : DB;

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategoryId, setCurrentCategoryId] = useState(USE_BACKEND_API ? null : 1);
  const [currentCategoryName, setCurrentCategoryName] = useState(USE_BACKEND_API ? '' : 'Cocktailstation');
  const [dbReady, setDbReady] = useState(false);
  const [offlineDownloadEnabled, setOfflineDownloadEnabledState] = useState(false);

  const loadDB = useCallback(async () => {
    try {
      if (dataSource.initDB) await dataSource.initDB();
      setDbReady(true);
    } catch (e) {
      console.error('Data source init failed', e);
      setDbReady(false);
    }
  }, []);

  useEffect(() => {
    loadDB();
  }, [loadDB]);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(OFFLINE_STORAGE_KEY)
      .then((stored) => {
        if (mounted) setOfflineDownloadEnabledState(stored === 'true');
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const setOfflineDownloadEnabled = useCallback((value) => {
    setOfflineDownloadEnabledState(value);
    AsyncStorage.setItem(OFFLINE_STORAGE_KEY, value ? 'true' : 'false').catch(() => {});
  }, []);

  const refreshCategories = useCallback(async () => {
    if (!dbReady) return;
    if (USE_BACKEND_API && !isAuthenticated) return;
    try {
      const list = await dataSource.getCategories();
      setCategories(list);
      if (list.length && !list.find((c) => c.id === currentCategoryId)) {
        setCurrentCategoryId(list[0].id);
        setCurrentCategoryName(list[0].name);
      } else {
        const current = list.find((c) => c.id === currentCategoryId);
        if (current) setCurrentCategoryName(current.name);
      }
    } catch (e) {
      console.warn('refreshCategories failed:', e?.message);
    }
  }, [dbReady, currentCategoryId, isAuthenticated]);

  const updateCategory = useCallback(
    async (id, name) => {
      await dataSource.updateCategory(id, name);
      await refreshCategories();
    },
    [refreshCategories]
  );

  const deleteCategory = useCallback(
    async (id) => {
      await dataSource.deleteCategory(id);
      await refreshCategories();
    },
    [refreshCategories]
  );

  const addCategory = useCallback(
    async (name) => {
      const id = await dataSource.addCategory(name || '');
      await refreshCategories();
      return id;
    },
    [refreshCategories]
  );

  const refreshProducts = useCallback(async () => {
    if (!dbReady) return;
    if (USE_BACKEND_API && currentCategoryId == null) return;
    if (USE_BACKEND_API && !isAuthenticated) return;
    try {
      const list = await dataSource.getProducts(currentCategoryId);
      setProducts(list);
    } catch (e) {
      console.warn('refreshProducts failed:', e?.message);
    }
  }, [dbReady, currentCategoryId, isAuthenticated]);

  useEffect(() => {
    if (dbReady) {
      refreshCategories();
    }
  }, [dbReady, refreshCategories]);

  useEffect(() => {
    if (dbReady) {
      refreshProducts();
    }
  }, [dbReady, currentCategoryId, refreshProducts]);

  const addProduct = useCallback(
    async (product) => {
      const categoryId = product.categoryId ?? currentCategoryId;
      const id = await dataSource.addProduct({ ...product, categoryId });
      if (categoryId !== currentCategoryId) {
        setCurrentCategoryId(categoryId);
        const cat = categories.find((c) => c.id === categoryId);
        if (cat) setCurrentCategoryName(cat.name);
        const list = await dataSource.getProducts(categoryId);
        setProducts(list);
      } else {
        await refreshProducts();
      }
      return id;
    },
    [currentCategoryId, refreshProducts, categories]
  );

  const addProducts = useCallback(
    async (items) => {
      await dataSource.addProducts(items, currentCategoryId);
      await refreshProducts();
    },
    [currentCategoryId, refreshProducts]
  );

  const updateProduct = useCallback(
    async (id, updates) => {
      await dataSource.updateProduct(id, updates);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const updateFillLevel = useCallback(
    async (id, fillLevel) => {
      await dataSource.updateProductFillLevel(id, fillLevel);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const updatePrice = useCallback(
    async (id, price) => {
      await dataSource.updateProductPrice(id, price);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      await dataSource.deleteProduct(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const searchProducts = useCallback(
    async (query) => {
      if (!dbReady) return [];
      return dataSource.searchProducts(query, currentCategoryId);
    },
    [dbReady, currentCategoryId]
  );

  const getAllProductsForPriceScreen = useCallback(async () => {
    if (!dbReady) return [];
    return dataSource.getProducts();
  }, [dbReady]);

  const getReportStats = useCallback(
    async (categoryId = undefined) => {
      if (!dbReady) return { totalBottles: 0, totalValue: 0, lowStock: 0, products: [] };
      if (USE_BACKEND_API && !isAuthenticated) return { totalBottles: 0, totalValue: 0, lowStock: 0, products: [] };
      try {
        const id = categoryId === undefined ? currentCategoryId : categoryId;
        return await dataSource.getReportStats(id);
      } catch (e) {
        console.warn('getReportStats failed:', e?.message);
        return { totalBottles: 0, totalValue: 0, lowStock: 0, products: [] };
      }
    },
    [dbReady, currentCategoryId, isAuthenticated]
  );

  const getSessions = useCallback(async () => {
    if (!dbReady) return [];
    return dataSource.getInventorySessions();
  }, [dbReady]);

  const value = {
    dbReady,
    products,
    categories,
    currentCategoryId,
    currentCategoryName,
    setCurrentCategoryId,
    setCurrentCategoryName,
    offlineDownloadEnabled,
    setOfflineDownloadEnabled,
    refreshProducts,
    refreshCategories,
    updateCategory,
    deleteCategory,
    addCategory,
    addProduct,
    addProducts,
    updateProduct,
    updateFillLevel,
    updatePrice,
    deleteProduct,
    searchProducts,
    getAllProductsForPriceScreen,
    getReportStats,
    getSessions,
    getProductById: dataSource.getProductById,
    getProductsWithFillLevels: (categoryId) => dataSource.getProductsWithFillLevels(categoryId || currentCategoryId),
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
