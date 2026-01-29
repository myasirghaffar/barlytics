import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { createPlayer } from '../services/api';
import { colors } from '../styles/globalStyles';

function AddPlayerForm({ onPlayerAdded, players = [] }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Player name is required');
      return;
    }

    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = players.some(
      p => (p?.name || '').toLowerCase() === normalizedName,
    );
    if (isDuplicate) {
      setError(`Player name "${name.trim()}" already exists`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPlayer(name.trim());
      setName('');
      onPlayerAdded?.();
    } catch (err) {
      const message = err?.message || 'Failed to add player';
      if (message.includes('already exists') || message.includes('409')) {
        setError(`Player name "${name.trim()}" already exists`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = text => {
    setName(text);
    if (error) setError(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Enter player name"
          value={name}
          onChangeText={handleNameChange}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.textPrimary}
          editable={!loading}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, (!name.trim() || loading) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading || !name.trim()}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Player</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surfaceStrong,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: "rgba(255,90,82,0.55)",
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddPlayerForm;

