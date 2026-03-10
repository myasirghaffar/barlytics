/**
 * SCREEN 4 — Inventory Mode. One bottle at a time with vertical fill slider and full-bottle counter.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Icons } from '../assets/icons';
import { useInventory } from '../context/InventoryContext';
import { useLanguage } from '../context/LanguageContext';
import BottleFillSlider from '../components/BottleFillSlider';
import { colors, spacing } from '../theme/colors';

export default function InventoryModeScreen({ navigation, route }) {
  const { getProductsWithFillLevels, updateFillLevel, currentAreaId } = useInventory();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [index, setIndex] = useState(0);
  const [fullBottles, setFullBottles] = useState(0);
  const [loading, setLoading] = useState(true);

  const product = products[index] || null;

  const loadProducts = useCallback(async () => {
    const list = await getProductsWithFillLevels(currentAreaId);
    setProducts(list);
    setIndex(0);
    setLoading(false);
  }, [getProductsWithFillLevels, currentAreaId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFillChange = useCallback(
    async (fillLevel) => {
      if (!product) return;
      setProducts((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], fillLevel };
        return next;
      });
      await updateFillLevel(product.id, fillLevel);
    },
    [product, index, updateFillLevel]
  );

  const prev = () => setIndex((i) => (i <= 0 ? products.length - 1 : i - 1));
  const next = () => setIndex((i) => (i >= products.length - 1 ? 0 : i + 1));
  const incFull = () => setFullBottles((n) => n + 1);
  const decFull = () => setFullBottles((n) => Math.max(0, n - 1));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.safeInner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('inventory')}</Text>
        </View>
        <View style={styles.centered}>
          <Icon name={Icons.inventory2} size={56} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>{t('noProductsInArea')}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name={Icons.arrowBack} size={20} color={colors.white} style={styles.backBtnIcon} />
            <Text style={styles.backBtnText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.safeInner}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product?.name} {product?.volume ? `(${product.volume} ml)` : ''}
        </Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name={Icons.helpOutline} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <BottleFillSlider
          image={product?.image}
          name={product?.name}
          fillLevel={product?.fillLevel ?? 100}
          onFillLevelChange={handleFillChange}
          onPrev={prev}
          onNext={next}
        />
      </View>

      <View style={styles.quantitySection}>
        <Text style={styles.quantityLabel}>{t('and')}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.quantityBtn} onPress={decFull} activeOpacity={0.8}>
            <Icon name={Icons.remove} size={28} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.quantityValueWrap}>
            <View style={styles.quantityCircle}>
              <Text style={styles.quantityNumber}>{fullBottles}</Text>
            </View>
            <Text style={styles.quantitySub}>{t('fullBottles')}</Text>
          </View>
          <TouchableOpacity style={styles.quantityBtn} onPress={incFull} activeOpacity={0.8}>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  backBtnIcon: {
    marginRight: spacing.sm,
  },
  backBtnText: {
    color: colors.white,
    fontWeight: '600',
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
});
