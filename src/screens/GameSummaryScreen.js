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
import {
  TrophyIcon,
  RematchIcon,
  HomeIcon,
  SummaryTrophyIcon,
} from "../assets/icons/icons";

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
      {/* Trophy Section */}
      <View style={styles.trophyContainer}>
        <View style={styles.trophyShadow}>
          <View style={styles.trophyCircle}>
            <SummaryTrophyIcon width={80} height={80} color="white" />
          </View>
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
          <RematchIcon />
          <Text style={styles.rematchText}>Rematch</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame}>
          <HomeIcon />
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
    marginBottom: 48,
    alignItems: "center",
  },
  trophyShadow: {
    shadowColor: "rgba(208, 135, 0, 0.3)",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 15,
  },
  trophyCircle: {
    width: 127.98,
    height: 127.98,
    backgroundColor: "#FDC700", // Fallback for gradient
    borderRadius: 64, // Correct value for circle
    justifyContent: "center",
    alignItems: "center",
  },
  winnerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  winnerName: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  winnerSubtext: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  gameTypeCard: {
    width: 122.66,
    height: 82.58,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: "rgba(255, 255, 255, 0.20)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  gameTypeLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "Roboto",
    marginBottom: 4,
  },
  gameTypeValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    fontFamily: "Roboto",
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
  },
  rematchButton: {
    width: "100%",
    height: 63.99,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#009966",
    borderRadius: 14,
    gap: 12,
  },
  rematchText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    fontFamily: "Roboto",
    lineHeight: 28,
  },
  newGameButton: {
    width: "100%",
    height: 63.99,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: "rgba(255, 255, 255, 0.20)",
    gap: 12,
  },
  newGameText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    fontFamily: "Roboto",
    lineHeight: 28,
  },
});

export default GameSummaryScreen;
