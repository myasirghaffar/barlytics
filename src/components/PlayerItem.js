import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { colors } from '../styles/globalStyles';

function PlayerItem({
  player,
  isSelectedForTonight,
  isEditing,
  editName,
  onEditNameChange,
  onToggleTonight,
  onEditClick,
  onEditSubmit,
  onCancelEdit,
  onDelete,
  disabled,
}) {
  if (!player) return null;

  return (
    <View style={styles.playerRow}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editName}
            onChangeText={onEditNameChange}
            editable={!disabled}
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.iconButton, styles.saveButton]}
              onPress={onEditSubmit}
              disabled={disabled || !editName?.trim()}
            >
              <Text style={styles.iconButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.cancelButton]}
              onPress={onCancelEdit}
              disabled={disabled}
            >
              <Text style={styles.iconButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.playerActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isSelectedForTonight ? styles.selectedButton : styles.addTonightButton,
              ]}
              onPress={onToggleTonight}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  isSelectedForTonight ? styles.actionSelectedText : styles.actionDefaultText,
                ]}
              >
                {isSelectedForTonight ? '✓ Selected' : '+ Tonight'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.editButton]}
              onPress={onEditClick}
              disabled={disabled}
            >
              <Text style={[styles.iconButtonText, styles.editIcon]}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.deleteButton]}
              onPress={onDelete}
              disabled={disabled}
            >
              <Text style={[styles.iconButtonText, styles.deleteIcon]}>✕</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 8,
    marginBottom: 10,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addTonightButton: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  selectedButton: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: "rgba(52,199,89,0.35)",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionDefaultText: {
    color: colors.textPrimary,
  },
  actionSelectedText: {
    color: colors.success,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  editButton: {
    backgroundColor: colors.warningSoft,
    borderColor: "rgba(255,204,0,0.35)",
  },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(255,90,82,0.35)",
  },
  saveButton: {
    backgroundColor: colors.successSoft,
    borderColor: "rgba(52,199,89,0.35)",
  },
  cancelButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(255,90,82,0.35)",
  },
  iconButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  editIcon: {
    color: colors.warning,
  },
  deleteIcon: {
    color: colors.danger,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: colors.surfaceStrong,
    color: colors.textPrimary,
  },
  editActions: {
    flexDirection: 'row',
    gap: 4,
  },
});

export default PlayerItem;

