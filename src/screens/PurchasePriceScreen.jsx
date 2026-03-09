/**
 * SCREEN 3 — Purchase Price. List products with green price card; tap to edit price.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon, Icons } from '../assets/icons';
import { getBottleImage } from '../assets/images/bottleImages';
import { useInventory } from '../context/InventoryContext';
import { useLanguage } from '../context/LanguageContext';
import SearchBar from '../components/SearchBar';
import PriceCard from '../components/PriceCard';
import { colors, spacing, borderRadius } from '../theme/colors';

export default function PurchasePriceScreen({ navigation }) {
  const {
    getAllProductsForPriceScreen,
    updatePrice,
    dbReady,
  } = useInventory();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const loadProducts = useCallback(async () => {
    const list = await getAllProductsForPriceScreen();
    setProducts(list);
    setFiltered(list);
  }, [getAllProductsForPriceScreen]);

  React.useEffect(() => {
    if (dbReady) loadProducts();
  }, [dbReady, loadProducts]);

  React.useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(products);
      return;
    }
    setFiltered(products.filter((p) => (p.name || '').toLowerCase().includes(q)));
  }, [search, products]);

  const openEdit = (item) => {
    setEditModal(item);
    setPriceInput(String(item.price ?? ''));
  };

  const savePrice = async () => {
    if (editModal == null) return;
    const num = parseFloat(priceInput.replace(',', '.')) || 0;
    await updatePrice(editModal.id, num);
    setEditModal(null);
    loadProducts();
  };

  const renderItem = useCallback(
    ({ item }) => {
      const imageSource = getBottleImage(item) || (item.image ? { uri: item.image } : null);
      return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          {imageSource ? (
            <Image source={imageSource} style={styles.thumb} resizeMode="contain" />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Icon name={Icons.localBar} size={28} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.rowText}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.volume}>{item.volume ? `${item.volume} ml` : '—'}</Text>
          </View>
        </View>
        <PriceCard price={item.price} onPress={() => openEdit(item)} />
      </View>
      );
    },
    []
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  if (!dbReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name={Icons.euro} size={24} color={colors.primaryBlue} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>{t('purchasePrices')}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name={Icons.cropSquare} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name={Icons.list} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t('searchProducts')}
            style={styles.searchBar}
          />
          <Text style={styles.count}>{t('productsCount', { count: filtered.length })}</Text>
        </View>

        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name={Icons.attachMoney} size={48} color={colors.textSecondary} />
              <Text style={styles.empty}>{t('noProducts')}</Text>
              <Text style={styles.emptyHint}>{t('addProductsFirst')}</Text>
            </View>
          }
        />
      </View>

      <Modal
        visible={editModal != null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditModal(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContent}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalCard}>
                <View style={styles.modalTitleRow}>
                  <Icon name={Icons.edit} size={20} color={colors.primaryBlue} style={styles.modalTitleIcon} />
                  <Text style={styles.modalTitle}>{t('priceEuro')}</Text>
                  <TouchableOpacity style={styles.modalClose} onPress={() => setEditModal(null)}>
                    <Icon name={Icons.close} size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={priceInput}
                  onChangeText={setPriceInput}
                  keyboardType="decimal-pad"
                  placeholder={t('pricePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(null)}>
                    <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={savePrice}>
                    <Text style={styles.saveBtnText}>{t('save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumb: {
    width: 44,
    height: 56,
    borderRadius: 4,
    marginRight: spacing.md,
    backgroundColor: 'transparent',
  },
  thumbPlaceholder: {
    width: 44,
    height: 56,
    borderRadius: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  volume: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: 16,
  },
  emptyHint: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 320,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitleIcon: {
    marginRight: spacing.sm,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalClose: {
    padding: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cancelBtnText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
