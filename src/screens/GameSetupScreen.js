import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { colors } from "../styles/globalStyles";
import { createPlayer } from "../types/Player";
import { createGame } from "../types/Game";
import { saveGame } from "../storage/localGameStore";

function GameSetupScreen({ navigation, route }) {
  const [gameType, setGameType] = useState("501");
  const [doubleOut, setDoubleOut] = useState(true);
  const [legsMode, setLegsMode] = useState("single");
  const [legsCount, setLegsCount] = useState(3);
  const [players, setPlayers] = useState([]);

  const startingScore = gameType === "301" ? 301 : 501;

  // Initialize players from route params (selected from PlayerSelectionScreen)
  useEffect(() => {
    const selectedPlayers = route.params?.selectedPlayers || [];

    if (selectedPlayers.length > 0) {
      // Convert selected players to Player format with starting scores
      const convertedPlayers = selectedPlayers.map((p, index) =>
        createPlayer(
          p.id || `p_${Date.now()}_${index}`,
          p.name || `Player ${index + 1}`,
          startingScore
        )
      );
      setPlayers(convertedPlayers);
    } else {
      // Fallback to default players if no selection (shouldn't happen in normal flow)
      const defaultPlayers = [
        createPlayer(`p_${Date.now()}_0`, "Player 1", startingScore),
        createPlayer(`p_${Date.now()}_1`, "Player 2", startingScore),
      ];
      setPlayers(defaultPlayers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.selectedPlayers]);

  // Update player starting scores when game type changes
  useEffect(() => {
    if (players.length > 0) {
      const needsUpdate = players.some(
        (p) => p.startingScore !== startingScore
      );
      if (needsUpdate) {
        const updatedPlayers = players.map((p) => ({
          ...p,
          startingScore,
          remainingScore: startingScore,
        }));
        setPlayers(updatedPlayers);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType]);

  const canContinue = players.length >= 2 && players.length <= 4;

  const startGame = async () => {
    if (!canContinue) {
      Alert.alert("Add players", "Please add between 2 and 4 players.");
      return;
    }

    const safeLegsCount = legsCount || 3;

    const normalizedPlayers = players.map((p) =>
      p.startingScore === startingScore
        ? p
        : { ...p, startingScore, remainingScore: startingScore }
    );

    const game = createGame({
      gameType,
      doubleOut,
      legsMode,
      legsCount: safeLegsCount,
      players: normalizedPlayers,
    });

    await saveGame(game);
    navigation.replace("Game");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Playing Tonight Section */}
      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>
          Playing Tonight ({players.length})
        </Text>
        {players.map((player, index) => (
          <View key={player.id} style={styles.playerDisplayRow}>
            <View style={styles.playerDisplay}>
              <View style={styles.playerNumberBadge}>
                <Text style={styles.playerNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.playerDisplayText}>{player.name}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Game Type Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Type</Text>
        <View style={styles.chipRow}>
          {["301", "501"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, gameType === type && styles.chipSelected]}
              onPress={() => setGameType(type)}
            >
              <Text
                style={[
                  styles.chipText,
                  gameType === type && styles.chipTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Double Out Section */}
      <View style={styles.DoubleSection}>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <Text style={styles.sectionTitle}>Double Out</Text>
            <Text style={styles.helperText}>
              Final dart must land on a double
            </Text>
          </View>
          <Switch
            value={doubleOut}
            onValueChange={setDoubleOut}
            trackColor={{
              false: Platform.OS === "ios" ? colors.keypadBg : colors.card,
              true: "#009966",
            }}
            thumbColor={
              Platform.OS === "ios"
                ? "#FFFFFF"
                : doubleOut
                  ? colors.textPrimary
                  : colors.textMuted
            }
            ios_backgroundColor={colors.keypadBg}
            style={
              Platform.OS === "ios"
                ? { transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }] }
                : {}
            }
          />
        </View>
      </View>

      {/* Leg Format Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leg Format</Text>
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, legsMode === "single" && styles.chipSelected]}
            onPress={() => setLegsMode("single")}
          >
            <Text
              style={[
                styles.chipText,
                legsMode === "single" && styles.chipTextSelected,
              ]}
            >
              Single Leg
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, legsMode === "bestOf" && styles.chipSelected]}
            onPress={() => setLegsMode("bestOf")}
          >
            <Text
              style={[
                styles.chipText,
                legsMode === "bestOf" && styles.chipTextSelected,
              ]}
            >
              Best of Legs
            </Text>
          </TouchableOpacity>
        </View>
        {legsMode === "bestOf" && (
          <View style={styles.legsCountCard}>
            <Text style={styles.legsCountTitle}>Number of Legs</Text>
            <View style={styles.legsCountRow}>
              {[3, 5, 7, 9].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.legCountButton,
                    legsCount === count && styles.legCountButtonSelected,
                  ]}
                  onPress={() => setLegsCount(count)}
                >
                  <Text
                    style={[
                      styles.legCountText,
                      legsCount === count && styles.legCountTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.legsCountHelper}>
              First to {Math.ceil(legsCount / 2)} legs wins
            </Text>
          </View>
        )}
      </View>

      {/* Start Game Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          !canContinue && styles.primaryButtonDisabled,
        ]}
        onPress={startGame}
        disabled={!canContinue}
      >
        <Text style={styles.primaryButtonText}>Start Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 3,
    paddingBottom: Platform.OS === "ios" ? 100 : 46,
  },
  section: {
    marginBottom: 10,
    marginTop: 14,
  },
  playersSection: {
    marginBottom: 6,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  DoubleSection: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    gap: 12,
  },
  chip: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#2A4A3A",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: "#0099664D",
    borderWidth: 1,
    borderColor: "#00BC7D",
  },
  chipText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.textPrimary,
    fontWeight: "bold",
    fontSize: 18,
  },
  playerDisplayRow: {
    marginBottom: 6,
  },
  playerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 10,
    backgroundColor: "#FFFFFF0D",
    paddingHorizontal: 14,
    gap: 12,
  },
  playerNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  playerNumberText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  playerDisplayText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex1: {
    flex: 1,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  legsCountCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  legsCountTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  legsCountRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  legCountButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#2A4A3A",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  legCountButtonSelected: {
    backgroundColor: "#0099664D",
    borderWidth: 1,
    borderColor: "#00BC7D",
  },
  legCountText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: "500",
  },
  legCountTextSelected: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  legsCountHelper: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#009966",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default GameSetupScreen;
