import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors } from "../styles/globalStyles";
import { clearGame, loadGame, saveGame } from "../storage/localGameStore";
import { TrophyIcon } from "../assets/icons/icons";

function GameSummaryScreen({ navigation }) {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      const saved = await loadGame();
      if (!saved) {
        navigation.replace("Home");
        return;
      }
      setGame(saved);
    };
    bootstrap();
  }, [navigation]);

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading summary...</Text>
      </View>
    );
  }

  const winner = game.players.find((p) => p.id === game.winnerPlayerId);

  const handleNewGame = async () => {
    await clearGame();
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  const handleRematch = async () => {
    // Create a fresh game with same settings and players, resetting scores.
    const startingScore = game.gameType === "301" ? 301 : 501;
    const rematchPlayers = game.players.map((p) => ({
      ...p,
      startingScore,
      remainingScore: startingScore,
    }));

    const rematchGame = {
      ...game,
      id: `game_${Date.now()}`,
      players: rematchPlayers,
      currentPlayerIndex: 0,
      status: "inProgress",
      winnerPlayerId: null,
      history: [],
    };

    await saveGame(rematchGame);
    navigation.reset({
      index: 0,
      routes: [{ name: "Game" }],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Trophy Icon */}
      <View style={styles.trophyContainer}>
        <View style={styles.trophyShadow}>
          <TrophyIcon width={160} height={160} color="white" />
        </View>
      </View>

      {/* Winner Announcement */}
      <View style={styles.winnerContainer}>
        <Text style={styles.winnerName}>{winner?.name ?? "Unknown"}</Text>
        <Text style={styles.winnerSubtext}>wins the game!</Text>
      </View>

      {/* Game Type Card */}
      <View style={styles.gameTypeCard}>
        <Text style={styles.gameTypeLabel}>Game Type</Text>
        <Text style={styles.gameTypeValue}>{game.gameType}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.rematchButton} onPress={handleRematch}>
          <Text style={styles.rematchIcon}>⟳</Text>
          <Text style={styles.rematchText}>Rematch</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame}>
          <Text style={styles.newGameIcon}>⌂</Text>
          <Text style={styles.newGameText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  trophyContainer: {
    marginBottom: 8,
    alignItems: "center",
  },
  trophyShadow: {
    // box-shadow: 0px 25px 50px -12px #D087004D
    shadowColor: "#D08700",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 12,
  },
  winnerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  winnerName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  winnerSubtext: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  gameTypeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minWidth: 200,
    marginBottom: 40,
  },
  gameTypeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  gameTypeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
  },
  rematchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  rematchIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  rematchText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  newGameButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  newGameIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  newGameText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});

export default GameSummaryScreen;
