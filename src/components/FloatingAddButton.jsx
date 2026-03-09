/**
 * Bottom-right floating action button (FAB) with "+" icon.
 * Navigates to Add Product / Catalog screen.
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, Icons } from '../assets/icons';
import { colors, borderRadius } from '../theme/colors';

const SIZE = 56;

export default function FloatingAddButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon name={Icons.add} size={28} color={colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
