/**
 * Inventory API client - mirrors inventoryDB interface for backend integration.
 * In dev mode: uses local URL first; falls back to live URL if local is unavailable.
 */
import axios from 'axios';
import RNFS from 'react-native-fs';
import {
  getApiFullUrl,
  getApiBaseUrl,
  switchToLiveUrl,
  isUsingLiveUrl,
} from '../config/api';

/** Make product image URL absolute and use HTTPS so the app can load it (Android/iOS block HTTP). */
function normalizeProductImageUrl(uri) {
  if (!uri || typeof uri !== 'string') return uri || '';
  const t = uri.trim();
  if (t.startsWith('data:')) return t;
  if (t.startsWith('/')) return `${getApiBaseUrl().replace(/\/$/, '')}${t}`;
  if (t.startsWith('http://')) {
    return 'https://' + t.slice(7);
  }
  if (t.startsWith('https://')) return t;
  return t;
}

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

/**
 * Upload a product image file. Returns the public URL to use as product.image.
 * @param {string} uri - Local file URI (file:// or path)
 * @returns {Promise<string>} URL of the uploaded image
 */
export async function uploadProductImage(uri) {
  if (!uri || typeof uri !== 'string') return '';
  if (uri.startsWith('data:image') || uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  const formData = new FormData();
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/webp';
  formData.append('image', {
    uri: uri.startsWith('file://') ? uri : `file://${uri}`,
    type: mime,
    name: `image.${ext}`,
  });

  const data = await handleResponse(await api.post('products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));
  return data?.url ?? '';
}

export async function initDB() {
  return true;
}

// Areas
export async function getAreas() {
  try {
    const data = await handleResponse(await api.get('areas'));
    const list = Array.isArray(data) ? data : [];
    return list.map(a => ({ ...a, id: a._id || a.id }));
  } catch (e) {
    if (e?.message) throw e;
    throw new Error('Failed to load areas');
  }
}

export async function addArea(name) {
  try {
    const data = await handleResponse(await api.post('areas', { name }));
    return data?.id ?? data?._id;
  } catch (e) {
    throw new Error(e?.message || 'Failed to add area');
  }
}

export async function updateArea(id, name) {
  await api.put(`areas/${id}`, { name });
}

export async function deleteArea(id) {
  await api.delete(`areas/${id}`);
}

// Categories (Formerly Sub-Categories)
export async function getCategories() {
  const data = await handleResponse(await api.get('categories'));
  return Array.isArray(data) ? data : [];
}

export async function addCategory(name) {
    const data = await handleResponse(await api.post('categories', { name }));
    return data?.id ?? data?._id;
}

// Products
export async function getProducts(areaId = null) {
  const params = areaId ? { areaId } : {};
  const data = await handleResponse(await api.get('products', { params }));
  const list = Array.isArray(data) ? data : [];
  return list.map(p => ({
    ...p,
    id: p._id || p.id,
    volume: p.volume || p.unitSize,
    image: normalizeProductImageUrl(p.image || p.imageURL),
    areaId: p.areaId,
    categoryId: p.categoryId,
  }));
}

export async function getProductById(id) {
  const data = await handleResponse(await api.get(`products/${id}`));
  if (!data) return null;
  return {
    ...data,
    id: data._id || data.id,
    image: normalizeProductImageUrl(data.image || data.imageURL),
  };
}

export async function addProduct(product) {
  let image = product.image ?? '';
  if (image && (image.startsWith('file://') || (image.startsWith('/') && !image.startsWith('//')))) {
    try {
      const url = await uploadProductImage(image);
      if (url) image = url;
    } catch (_) {
      image = await imageToBase64(image);
    }
  } else if (image && !image.startsWith('data:') && !image.startsWith('http')) {
    image = await imageToBase64(image);
  }

  const payload = {
    areaId: product.areaId || product.categoryId,
    name: String(product.name || '').trim(),
    volume: Math.max(0, Number(product.volume) || 0),
    image: image ?? '',
    price: Math.max(0, Number(product.price) || 0),
    fillLevel: Math.min(100, Math.max(0, Number(product.fillLevel) || 100)),
  };
  if (product.categoryId) payload.categoryId = product.categoryId;
  if (product.category) payload.category = product.category;

  const data = await handleResponse(await api.post('products', payload));
  return data?.id ?? data?._id;
}

export async function addProducts(products, areaId) {
  for (const p of products) {
    await addProduct({ ...p, areaId });
  }
}

export async function updateProduct(id, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.volume !== undefined) payload.volume = updates.volume;
  if (updates.image !== undefined) {
    let img = updates.image;
    if (img && (img.startsWith('file://') || (img.startsWith('/') && !img.startsWith('//')))) {
      try {
        const url = await uploadProductImage(img);
        if (url) img = url;
      } catch (_) {
        img = await imageToBase64(img);
      }
    } else if (img && !img.startsWith('data:') && !img.startsWith('http')) {
      img = await imageToBase64(img);
    }
    payload.image = img ?? '';
  }
  if (updates.areaId !== undefined) payload.areaId = updates.areaId;
  if (updates.categoryId !== undefined) payload.categoryId = updates.categoryId;
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

export async function searchProducts(query, areaId = null) {
  const params = { q: (query || '').trim() };
  if (areaId) params.areaId = areaId;
  const data = await handleResponse(await api.get('products/search', { params }));
  const list = Array.isArray(data) ? data : [];
  return list.map(p => ({
    ...p,
    id: p._id || p.id,
    volume: p.volume || p.unitSize,
    image: normalizeProductImageUrl(p.image || p.imageURL),
    areaId: p.areaId,
    categoryId: p.categoryId,
  }));
}

export async function createInventorySession(areaId, areaName, team = '') {
  const data = await handleResponse(
    await api.post('inventory/sessions', {
      areaId,
      areaName: areaName || '',
      team: team || '',
    })
  );
  return data?.id ?? data?._id;
}

export async function addInventorySessionItems(sessionId, items) {
  await handleResponse(
    await api.post(`inventory/sessions/${sessionId}/items`, { items })
  );
}

export async function getInventorySessions(limit = 50) {
  const data = await handleResponse(
    await api.get('inventory/sessions', { params: { limit } })
  );
  const list = Array.isArray(data) ? data : [];
  return list.map(s => ({
    ...s,
    id: s.id || s._id,
    areaName: s.areaName ?? s.categoryName,
  }));
}

export async function getProductsWithFillLevels(areaId) {
  const data = await handleResponse(
    await api.get('products', { params: { areaId } })
  );
  return Array.isArray(data) ? data : [];
}

export async function getReportStats(areaId = null) {
  const params = areaId ? { areaId } : {};
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
      image: normalizeProductImageUrl(p.image || p.imageURL),
      areaId: p.areaId,
      categoryId: p.categoryId,
    })),
  };
}

export const db = null;
