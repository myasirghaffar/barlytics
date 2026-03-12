/**
 * App settings: language, offline download, and other preferences.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Icons } from '../assets/icons';
import { useInventory } from '../context/InventoryContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../theme/colors';

export default function SettingsScreen({ navigation }) {
  const { offlineDownloadEnabled, setOfflineDownloadEnabled } = useInventory();
  const { t, locale, setLocale } = useLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.safeInner}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.langBtn, locale === 'en' && styles.langBtnActive]}
              onPress={() => setLocale('en')}
            >
              <Text style={[styles.langBtnText, locale === 'en' && styles.langBtnTextActive]}>
                {t('langEn')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, locale === 'de' && styles.langBtnActive]}
              onPress={() => setLocale('de')}
            >
              <Text style={[styles.langBtnText, locale === 'de' && styles.langBtnTextActive]}>
                {t('langDe')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('offlineDownload')}</Text>
          <View style={styles.settingRow}>
            <Icon name={Icons.offlinePin} size={22} color={colors.textSecondary} />
            <Text style={styles.settingLabel}>{t('offlineDownload')}</Text>
            <Switch
              value={offlineDownloadEnabled}
              onValueChange={setOfflineDownloadEnabled}
              trackColor={{ false: colors.border, true: colors.primaryBlue }}
              thumbColor={colors.white}
            />
          </View>
          <Text style={styles.hint}>
            {offlineDownloadEnabled ? t('offlineEnabledMessage') : t('offlineDisabledMessage')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reports')}</Text>
          <Text style={styles.hint}>
            {t('tabReports')}, {t('tabPurchasePrices')}, {t('inventory')} — use the bottom tabs.
          </Text>
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  safeInner: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.sm, minWidth: 40 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  section: { marginBottom: spacing.xxl },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  langBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langBtnActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  langBtnText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  langBtnTextActive: { color: colors.white },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
