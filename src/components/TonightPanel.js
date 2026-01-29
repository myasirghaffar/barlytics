import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { saveTonightSession, resetSession } from '../services/api';
import { colors } from '../styles/globalStyles';
import ThemedConfirmModal from './ThemedConfirmModal';

function TonightPanel({ players, tonightPlayerIds, onSessionUpdate }) {
  const safeTonightPlayerIds = Array.isArray(tonightPlayerIds) ? tonightPlayerIds : [];
  const tonightPlayers = players.filter(p => safeTonightPlayerIds.includes(p.id));
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleRemoveFromTonight = async playerId => {
    const newTonightIds = safeTonightPlayerIds.filter(id => id !== playerId);

    try {
      setBusy(true);
      await saveTonightSession(newTonightIds);
      await onSessionUpdate?.();
    } catch (err) {
      console.error('Error removing player from tonight:', err);
      await onSessionUpdate?.();
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => setConfirmResetOpen(true);

  const confirmReset = async () => {
    if (busy) return;
    try {
      setBusy(true);
      await resetSession();
      await onSessionUpdate?.();
      setConfirmResetOpen(false);
    } catch (err) {
      console.error('Error resetting session:', err);
      await onSessionUpdate?.();
      setConfirmResetOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.panel}>
      <ThemedConfirmModal
        visible={confirmResetOpen}
        title="Reset Tonight"
        message="Reset tonight's session? This will clear all selected players."
        confirmText="RESET"
        cancelText="CANCEL"
        tone="danger"
        loading={busy}
        onCancel={() => (busy ? null : setConfirmResetOpen(false))}
        onConfirm={confirmReset}
      />
      <ThemedConfirmModal
        visible={!!removeTargetId}
        title="Remove Player"
        message="Remove this player from tonight?"
        confirmText="REMOVE"
        cancelText="CANCEL"
        tone="danger"
        loading={busy}
        onCancel={() => (busy ? null : setRemoveTargetId(null))}
        onConfirm={async () => {
          const id = removeTargetId;
          if (!id) return;
          await handleRemoveFromTonight(id);
          setRemoveTargetId(null);
        }}
      />
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Tonight's Players</Text>
        {safeTonightPlayerIds.length > 0 && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Tonight</Text>
          </TouchableOpacity>
        )}
      </View>

      {tonightPlayers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No players selected for tonight. Use "+ Tonight" in the Players section to select
            players.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.tonightList}>
            {tonightPlayers.map(player => (
              <View key={player.id} style={styles.tonightPlayerItem}>
                <Text style={styles.playerName}>{player.name}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setRemoveTargetId(player.id)}
                  disabled={busy}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryBold}>{tonightPlayers.length}</Text> player
              {tonightPlayers.length !== 1 ? 's' : ''} selected for tonight
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  resetButton: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "rgba(255,90,82,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  tonightList: {
    gap: 10,
  },
  tonightPlayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 8,
    marginBottom: 0,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: colors.success,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "rgba(255,90,82,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
  },
  summaryBold: {
    fontWeight: 'bold',
    color: colors.success,
  },
});

export default TonightPanel;

