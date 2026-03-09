/**
 * SCREEN 1 — Product List (Main). Station name, search, product list, FAB, Start Inventory button.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Icon, Icons } from '../assets/icons';
import { useInventory } from '../context/InventoryContext';
import { useLanguage } from '../context/LanguageContext';
import SearchBar from '../components/SearchBar';
import ProductItem from '../components/ProductItem';
import FloatingAddButton from '../components/FloatingAddButton';
import { colors, spacing } from '../theme/colors';

const PLACEHOLDER_IMAGE = null;

export default function ProductListScreen({ navigation }) {
  const {
    products,
    currentAreaName,
    dbReady,
    searchProducts,
  } = useInventory();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(products);

  const doSearch = useCallback(
    async (text) => {
      setSearch(text);
      if (!text.trim()) {
        setFiltered(products);
        return;
      }
      const list = await searchProducts(text);
      setFiltered(list);
    },
    [products, searchProducts]
  );

  React.useEffect(() => {
    if (!search.trim()) setFiltered(products);
  }, [products, search]);

  const handleStartInventory = () => {
    navigation.navigate('InventoryMode');
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const renderItem = useCallback(
    ({ item }) => (
      <ProductItem
        name={item.name}
        volume={item.volume}
        image={item.image || PLACEHOLDER_IMAGE}
        statusOk={item.fillLevel > 25}
        onPress={() => {}}
      />
    ),
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{currentAreaName}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name={Icons.edit} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name={Icons.viewList} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <SearchBar
          value={search}
          onChangeText={doSearch}
          placeholder={t('searchAreaPlaceholder')}
        />
        <View style={styles.offlineRow}>
          <Icon name={Icons.offlinePin} size={20} color={colors.textSecondary} style={styles.offlineIcon} />
          <Text style={styles.offlineLabel}>{t('offlineDownload')}</Text>
          <View style={styles.toggle} />
        </View>

        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name={Icons.localBar} size={48} color={colors.textSecondary} />
              <Text style={styles.empty}>{t('noProducts')}</Text>
              <Text style={styles.emptyHint}>{t('emptyHintAdd')}</Text>
            </View>
          }
        />
      </View>

      <FloatingAddButton onPress={handleAddProduct} />

      <TouchableOpacity style={styles.startBtn} onPress={handleStartInventory}>
        <Icon name={Icons.playArrow} size={24} color={colors.white} />
        <Text style={styles.startBtnText}>{t('startInventory')}</Text>
      </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  listContent: {
    paddingBottom: 100,
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
  offlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  offlineIcon: {
    marginRight: spacing.sm,
  },
  offlineLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentGreen,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
});
