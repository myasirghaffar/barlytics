/**
 * Search bar with magnifying icon and placeholder.
 * Used on Product List, Catalog Add, and Purchase Price screens.
 */
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Icons } from '../assets/icons';
import { colors, spacing, borderRadius } from '../theme/colors';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search products',
  onClear,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <Icon name={Icons.search} size={22} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={() => (onClear ? onClear() : onChangeText(''))} hitSlop={12}>
          <Icon name={Icons.close} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
});
