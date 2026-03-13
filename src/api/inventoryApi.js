/**
 * Inventory API client - mirrors inventoryDB interface for backend integration.
 * In dev mode: uses local URL first; falls back to live URL if local is unavailable.
 */
import axios from 'axios';
import RNFS from 'react-native-fs';
import {
  getApiFullUrl,
  switchToLiveUrl,
  isUsingLiveUrl,
} from '../config/api';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

const api = axios.create({
  baseURL: getApiFullUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiFullUrl();
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

function isNetworkError(err) {
  if (err.response) return false;
  const code = err.code || err.message || '';
  return (
    code === 'ECONNREFUSED' ||
    code === 'ERR_NETWORK' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    String(code).includes('Network Error')
  );
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config || {};
    if (
      __DEV__ &&
      !isUsingLiveUrl() &&
      isNetworkError(err) &&
      !config._retriedWithLive
    ) {
      config._retriedWithLive = true;
      switchToLiveUrl();
      api.defaults.baseURL = getApiFullUrl();
      try {
        return await api.request(config);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }
    const msg = err.response?.data?.message || err.message || 'Network error';
    const status = err.response?.status;
    const fullUrl =
      config?.baseURL && config?.url
        ? `${config.baseURL.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}`
        : config?.url;
    const enhanced = new Error(msg);
    if (status === 404) {
      enhanced.message = msg.includes('Route')
        ? `${msg} (${config?.method?.toUpperCase()} ${fullUrl})`
        : msg;
    }
    return Promise.reject(enhanced);
  }
);

async function handleResponse(res) {
  const data = res.data;
  if (data && data.success === false) {
    throw new Error(data.message || 'API error');
  }
  return data?.data ?? data;
}

async function imageToBase64(uri) {
  if (!uri || typeof uri !== 'string') return '';
  if (uri.startsWith('data:image')) return uri; // Already base64
  if (!uri.startsWith('file://') && !uri.startsWith('/')) return uri; // URL

  try {
    const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
    const base64 = await RNFS.readFile(path, 'base64');
    const ext = path.split('.').pop().toLowerCase() || 'jpeg';
    return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
  } catch (e) {
    console.warn('Failed to convert image to base64:', e.message);
    return uri;
  }
}

export async function initDB() {
  return true;
}

// Categories (Formerly Areas)
export async function getCategories() {
  try {
    const data = await handleResponse(await api.get('categories'));
    const list = Array.isArray(data) ? data : [];
    return list.map(c => ({ ...c, id: c._id || c.id }));
  } catch (e) {
    if (e?.message) throw e;
    throw new Error('Failed to load categories');
  }
}

export async function addCategory(name) {
  try {
    const data = await handleResponse(await api.post('categories', { name }));
    return data?.id ?? data?._id;
  } catch (e) {
    throw new Error(e?.message || 'Failed to add category');
  }
}

export async function updateCategory(id, name) {
  await api.put(`categories/${id}`, { name });
}

export async function deleteCategory(id) {
  await api.delete(`categories/${id}`);
}

// Sub-Categories (Formerly Categories)
export async function getSubCategories() {
  const data = await handleResponse(await api.get('sub-categories'));
  return Array.isArray(data) ? data : [];
}

// Products
export async function getProducts(categoryId = null) {
  const params = categoryId ? { categoryId } : {};
  const data = await handleResponse(await api.get('products', { params }));
  const list = Array.isArray(data) ? data : [];
  return list.map(p => ({
    ...p,
    id: p._id || p.id,
    volume: p.volume || p.unitSize,
    image: p.image || p.imageURL,
    categoryId: p.categoryId,
  }));
}

export async function getProductById(id) {
  const data = await handleResponse(await api.get(`products/${id}`));
  return data || null;
}

export async function addProduct(product) {
  const image = await imageToBase64(product.image);
  const payload = {
    categoryId: product.categoryId,
    name: String(product.name || '').trim(),
    volume: Math.max(0, Number(product.volume) || 0),
    image: image ?? '',
    price: Math.max(0, Number(product.price) || 0),
    fillLevel: Math.min(100, Math.max(0, Number(product.fillLevel) || 100)),
  };
  if (product.subCategoryId) payload.subCategoryId = product.subCategoryId;
  if (product.subCategory) payload.subCategory = product.subCategory;

  const data = await handleResponse(await api.post('products', payload));
  return data?.id ?? data?._id;
}

export async function addProducts(products, categoryId) {
  for (const p of products) {
    await addProduct({ ...p, categoryId });
  }
}

export async function updateProduct(id, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.volume !== undefined) payload.volume = updates.volume;
  if (updates.image !== undefined) {
    payload.image = await imageToBase64(updates.image);
  }
  if (updates.categoryId !== undefined) payload.categoryId = updates.categoryId;
  if (updates.subCategoryId !== undefined) payload.subCategoryId = updates.subCategoryId;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.fillLevel !== undefined) payload.fillLevel = updates.fillLevel;
  
  if (Object.keys(payload).length === 0) return;
  await api.put(`products/${id}`, payload);
}

export async function updateProductFillLevel(id, fillLevel) {
  await api.patch(`products/${id}/fillLevel`, { fillLevel: Math.round(fillLevel) });
}

export async function updateProductPrice(id, price) {
  await api.patch(`products/${id}/price`, { price });
}

export async function deleteProduct(id) {
  await api.delete(`products/${id}`);
}

export async function searchProducts(query, categoryId = null) {
  const params = { q: (query || '').trim() };
  if (categoryId) params.categoryId = categoryId;
  const data = await handleResponse(await api.get('products/search', { params }));
  const list = Array.isArray(data) ? data : [];
  return list.map(p => ({
    ...p,
    id: p._id || p.id,
    volume: p.volume || p.unitSize,
    image: p.image || p.imageURL,
    categoryId: p.categoryId,
  }));
}

export async function createInventorySession(categoryId, categoryName, team = '') {
  const data = await handleResponse(
    await api.post('inventory', {
      categoryId,
      categoryName: categoryName || '',
      team: team || '',
      items: [],
    })
  );
  return data?.id ?? data?._id;
}

export async function getInventorySessions(limit = 50) {
  const data = await handleResponse(
    await api.get('inventory', { params: { limit } })
  );
  return Array.isArray(data) ? data : [];
}

export async function getProductsWithFillLevels(categoryId) {
  const data = await handleResponse(
    await api.get('products', { params: { categoryId } })
  );
  return Array.isArray(data) ? data : [];
}

export async function getReportStats(categoryId = null) {
  const params = categoryId ? { categoryId } : {};
  const data = await handleResponse(
    await api.get('inventory/report', { params })
  );
  return {
    totalBottles: data?.totalBottles ?? 0,
    totalValue: data?.totalValue ?? 0,
    lowStock: data?.lowStock ?? 0,
    products: (data?.products ?? []).map(p => ({
      ...p,
      id: p._id || p.id,
      volume: p.volume || p.unitSize,
      image: p.image || p.imageURL,
      categoryId: p.categoryId,
    })),
  };
}

export const db = null;
