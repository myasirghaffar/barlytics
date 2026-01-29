import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayersPanel from './components/PlayersPanel';
import TonightPanel from './components/TonightPanel';
import { colors } from './styles/globalStyles';
import { getPlayers, getTonightSession } from './services/api';
import {
  cachePlayers,
  cacheTonightIds,
  getCachedPlayers,
  getCachedTonightIds,
} from './utils/storage';

function App() {
  const [players, setPlayers] = useState([]);
  const [tonightPlayerIds, setTonightPlayerIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from cache first (offline support)
      const cachedPlayers = await getCachedPlayers();
      const cachedTonightIds = await getCachedTonightIds();

      if (cachedPlayers) setPlayers(cachedPlayers);
      if (cachedTonightIds) setTonightPlayerIds(cachedTonightIds);

      // Then try to fetch from backend
      try {
        const [playersData, sessionData] = await Promise.all([
          getPlayers(),
          getTonightSession(),
        ]);

        setPlayers(playersData);
        setTonightPlayerIds(sessionData?.tonightPlayerIds || []);

        // Update cache
        await cachePlayers(playersData);
        await cacheTonightIds(sessionData?.tonightPlayerIds || []);
      } catch (apiError) {
        console.warn('Backend unavailable, using cached data:', apiError);
        if (!cachedPlayers) {
          setError('Unable to connect to server. Please check your connection.');
        }
      }
    } catch (err) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refetch from backend after any player operation
  const handlePlayersUpdate = async () => {
    try {
      const playersData = await getPlayers();
      setPlayers(playersData);
      await cachePlayers(playersData);
    } catch (err) {
      console.warn('Failed to refetch players, using cached data:', err);
      const cachedPlayers = await getCachedPlayers();
      if (cachedPlayers) setPlayers(cachedPlayers);
    }
  };

  const handleTonightSessionUpdated = async () => {
    try {
      const sessionData = await getTonightSession();
      const tonightIds = sessionData?.tonightPlayerIds || [];
      setTonightPlayerIds(tonightIds);
      await cacheTonightIds(tonightIds);
    } catch (err) {
      console.warn('Failed to refetch session, using cached data:', err);
      const cachedTonightIds = await getCachedTonightIds();
      if (cachedTonightIds) setTonightPlayerIds(cachedTonightIds);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeTop} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.statusBar}
        translucent={false}
      />
      <View style={styles.app}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>THE OCHE</Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TonightPanel
              players={players}
              tonightPlayerIds={tonightPlayerIds}
              onSessionUpdate={handleTonightSessionUpdated}
            />

            <PlayersPanel
              players={players}
              tonightPlayerIds={tonightPlayerIds}
              onPlayersUpdate={handlePlayersUpdate}
              onSessionUpdate={handleTonightSessionUpdated}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeTop: { flex: 1, backgroundColor: colors.statusBar },
  app: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
  },
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  errorContainer: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "rgba(255,90,82,0.35)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
});

export default App;

