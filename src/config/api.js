/**
 * API configuration for Barbrain.
 *
 * Development (emulator):
 * - Android emulator: http://10.0.2.2:8000 (localhost from host machine)
 * - iOS simulator: http://localhost:8000
 *
 * Production (APK):
 * - Uses live URL
 *
 * Fallback: In dev mode, if local is unavailable, automatically switches to live URL.
 */
import { Platform } from "react-native";

const API_PREFIX = "/api/v1";

// Local backend URLs for development (emulator)
const LOCAL_ANDROID = "http://10.0.2.2:8000";
const LOCAL_IOS = "http://localhost:8000";

// Live/production API URL - used when building APK or when local backend is unavailable
// 1) Set REACT_APP_LIVE_API_URL env var when building, or
// 2) Uses the default deployed backend URL
const LIVE_API_BASE =
  (typeof process !== "undefined" && process.env?.REACT_APP_LIVE_API_URL) ||
  "https://barlytics-backend.techverseo.com";

/**
 * Active base URL - can switch from local to live on connection failure.
 */
let _activeBase =
  __DEV__ && Platform.OS === "android"
    ? LOCAL_ANDROID
    : __DEV__
    ? LOCAL_IOS
    : LIVE_API_BASE.replace(/\/$/, "");

/**
 * Switch to live URL (used when local is unavailable).
 */
export function switchToLiveUrl() {
  _activeBase = LIVE_API_BASE.replace(/\/$/, "");
  return getApiFullUrl();
}

/**
 * Get current API base URL.
 */
export function getApiBaseUrl() {
  return _activeBase.replace(/\/$/, "");
}

/**
 * Get full API URL (base + prefix).
 */
export function getApiFullUrl() {
  return `${getApiBaseUrl()}${API_PREFIX}`;
}

/**
 * Check if we're using the live URL (vs local).
 */
export function isUsingLiveUrl() {
  return _activeBase !== LOCAL_ANDROID && _activeBase !== LOCAL_IOS;
}

// For backward compatibility - these are used at module load; requests use getApiFullUrl() via interceptor
export const API_BASE_URL = getApiBaseUrl();
export const API_FULL_URL = getApiFullUrl();

export const API_CONFIG = {
  localAndroid: LOCAL_ANDROID,
  localIos: LOCAL_IOS,
  liveUrl: LIVE_API_BASE,
  isDev: __DEV__,
};
