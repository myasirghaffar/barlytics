/**
 * Global inventory state: products, areas, current station, and DB helpers.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as DB from '../database/inventoryDB';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [currentAreaId, setCurrentAreaId] = useState(1);
  const [currentAreaName, setCurrentAreaName] = useState('Cocktailstation');
  const [dbReady, setDbReady] = useState(false);

  const loadDB = useCallback(async () => {
    try {
      await DB.initDB();
      setDbReady(true);
    } catch (e) {
      console.error('DB init failed', e);
      setDbReady(false);
    }
  }, []);

  useEffect(() => {
    loadDB();
  }, [loadDB]);

  const refreshAreas = useCallback(async () => {
    if (!dbReady) return;
    const list = await DB.getAreas();
    setAreas(list);
    if (list.length && !list.find((a) => a.id === currentAreaId)) {
      setCurrentAreaId(list[0].id);
      setCurrentAreaName(list[0].name);
    }
  }, [dbReady, currentAreaId]);

  const refreshProducts = useCallback(async () => {
    if (!dbReady) return;
    const list = await DB.getProducts(currentAreaId);
    setProducts(list);
  }, [dbReady, currentAreaId]);

  useEffect(() => {
    if (dbReady) {
      refreshAreas();
    }
  }, [dbReady, refreshAreas]);

  useEffect(() => {
    if (dbReady) {
      refreshProducts();
    }
  }, [dbReady, currentAreaId, refreshProducts]);

  const addProduct = useCallback(
    async (product) => {
      const id = await DB.addProduct({ ...product, areaId: currentAreaId });
      await refreshProducts();
      return id;
    },
    [currentAreaId, refreshProducts]
  );

  const addProducts = useCallback(
    async (items) => {
      await DB.addProducts(items, currentAreaId);
      await refreshProducts();
    },
    [currentAreaId, refreshProducts]
  );

  const updateProduct = useCallback(
    async (id, updates) => {
      await DB.updateProduct(id, updates);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const updateFillLevel = useCallback(
    async (id, fillLevel) => {
      await DB.updateProductFillLevel(id, fillLevel);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const updatePrice = useCallback(
    async (id, price) => {
      await DB.updateProductPrice(id, price);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      await DB.deleteProduct(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const searchProducts = useCallback(
    async (query) => {
      if (!dbReady) return [];
      return DB.searchProducts(query, currentAreaId);
    },
    [dbReady, currentAreaId]
  );

  const getAllProductsForPriceScreen = useCallback(async () => {
    if (!dbReady) return [];
    return DB.getProducts();
  }, [dbReady]);

  const getReportStats = useCallback(
    async (areaId = null) => {
      if (!dbReady) return { totalBottles: 0, totalValue: 0, lowStock: 0, products: [] };
      return DB.getReportStats(areaId ?? currentAreaId);
    },
    [dbReady, currentAreaId]
  );

  const getSessions = useCallback(async () => {
    if (!dbReady) return [];
    return DB.getInventorySessions();
  }, [dbReady]);

  const value = {
    dbReady,
    products,
    areas,
    currentAreaId,
    currentAreaName,
    setCurrentAreaId,
    setCurrentAreaName,
    refreshProducts,
    refreshAreas,
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
    getProductById: DB.getProductById,
    getProductsWithFillLevels: (areaId) => DB.getProductsWithFillLevels(areaId || currentAreaId),
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
