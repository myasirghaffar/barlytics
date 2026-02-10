import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { colors } from "../styles/globalStyles";
import {
  cachePlayers,
  getCachedPlayers,
  cacheTonightIds,
  getCachedTonightIds,
} from "../utils/storage";
import { EditIcon, RemoveIcon } from "../assets/icons/icons";

function PlayerSelectionScreen({ navigation }) {
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [tonightPlayerIds, setTonightPlayerIds] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Load registered players and tonight's selections on mount
  useEffect(() => {
    const loadData = async () => {
      const cached = await getCachedPlayers();
      const cachedTonight = await getCachedTonightIds();

      if (cached && Array.isArray(cached)) {
        setRegisteredPlayers(cached);
      }

      if (cachedTonight && Array.isArray(cachedTonight)) {
        setTonightPlayerIds(cachedTonight);
      }
    };

    loadData();
  }, []);

  // Save registered players whenever they change
  useEffect(() => {
    if (registeredPlayers.length > 0) {
      cachePlayers(registeredPlayers);
    }
  }, [registeredPlayers]);

  // Save tonight's selections whenever they change
  useEffect(() => {
    if (tonightPlayerIds.length > 0) {
      cacheTonightIds(tonightPlayerIds);
    }
  }, [tonightPlayerIds]);

  const addPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Please enter a player name.");
      return;
    }

    // Check for duplicate names
    const nameExists = registeredPlayers.some(
      (p) => p.name.toUpperCase() === trimmedName.toUpperCase()
    );
    if (nameExists) {
      Alert.alert("Error", "A player with this name already exists.");
      return;
    }

    const newPlayer = {
      id: `player_${Date.now()}_${Math.random()}`,
      name: trimmedName.toUpperCase(),
    };

    setRegisteredPlayers([...registeredPlayers, newPlayer]);
    setNewPlayerName("");
  };

  const removePlayer = (id) => {
    // Remove from registered players
    const updatedPlayers = registeredPlayers.filter((p) => p.id !== id);
    setRegisteredPlayers(updatedPlayers);

    // Also remove from tonight's players if selected
    const updatedTonight = tonightPlayerIds.filter((pid) => pid !== id);
    setTonightPlayerIds(updatedTonight);
  };

  const toggleTonightPlayer = (id) => {
    if (tonightPlayerIds.includes(id)) {
      // Remove from tonight's players
      setTonightPlayerIds(tonightPlayerIds.filter((pid) => pid !== id));
    } else {
      // Check if we've reached the maximum of 4 players
      if (tonightPlayerIds.length >= 4) {
        Alert.alert(
          "Maximum Players",
          "You can select a maximum of 4 players."
        );
        return;
      }
      // Add to tonight's players
      setTonightPlayerIds([...tonightPlayerIds, id]);
    }
  };

  const startEditing = (player) => {
    setEditingPlayerId(player.id);
    setEditingName(player.name);
  };

  const cancelEditing = () => {
    setEditingPlayerId(null);
    setEditingName("");
  };

  const saveEditing = () => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Player name cannot be empty.");
      return;
    }

    // Check for duplicate names (excluding current player)
    const nameExists = registeredPlayers.some(
      (p) =>
        p.id !== editingPlayerId &&
        p.name.toUpperCase() === trimmedName.toUpperCase()
    );
    if (nameExists) {
      Alert.alert("Error", "A player with this name already exists.");
      return;
    }

    const updatedPlayers = registeredPlayers.map((p) =>
      p.id === editingPlayerId ? { ...p, name: trimmedName.toUpperCase() } : p
    );
    setRegisteredPlayers(updatedPlayers);
    setEditingPlayerId(null);
    setEditingName("");
  };

  const resetTonight = () => {
    setTonightPlayerIds([]);
  };

  const continueToGameSetup = () => {
    if (tonightPlayerIds.length < 2) {
      Alert.alert("Select Players", "Select at least 2 players to continue.");
      return;
    }

    if (tonightPlayerIds.length > 4) {
      Alert.alert("Too Many Players", "You can select a maximum of 4 players.");
      return;
    }

    // Get the selected players' data
    const selectedPlayers = registeredPlayers.filter((p) =>
      tonightPlayerIds.includes(p.id)
    );

    // Navigate to GameSetup with selected players
    navigation.navigate("GameSetup", { selectedPlayers });
  };

  const tonightPlayers = registeredPlayers.filter((p) =>
    tonightPlayerIds.includes(p.id)
  );

  const canContinue =
    tonightPlayerIds.length >= 2 && tonightPlayerIds.length <= 4;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tonight's Players Section */}
        <View style={styles.tonightCard}>
          <View style={styles.tonightHeader}>
            <Text style={styles.sectionTitle}>Tonight's Players</Text>
            {tonightPlayers.length > 0 && (
              <TouchableOpacity
                onPress={resetTonight}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Reset Tonight</Text>
              </TouchableOpacity>
            )}
          </View>

          {tonightPlayers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No players selected for tonight
              </Text>
              <Text style={styles.emptySubtext}>
                {tonightPlayerIds.length} players selected for tonight
              </Text>
            </View>
          ) : (
            <View style={styles.tonightList}>
              {tonightPlayers.map((player) => (
                <View key={player.id} style={styles.tonightPlayerRow}>
                  <Text style={styles.tonightPlayerName}>{player.name}</Text>
                  <TouchableOpacity
                    onPress={() => toggleTonightPlayer(player.id)}
                    style={styles.removeTonightButton}
                  >
                    <Text style={styles.removeTonightText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <Text style={styles.tonightCount}>
                {tonightPlayers.length} players selected for tonight
              </Text>
            </View>
          )}
        </View>

        {/* Registered Players Section */}
        <View style={styles.registeredSection}>
          <Text style={styles.sectionTitle}>Registered Players</Text>

          {/* Add Player Input */}
          <View style={styles.addPlayerRow}>
            <TextInput
              style={styles.playerInput}
              placeholder="Enter player name"
              placeholderTextColor={colors.textHint}
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              onSubmitEditing={addPlayer}
            />
            <TouchableOpacity onPress={addPlayer} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Player</Text>
            </TouchableOpacity>
          </View>

          {/* Registered Players List */}
          {registeredPlayers.length === 0 ? (
            <View style={styles.emptyRegistered}>
              <Text style={styles.emptyText}>No registered players</Text>
              <Text style={styles.emptySubtext}>
                Add players to get started
              </Text>
            </View>
          ) : (
            <View style={styles.playersList}>
              {registeredPlayers.map((player) => {
                const isSelected = tonightPlayerIds.includes(player.id);
                const isEditing = editingPlayerId === player.id;

                return (
                  <View
                    key={player.id}
                    style={[
                      styles.playerCard,
                      isSelected && styles.playerCardSelected,
                    ]}
                  >
                    {isEditing ? (
                      <>
                        <TextInput
                          style={styles.editInput}
                          value={editingName}
                          onChangeText={setEditingName}
                          autoFocus
                          onSubmitEditing={saveEditing}
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            onPress={saveEditing}
                            style={styles.saveButton}
                          >
                            <Text style={styles.saveButtonText}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={cancelEditing}
                            style={styles.cancelButton}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <View style={styles.playerActions}>
                          <TouchableOpacity
                            onPress={() => toggleTonightPlayer(player.id)}
                            style={[
                              styles.statusBadge,
                              isSelected
                                ? styles.statusBadgeSelected
                                : styles.statusBadgeTonight,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                isSelected
                                  ? styles.statusBadgeTextSelected
                                  : styles.statusBadgeTextTonight,
                              ]}
                            >
                              {isSelected ? "Selected" : "Tonight"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => startEditing(player)}
                            style={styles.iconButton}
                          >
                            <EditIcon width={12} height={12} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => removePlayer(player.id)}
                            style={styles.removeButton}
                          >
                            <RemoveIcon
                              width={12}
                              height={12}
                              color="#FF6467"
                            />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={continueToGameSetup}
          disabled={!canContinue}
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.continueButtonText,
              !canContinue && styles.continueButtonTextDisabled,
            ]}
          >
            Continue to Game Setup
          </Text>
        </TouchableOpacity>
        {!canContinue && (
          <Text style={styles.hintText}>
            {tonightPlayerIds.length < 2
              ? "Select at least 2 players to continue"
              : "Select between 2 and 4 players to continue"}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  tonightCard: {
    backgroundColor: "#FFFFFF1A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  tonightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: "#82181A66",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#FF6467",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textHint,
  },
  tonightList: {
    gap: 8,
  },
  tonightPlayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF1A",
    borderWidth: 1,
    borderColor: "#00996680",
    padding: 12,
    borderRadius: 14,
  },
  tonightPlayerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  removeTonightButton: {
    backgroundColor: "#82181A66",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeTonightText: {
    color: "#FF6467",
    fontSize: 12,
    fontWeight: "600",
  },
  tonightCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    marginLeft: 87,
  },
  registeredSection: {
    marginBottom: 24,
  },
  addPlayerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  playerInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: "center",
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyRegistered: {
    paddingVertical: 40,
    alignItems: "center",
  },
  playersList: {
    gap: 12,
  },
  playerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  playerCardSelected: {
    backgroundColor: colors.cardActive,
    borderColor: colors.success,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  playerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeSelected: {
    backgroundColor: colors.success,
  },
  statusBadgeTonight: {
    backgroundColor: "#FFFFFF1A",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadgeTextSelected: {
    color: colors.textPrimary,
  },
  statusBadgeTextTonight: {
    color: colors.textSecondary,
  },
  iconButton: {
    width: 24,
    height: 24,
    padding: 4,
    backgroundColor: "#733E0A66",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    // padding: 4,
  },
  removeButton: {
    width: 24,
    height: 24,
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#82181A66",
    alignItems: "center",
    justifyContent: "center",
  },
  editInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 16,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  continueButton: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: colors.card,
    opacity: 0.5,
  },
  continueButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  continueButtonTextDisabled: {
    color: colors.textMuted,
  },
  hintText: {
    fontSize: 12,
    color: colors.textHint,
    textAlign: "center",
    marginTop: 8,
  },
});

export default PlayerSelectionScreen;
