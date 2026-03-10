/**
 * Single product row: bottle image, name, volume, optional status indicator.
 * Used in Product List and Catalog Add (with checkbox).
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Icon, Icons } from '../assets/icons';
import { getBottleImage } from '../assets/images/bottleImages';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

function ProductItem({
  name,
  volume,
  image,
  statusOk,
  metaText,
  fillLevel,
  onPress,
  selected,
  onSelect,
  showCheckbox,
}) {
  const resolved = getBottleImage({ name, image });
  const imageSource = resolved || (image && typeof image === 'string' ? { uri: image } : null);

  const totalMl = volume != null && Number(volume) >= 0 ? Number(volume) : null;
  const fillPct = fillLevel != null ? Math.min(100, Math.max(0, Number(fillLevel))) : null;
  const remainingMl =
    totalMl != null && fillPct != null ? Math.round((totalMl * fillPct) / 100) : null;
  const volumeText =
    totalMl != null
      ? remainingMl != null
        ? `${totalMl} ml / ${remainingMl} ml`
        : `${totalMl} ml`
      : '—';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showCheckbox && (
        <TouchableOpacity
          onPress={(e) => { e?.stopPropagation?.(); onSelect?.(); }}
          style={styles.checkboxWrap}
        >
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Icon name={Icons.check} size={18} color={colors.white} />}
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.imageWrap}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name={Icons.localBar} size={32} color={colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{name || 'Product'}</Text>
        <View style={styles.meta}>
          <Text style={styles.volume}>
            {volumeText}
            {metaText ? ` - ${metaText}` : ''}
          </Text>
          {statusOk !== undefined && (
            <View style={[styles.statusDot, statusOk && styles.statusOk]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  checkboxWrap: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  imageWrap: {
    width: 48,
    height: 64,
    marginRight: spacing.md,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  volume: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  statusOk: {
    backgroundColor: colors.accentGreen,
  },
});

export default memo(ProductItem);
