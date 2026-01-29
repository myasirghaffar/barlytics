import axios from "axios";
import { Platform } from "react-native";

// Backend API URLs
// - Android emulator must use 10.0.2.2 to reach your host machine
// - iOS simulator can use localhost
// - Real device needs your computer's LAN IP (e.g. http://192.168.1.100:8001)
const LOCAL_BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8001" : "http://localhost:8001";
const PROD_BASE_URL = "https://ocb.senew-tech.com";

// Prefer local for development, but auto-fallback to PROD if local is down.
let preferredBaseURL = LOCAL_BASE_URL;

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

function toUserError(error) {
  if (error?.response) {
    const errorMessage =
      error.response.data?.error ||
      `HTTP error! status: ${error.response.status}`;
    return new Error(errorMessage);
  }
  if (error?.request) {
    return new Error("Network error - please check your connection");
  }
  return new Error(error?.message || "An unexpected error occurred");
}

async function apiCall(endpoint, options = {}) {
  const requestConfig = {
    url: endpoint,
    method: options.method || "GET",
    data: options.body,
    ...options,
  };

  try {
    const response = await api({ ...requestConfig, baseURL: preferredBaseURL });

    if (response.status === 204) {
      return null;
    }

    return response.data;
  } catch (error) {
    // If local backend is off, automatically retry once against production.
    if (error?.request && preferredBaseURL === LOCAL_BASE_URL) {
      try {
        const response = await api({
          ...requestConfig,
          baseURL: PROD_BASE_URL,
        });
        preferredBaseURL = PROD_BASE_URL;

        if (response.status === 204) {
          return null;
        }
        return response.data;
      } catch (fallbackError) {
        throw toUserError(fallbackError);
      }
    }

    throw toUserError(error);
  }
}

// Player API
export async function getPlayers() {
  return apiCall("/players");
}

export async function getPlayerById(id) {
  return apiCall(`/players/${id}`);
}

export async function createPlayer(name) {
  return apiCall("/players", {
    method: "POST",
    body: { name },
  });
}

export async function updatePlayer(id, name) {
  return apiCall(`/players/${id}`, {
    method: "PUT",
    body: { name },
  });
}

export async function deletePlayer(id) {
  return apiCall(`/players/${id}`, {
    method: "DELETE",
  });
}

// Session API
export async function getTonightSession() {
  return apiCall("/session/tonight");
}

export async function saveTonightSession(tonightPlayerIds) {
  if (!Array.isArray(tonightPlayerIds)) {
    throw new Error("tonightPlayerIds must be an array");
  }

  return apiCall("/session/tonight", {
    method: "POST",
    body: { tonightPlayerIds },
  });
}

export async function resetSession() {
  return apiCall("/session/reset", {
    method: "POST",
  });
}
