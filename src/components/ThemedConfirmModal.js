import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../styles/globalStyles';

function ThemedConfirmModal({
  visible,
  title,
  message,
  confirmText = 'DELETE',
  cancelText = 'CANCEL',
  tone = 'danger', // 'danger' | 'neutral'
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmColor = tone === 'danger' ? colors.danger : colors.textPrimary;
  const confirmBg = tone === 'danger' ? colors.dangerSoft : colors.surfaceStrong;
  const confirmBorder =
    tone === 'danger' ? 'rgba(255,90,82,0.45)' : colors.borderSoft;

  return (
    <Modal
      transparent
      visible={!!visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.cancelText]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: confirmBg,
                  borderColor: confirmBorder,
                },
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={confirmColor} />
              ) : (
                <Text style={[styles.buttonText, { color: confirmColor }]}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    // Solid popup background (no transparency)
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    padding: 18,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    minWidth: 110,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  cancelText: {
    color: colors.textPrimary,
  },
});

export default ThemedConfirmModal;

