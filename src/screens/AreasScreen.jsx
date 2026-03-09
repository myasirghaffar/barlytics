/**
 * Areas / Stations list. Tap an area to open its Product List. Header includes language switcher (EN / DE).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Icon, Icons, AREA_ICONS } from '../assets/icons';

const appLogo = require('../assets/images/logo.png');
import { useInventory } from '../context/InventoryContext';
import { useLanguage } from '../context/LanguageContext';
import SearchBar from '../components/SearchBar';
import FloatingAddButton from '../components/FloatingAddButton';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

const AREA_COLORS = ['#EC4899', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

export default function AreasScreen({ navigation }) {
  const { areas, dbReady, setCurrentAreaId, setCurrentAreaName } = useInventory();
  const { t, locale, setLocale } = useLanguage();
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = React.useState(areas);

  React.useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) setFiltered(areas);
    else setFiltered(areas.filter((a) => (a.name || '').toLowerCase().includes(q)));
  }, [search, areas]);

  const onAreaPress = (item) => {
    setCurrentAreaId(item.id);
    setCurrentAreaName(item.name);
    navigation.navigate('ProductList');
  };

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
          <View style={styles.headerLogoWrap}>
            <Image source={appLogo} style={styles.headerLogo} resizeMode="contain" />
          </View>
        </View>
        <View style={styles.headerIcons}>
          <View style={styles.langSwitcher}>
            <TouchableOpacity
              style={[styles.langBtn, locale === 'en' && styles.langBtnActive]}
              onPress={() => setLocale('en')}
            >
              <Text style={[styles.langBtnText, locale === 'en' && styles.langBtnTextActive]}>{t('langEn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, locale === 'de' && styles.langBtnActive]}
              onPress={() => setLocale('de')}
            >
              <Text style={[styles.langBtnText, locale === 'de' && styles.langBtnTextActive]}>{t('langDe')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name={Icons.edit} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name={Icons.settings} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchArea')}
        />
        <View style={styles.sectionTitleRow}>
          <Icon name={Icons.folderOpen} size={20} color={colors.primaryBlue} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{t('yourAreas')}</Text>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name={Icons.inventory2} size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>{t('noAreasFound')}</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.areaCard, shadows.card]}
              onPress={() => onAreaPress(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.areaIcon,
                  { backgroundColor: AREA_COLORS[index % AREA_COLORS.length] },
                ]}
              >
                <Icon name={AREA_ICONS[index % AREA_ICONS.length]} size={24} color={colors.white} />
              </View>
              <Text style={styles.areaName}>{item.name}</Text>
              {item.lastSession && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.lastSession}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

  <FloatingAddButton
        onPress={() => {
          const first = areas[0];
          if (first) {
            setCurrentAreaId(first.id);
            setCurrentAreaName(first.name);
          } else {
            setCurrentAreaId(1);
            setCurrentAreaName('Cocktailstation');
          }
          navigation.navigate('AddProduct');
        }}
      />
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
  headerLogoWrap: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: 6,
    // paddingHorizontal: spacing.xs,
    borderRadius: 8,
  },
  headerLogo: {
    height: 32,
    width: 100,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  langSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  langBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: colors.primaryBlue,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langBtnTextActive: {
    color: colors.white,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  areaIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  areaName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    backgroundColor: colors.accentGreen,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});
