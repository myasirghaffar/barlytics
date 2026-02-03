import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../styles/globalStyles";

function NumericKeypad({ onNumberPress, onBackspace, onSubmit, canSubmit }) {
  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <View style={styles.container}>
      {numbers.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => onNumberPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <TouchableOpacity style={styles.key} onPress={onBackspace}>
          <View style={styles.backspaceIcon}>
            <Text style={styles.backspaceText}>✕</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={() => onNumberPress(0)}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.key,
            styles.submitKey,
            canSubmit && styles.submitKeyActive,
          ]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Text style={[styles.keyText, canSubmit && styles.submitKeyText]}>
            ✓
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  key: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 80,
    borderRadius: 14,
    backgroundColor: "#3B4E48",
    borderWidth: 1,
    borderColor: "#00BC7D",
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: {
    fontSize: 24,
    color: colors.keypadText,
    fontWeight: "500",
  },
  submitKey: {
    backgroundColor: "#3B4E48",
    borderWidth: 1,
    borderColor: "#00BC7D",
  },
  submitKeyActive: {
    backgroundColor: "#00BC7D",
    borderWidth: 0,
    borderColor: "transparent",
  },
  submitKeyText: {
    color: colors.textPrimary,
  },
  backspaceIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  backspaceText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "bold",
  },
});

export default NumericKeypad;
