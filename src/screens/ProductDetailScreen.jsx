/**
 * Single product detail view. Bottle with smooth fill-level slider and full-bottle counter.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Icons } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';
import { useInventory } from '../context/InventoryContext';
import BottleFillSlider from '../components/BottleFillSlider';
import { colors, spacing } from '../theme/colors';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params || {};
  const { t } = useLanguage();
  const { updateFillLevel } = useInventory();
  const [fullBottles, setFullBottles] = useState(0);
  const initialFill = product?.fillLevel != null ? product.fillLevel : 100;
  const [localFillLevel, setLocalFillLevel] = useState(initialFill);

  useEffect(() => {
    setLocalFillLevel(product?.fillLevel != null ? product.fillLevel : 100);
  }, [product?.id, product?.fillLevel]);

  const handleFillChange = useCallback(
    async (fillLevel) => {
      if (!product?.id) return;
      setLocalFillLevel(fillLevel);
      await updateFillLevel(product.id, fillLevel);
    },
    [product?.id, updateFillLevel]
  );

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.safeInner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('back')}</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('noProducts')}</Text>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.safeInner}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name || t('productName')} {product.volume ? `(${product.volume} ml)` : ''}
        </Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name={Icons.helpOutline} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <BottleFillSlider
          image={product.image}
          name={product.name}
          fillLevel={localFillLevel}
          onFillLevelChange={handleFillChange}
        />
      </View>

      <View style={styles.quantitySection}>
        <Text style={styles.quantityLabel}>{t('and')}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => setFullBottles((n) => Math.max(0, n - 1))}
            activeOpacity={0.8}
          >
            <Icon name={Icons.remove} size={28} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.quantityValueWrap}>
            <View style={styles.quantityCircle}>
              <Text style={styles.quantityNumber}>{fullBottles}</Text>
            </View>
            <Text style={styles.quantitySub}>{t('fullBottles')}</Text>
          </View>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => setFullBottles((n) => n + 1)}
            activeOpacity={0.8}
          >
            <Icon name={Icons.add} size={28} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeInner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    padding: spacing.sm,
    minWidth: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
  },
  quantitySection: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  quantityBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValueWrap: {
    alignItems: 'center',
    minWidth: 100,
  },
  quantityCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quantityNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quantitySub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
