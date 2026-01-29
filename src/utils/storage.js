import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  PLAYERS: 'cachedPlayers',
  TONIGHT_IDS: 'cachedTonightIds',
};

export async function cachePlayers(players) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.PLAYERS, JSON.stringify(players));
  } catch (error) {
    console.warn('Failed to cache players:', error);
  }
}

export async function getCachedPlayers() {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.PLAYERS);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to get cached players:', error);
    return null;
  }
}

export async function cacheTonightIds(tonightPlayerIds) {
  try {
    await AsyncStorage.setItem(
      CACHE_KEYS.TONIGHT_IDS,
      JSON.stringify(tonightPlayerIds),
    );
  } catch (error) {
    console.warn('Failed to cache tonight IDs:', error);
  }
}

export async function getCachedTonightIds() {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.TONIGHT_IDS);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to get cached tonight IDs:', error);
    return null;
  }
}

export async function clearCache() {
  try {
    await AsyncStorage.multiRemove([CACHE_KEYS.PLAYERS, CACHE_KEYS.TONIGHT_IDS]);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

