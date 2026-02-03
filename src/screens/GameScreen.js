import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { colors } from "../styles/globalStyles";
import { loadGame, saveGame } from "../storage/localGameStore";
import { applyTurn, undoLastTurn } from "../logic/gameEngine";
import NumericKeypad from "../components/NumericKeypad";
import Header from "../components/Header";

function GameScreen({ navigation }) {
  const [game, setGame] = useState(null);
  const [scoreInput, setScoreInput] = useState("");
  const [finishedOnDouble, setFinishedOnDouble] = useState(false);
  const [bustMessage, setBustMessage] = useState("");

  const persistGame = async (nextGame) => {
    setGame(nextGame);
    await saveGame(nextGame);
  };

  const handleUndo = async () => {
    if (!game) return;
    const { game: nextGame, error: undoError } = undoLastTurn(game);
    if (undoError) {
      return;
    }

    setBustMessage("");
    setScoreInput("");
    await persistGame(nextGame);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const saved = await loadGame();
      if (!saved) {
        navigation.replace("GameSetup");
        return;
      }
      setGame(saved);
    };
    bootstrap();
  }, [navigation]);

  useLayoutEffect(() => {
    if (game) {
      const centerContent = (
        <>
          <Text style={styles.gameTypeHeader}>{game.gameType}</Text>
          {game.doubleOut && (
            <Text style={styles.doubleOutHeader}>Double Out</Text>
          )}
        </>
      );

      const rightContent = (
        <TouchableOpacity
          onPress={() => handleUndo()}
          disabled={game.history.length === 0}
          style={[
            styles.undoButtonHeader,
            game.history.length === 0 && styles.undoButtonDisabled,
          ]}
        >
          <Text style={styles.undoIconHeader}>↩</Text>
          <Text style={styles.undoTextHeader}>Undo</Text>
        </TouchableOpacity>
      );

      navigation.setOptions({
        header: () => (
          <Header
            onBack={() => {
              // Navigate back to GameSetup since Game uses replace()
              navigation.navigate("GameSetup");
            }}
            center={centerContent}
            right={rightContent}
            showBack={true}
          />
        ),
      });
    }
  }, [game, navigation, game?.history.length]);

  const handleNumberPress = (num) => {
    const newScore = scoreInput + num.toString();
    const parsed = parseInt(newScore, 10);
    if (newScore.length <= 3) {
      setScoreInput(newScore);
      if (parsed <= 180) setBustMessage("");
      // When score changes, reset double-out checkbox if it's no longer a checkout
      const remaining =
        game?.players?.[game?.currentPlayerIndex]?.remainingScore ?? 0;
      if (parsed !== remaining || !game?.doubleOut || parsed <= 0) {
        setFinishedOnDouble(false);
      }
    }
  };

  const handleBackspace = () => {
    const nextInput = scoreInput.slice(0, -1);
    setScoreInput(nextInput);
    setBustMessage("");
    const parsed = parseInt(nextInput, 10);
    const remaining =
      game?.players?.[game?.currentPlayerIndex]?.remainingScore ?? 0;
    if (Number.isNaN(parsed) || parsed !== remaining || !game?.doubleOut) {
      setFinishedOnDouble(false);
    }
  };

  const handleSubmitScore = async () => {
    if (!game) return;
    if (game.status === "finished") return;

    const parsed = parseInt(scoreInput, 10);
    if (Number.isNaN(parsed) || scoreInput === "") {
      return;
    }
    if (parsed > 180) {
      setBustMessage("");
      return;
    }

    const {
      game: nextGame,
      error: logicError,
      bust,
      finished,
    } = applyTurn(game, {
      score: parsed,
      finishedOnDouble,
    });

    if (logicError) {
      setBustMessage(logicError);
      return;
    }

    if (bust) {
      // Determine bust message (message only; "BUST!" shown as title in UI)
      const currentPlayer = game.players[game.currentPlayerIndex];
      const remaining = currentPlayer?.remainingScore || 0;
      const tentativeRemaining = remaining - parsed;

      let message = "";
      if (tentativeRemaining < 0) {
        message = "Score went below zero";
      } else if (tentativeRemaining === 1 && game.doubleOut) {
        message = "Can't finish on 1 with double-out";
      } else if (
        tentativeRemaining === 0 &&
        game.doubleOut &&
        !finishedOnDouble
      ) {
        message = "Must finish on a double";
      } else {
        message = "Invalid score";
      }

      setBustMessage(message);
      // Still apply the turn (which will bust)
      await persistGame(nextGame);
      setScoreInput("");
      setFinishedOnDouble(false);
      return;
    }

    setBustMessage("");
    setScoreInput("");
    setFinishedOnDouble(false);
    await persistGame(nextGame);

    if (finished) {
      navigation.replace("GameSummary");
    }
  };

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const currentPlayer =
    game.players[game.currentPlayerIndex] ?? game.players[0];
  const scoreValue = scoreInput || "0";
  const parsedScore = parseInt(scoreValue, 10);
  const isScoreOver180 =
    scoreInput !== "" && !Number.isNaN(parsedScore) && parsedScore > 180;
  const isValidScore =
    scoreInput !== "" &&
    !Number.isNaN(parsedScore) &&
    parsedScore >= 0 &&
    parsedScore <= 180;

  const remaining = currentPlayer?.remainingScore ?? 0;
  const isCheckoutWithDoubleOut =
    game.doubleOut && parsedScore > 0 && remaining === parsedScore;

  const canSubmit =
    isValidScore &&
    (!isCheckoutWithDoubleOut || finishedOnDouble) &&
    game.status !== "finished";

  const showScoreError = isScoreOver180;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Player Cards */}
        <View style={styles.playersContainer}>
          {game.players.map((player, index) => {
            const isCurrent = index === game.currentPlayerIndex;
            return (
              <View
                key={player.id}
                style={[
                  styles.playerCard,
                  isCurrent && styles.playerCardActive,
                ]}
              >
                <View style={styles.playerCardContent}>
                  <View style={styles.playerLeft}>
                    <View
                      style={[
                        styles.playerBadge,
                        isCurrent
                          ? styles.playerBadgeActive
                          : styles.playerBadgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.playerBadgeText,
                          !isCurrent && styles.playerBadgeTextInactive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text
                        style={[
                          styles.playerName,
                          !isCurrent && styles.playerNameInactive,
                        ]}
                      >
                        {player.name}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.yourTurn}>Your Turn</Text>
                      )}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.playerScore,
                      !isCurrent && styles.playerScoreInactive,
                    ]}
                  >
                    {player.remainingScore}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Enter Score Section */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Enter Score</Text>
          <View
            style={[
              styles.scoreDisplay,
              scoreInput !== "" &&
                !showScoreError &&
                !bustMessage &&
                styles.scoreDisplayActive,
              (showScoreError || bustMessage) && styles.scoreDisplayError,
            ]}
          >
            <Text
              style={[
                styles.scoreDisplayText,
                (showScoreError || bustMessage) && styles.scoreDisplayTextError,
              ]}
            >
              {scoreValue}
            </Text>
          </View>

          {showScoreError && (
            <Text style={styles.scoreErrorText}>Maximum score is 180</Text>
          )}

          {game.doubleOut &&
            parseInt(scoreValue, 10) > 0 &&
            game.players[game.currentPlayerIndex]?.remainingScore -
              parseInt(scoreValue, 10) ===
              0 && (
              <TouchableOpacity
                style={[
                  styles.doubleToggle,
                  finishedOnDouble && styles.doubleToggleActive,
                ]}
                onPress={() => setFinishedOnDouble((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.doubleToggleText,
                    finishedOnDouble && styles.doubleToggleTextActive,
                  ]}
                >
                  ✓ Finished on double
                </Text>
              </TouchableOpacity>
            )}
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypadContainer}>
          <NumericKeypad
            onNumberPress={handleNumberPress}
            onBackspace={handleBackspace}
            onSubmit={handleSubmitScore}
            canSubmit={canSubmit}
          />
          <Text style={styles.hintText}>
            Enter total score for 3 darts (0-180)
          </Text>
        </View>
      </ScrollView>

      {/* BUST! Popup Modal */}
      <Modal
        visible={!!(bustMessage && !showScoreError)}
        transparent
        animationType="fade"
        onRequestClose={() => setBustMessage("")}
      >
        <Pressable
          style={styles.bustModalOverlay}
          onPress={() => setBustMessage("")}
        >
          <View style={styles.bustModalBox}>
            <View style={styles.bustModalIcon}>
              <Text style={styles.bustModalIconText}>!</Text>
            </View>
            <View style={styles.bustModalContent}>
              <Text style={styles.bustModalTitle}>BUST!</Text>
              <Text style={styles.bustModalMessage}>{bustMessage}</Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#1F3E3B",
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F3E3B",
  },
  loadingText: {
    color: colors.textMuted,
  },
  playersContainer: {
    gap: 12,
    marginBottom: 24,
  },
  playerCard: {
    borderRadius: 14,
    backgroundColor: "#3B4E48",
    borderWidth: 1,
    borderColor: "#FFFFFF33",
    padding: 16,
  },
  playerCardActive: {
    // backgroundColor: "#007E5B",
    backgroundColor: colors.cardActive,
    borderWidth: 1,
    borderColor: "#00BC7D",
  },
  playerCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  playerBadgeActive: {
    backgroundColor: "#00BC7D",
  },
  playerBadgeInactive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  playerBadgeText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  playerBadgeTextInactive: {
    color: colors.textMuted,
  },
  playerInfo: {
    gap: 4,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  playerNameInactive: {
    color: colors.textMuted,
  },
  yourTurn: {
    fontSize: 13,
    color: "#00BC7D",
    fontWeight: "600",
  },
  playerScore: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  playerScoreInactive: {
    color: colors.textMuted,
  },
  scoreSection: {
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  scoreDisplay: {
    height: 100,
    borderRadius: 14,
    backgroundColor: "#3B4E48",
    borderWidth: 1,
    borderColor: "#FFFFFF33",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  scoreDisplayActive: {
    backgroundColor: colors.cardActive,
    borderWidth: 1,
    borderColor: "#00BC7D",
  },
  scoreDisplayError: {
    backgroundColor: "#B732254D",
    borderColor: "#B73225",
  },
  scoreDisplayText: {
    fontSize: 56,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  scoreDisplayTextError: {
    color: colors.textPrimary,
  },
  scoreErrorText: {
    fontSize: 14,
    color: "#B73225",
    marginBottom: 12,
    textAlign: "center",
  },
  bustModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  bustModalBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    borderRadius: 14,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  bustModalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  bustModalIconText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  bustModalContent: {
    flex: 1,
  },
  bustModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bustModalMessage: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  doubleToggle: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
  },
  doubleToggleActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  doubleToggleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  doubleToggleTextActive: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  keypadContainer: {
    marginTop: 8,
    paddingHorizontal: 32,
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
  },
  hintText: {
    textAlign: "center",
    color: colors.textHint,
    fontSize: 12,
    marginTop: 16,
  },
  gameTypeHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  doubleOutHeader: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  undoButtonHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 6,
  },
  undoButtonDisabled: {
    opacity: 0.4,
  },
  undoIconHeader: {
    fontSize: 18,
    color: colors.textMuted,
  },
  undoTextHeader: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
});

export default GameScreen;
