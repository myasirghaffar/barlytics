import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { updatePlayer, deletePlayer, saveTonightSession } from '../services/api';
import AddPlayerForm from './AddPlayerForm';
import PlayerItem from './PlayerItem';
import { colors } from '../styles/globalStyles';
import ThemedConfirmModal from './ThemedConfirmModal';

function PlayersPanel({ players, tonightPlayerIds, onPlayersUpdate, onSessionUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const safeTonightPlayerIds = Array.isArray(tonightPlayerIds) ? tonightPlayerIds : [];

  const handlePlayerAdded = async () => {
    await onPlayersUpdate?.();
  };

  const handleToggleTonight = async playerId => {
    if (saving) return;

    const isSelected = safeTonightPlayerIds.includes(playerId);
    const newTonightIds = isSelected
      ? safeTonightPlayerIds.filter(id => id !== playerId)
      : [...safeTonightPlayerIds, playerId];

    setSaving(true);
    try {
      await saveTonightSession(newTonightIds);
      await onSessionUpdate?.();
    } catch (err) {
      console.error('Error updating tonight selection:', err);
      await onSessionUpdate?.();
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = player => {
    setEditingId(player.id);
    setEditName(player.name);
    setError(null);
  };

  const handleEditSubmit = async playerId => {
    if (!editName.trim()) {
      setError('Player name is required');
      return;
    }

    const normalizedName = editName.trim().toLowerCase();
    const isDuplicate = players.some(
      p => p.name.toLowerCase() === normalizedName && p.id !== playerId,
    );
    if (isDuplicate) {
      setError(`Player name "${editName.trim()}" already exists`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updatePlayer(playerId, editName.trim());
      setEditingId(null);
      setEditName('');
      await onPlayersUpdate?.();
    } catch (err) {
      const message = err?.message || 'Failed to update player';
      if (message.includes('already exists') || message.includes('409')) {
        setError(`Player name "${editName.trim()}" already exists`);
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setError(null);
  };

  const handleDelete = playerId => {
    setDeleteTargetId(playerId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId || saving) return;
    setSaving(true);
    try {
      await deletePlayer(deleteTargetId);
      await onPlayersUpdate?.();
      await onSessionUpdate?.();
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Error deleting player:', err);
      await onPlayersUpdate?.();
      await onSessionUpdate?.();
      setDeleteTargetId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.panel}>
      <ThemedConfirmModal
        visible={!!deleteTargetId}
        title="Delete Player"
        message="Are you sure you want to delete this player?"
        confirmText="DELETE"
        cancelText="CANCEL"
        tone="danger"
        loading={saving}
        onCancel={() => (saving ? null : setDeleteTargetId(null))}
        onConfirm={confirmDelete}
      />
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Players</Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <AddPlayerForm onPlayerAdded={handlePlayerAdded} players={players} />

      {players.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No players yet. Add your first player above!</Text>
        </View>
      ) : (
        <View style={styles.playersList}>
          {players.map(player => {
            const isSelectedForTonight = safeTonightPlayerIds.includes(player.id);
            const isEditing = editingId === player.id;

            return (
              <PlayerItem
                key={player.id}
                player={player}
                isSelectedForTonight={isSelectedForTonight}
                isEditing={isEditing}
                editName={isEditing ? editName : ''}
                onEditNameChange={text => {
                  setEditName(text);
                  if (error) setError(null);
                }}
                onToggleTonight={() => handleToggleTonight(player.id)}
                onEditClick={() => handleEditClick(player)}
                onEditSubmit={() => handleEditSubmit(player.id)}
                onCancelEdit={handleCancelEdit}
                onDelete={() => handleDelete(player.id)}
                disabled={saving}
              />
            );
          })}
        </View>
      )}

      {saving && (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
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
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  playersList: {
    marginTop: 8,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  savingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default PlayersPanel;

