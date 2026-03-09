/**
 * Reports / Result Lists. Total bottles, stock value, low stock; export PDF/Excel.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Icon, Icons } from '../assets/icons';
import { useInventory } from '../context/InventoryContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

export default function ReportsScreen({ navigation }) {
  const { getReportStats, getSessions, dbReady } = useInventory();
  const { t, locale } = useLanguage();
  const [stats, setStats] = useState({ totalBottles: 0, totalValue: 0, lowStock: 0 });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [s, sess] = await Promise.all([getReportStats(), getSessions()]);
    setStats(s);
    setSessions(sess || []);
    setLoading(false);
  }, [getReportStats, getSessions]);

  useEffect(() => {
    if (dbReady) load();
  }, [dbReady, load]);

  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString(localeTag, { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (v) =>
    Number(v).toLocaleString(localeTag, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  if (!dbReady || loading) {
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
          <Icon name={Icons.assessment} size={24} color={colors.primaryBlue} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>{t('reports')}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, shadows.card]}>
            <Icon name={Icons.inventory2} size={28} color={colors.primaryBlue} style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.totalBottles}</Text>
            <Text style={styles.statLabel}>{t('totalBottles')}</Text>
          </View>
          <View style={[styles.statCard, shadows.card]}>
            <Icon name={Icons.euro} size={28} color={colors.accentGreen} style={styles.statIcon} />
            <Text style={styles.statValue}>{formatCurrency(stats.totalValue)}</Text>
            <Text style={styles.statLabel}>{t('stockValue')}</Text>
          </View>
          <View style={[styles.statCard, shadows.card]}>
            <Icon name={Icons.warning} size={28} color={stats.lowStock > 0 ? colors.danger : colors.textSecondary} style={styles.statIcon} />
            <Text style={[styles.statValue, stats.lowStock > 0 && styles.lowStock]}>
              {stats.lowStock}
            </Text>
            <Text style={styles.statLabel}>{t('lowStock')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={styles.th}>{t('area')}</Text>
            <Text style={styles.th}>{t('date')}</Text>
            <Text style={styles.th}>{t('team')}</Text>
          </View>
          {sessions.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon name={Icons.history} size={48} color={colors.textSecondary} />
              <Text style={styles.empty}>{t('noSessionsYet')}</Text>
            </View>
          ) : (
            sessions.map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <Text style={styles.cell}>{s.areaName || '—'}</Text>
                <Text style={styles.cell}>{formatDate(s.date || s.createdAt)}</Text>
                <View style={styles.teamBadge}>
                  <Text style={styles.teamText}>{s.team || 'To'}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn}>
            <Icon name={Icons.pictureAsPdf} size={22} color={colors.white} />
            <Text style={styles.exportBtnText}>{t('exportPdf')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Icon name={Icons.tableChart} size={22} color={colors.white} />
            <Text style={styles.exportBtnText}>{t('exportExcel')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lowStock: {
    color: colors.danger,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.xl,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  th: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  teamBadge: {
    backgroundColor: colors.accentYellow,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
  },
  teamText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  exportRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
