/**
 * Reports / Result Lists. Total bottles, stock value, low stock; export PDF/Excel.
 */
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  Alert,
} from "react-native";
import Share from "react-native-share";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Icons } from "../assets/icons";
import { useInventory } from "../context/InventoryContext";
import { useLanguage } from "../context/LanguageContext";
import { colors, spacing, borderRadius, shadows } from "../theme/colors";
import RNFS from "react-native-fs";
import { generatePDF } from "react-native-html-to-pdf";


export default function ReportsScreen({ navigation }) {
  const { getReportStats, getSessions, dbReady, categories } = useInventory();
  const { t, locale } = useLanguage();
  const [stats, setStats] = useState({
    totalBottles: 0,
    totalValue: 0,
    lowStock: 0,
    products: [],
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockModalVisible, setLowStockModalVisible] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const load = useCallback(async () => {
    // Use global stats (all categories)
    const [s, sess] = await Promise.all([getReportStats(null), getSessions()]);
    setStats(s);
    setSessions(sess || []);
    setLoading(false);
  }, [getReportStats, getSessions]);

  useEffect(() => {
    if (dbReady) load();
  }, [dbReady, load]);

  const localeTag = locale === "de" ? "de-DE" : "en-US";
  const formatDate = useCallback(
    (dateStr) => {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      return d.toLocaleDateString(localeTag, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    [localeTag]
  );

  const formatCurrency = useCallback(
    (v) =>
      Number(v).toLocaleString(localeTag, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " €",
    [localeTag]
  );

  const shareFile = useCallback(async (filePath, mimeType, title) => {
    try {
      const shareOptions = {
        title,
        url: Platform.OS === "android" ? `file://${filePath}` : filePath,
        type: mimeType,
        failOnCancel: false,
        saveToFiles: true, // Enables "Save to Files" on iOS
      };
      await Share.open(shareOptions);
    } catch (e) {
      if (e.message?.includes("User did not share") || e.message?.includes("User cancelled")) return;
      Alert.alert(t("error") || "Error", e?.message || "Share failed");
    }
  }, [t]);

  const handleExportPdf = useCallback(async () => {

    setExportingPdf(true);
    try {
      const productsRows = (stats.products || [])
        .map((p) => {
          const area = categories.find((a) => a.id === p.categoryId);
          return `<tr>
            <td>${(p.name || "—").replace(/</g, "&lt;")}</td>
            <td>${(area?.name || "—").replace(/</g, "&lt;")}</td>
            <td>${p.volume || 0}</td>
            <td>${formatCurrency(p.price || 0)}</td>
            <td>${p.fillLevel ?? 100}%</td>
            <td>${p.fullBottles || 0}</td>
          </tr>`;
        })
        .join("");

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #333; }
    h1 { color: #1a365d; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    h2 { color: #2d3748; font-size: 18px; margin-top: 30px; margin-bottom: 15px; }
    .stats-container { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
    .stat-card { flex: 1; min-width: 150px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-label { display: block; font-size: 12px; color: #64748b; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 20px; font-weight: bold; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${(t("reports") || "Reports").replace(/</g, "&lt;")}</h1>
  
  <div class="stats-container">
    <div class="stat-card">
      <span class="stat-label">${t("totalBottles") || "Total bottles"}</span>
      <span class="stat-value">${stats.totalBottles}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">${t("stockValue") || "Stock value"}</span>
      <span class="stat-value">${formatCurrency(stats.totalValue)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">${t("lowStock") || "Low stock"}</span>
      <span class="stat-value" style="color: ${stats.lowStock > 0 ? "#ef4444" : "#1e293b"}">${stats.lowStock}</span>
    </div>
  </div>

  <h2>${t("totalBottles") || "Total bottles"} Details</h2>
  <table>
    <thead>
      <tr>
        <th>${t("productName") || "Product"}</th>
        <th>${t("area") || "Category"}</th>
        <th>${t("volumeMl") || "Volume (ml)"}</th>
        <th>${t("priceEuro") || "Price"}</th>
        <th>${t("fillLevel") || "Fill"}</th>
        <th>${t("fullBottles") || "Full"}</th>
      </tr>
    </thead>
    <tbody>
      ${productsRows || '<tr><td colspan="6" style="text-align:center;">No products data</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    Generated by Barlytics on ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

      const result = await generatePDF({
        html,
        fileName: `barlytics-report-${Date.now()}`,
        base64: false,
      });

      const path = result?.filePath;
      if (path) {
        const platformPath = Platform.OS === "android" ? `file://${path}` : path;
        await shareFile(platformPath, "application/pdf", t("exportPdf") || "Export PDF");
      }
    } catch (e) {
      console.error("PDF Export Error:", e);
      Alert.alert(t("error") || "Error", e?.message || "PDF export failed.");
    } finally {
      setExportingPdf(false);
    }
  }, [stats, categories, formatCurrency, t, shareFile]);

  const handleExportExcel = useCallback(async () => {
    setExportingExcel(true);
    try {
      const XLSX = require("xlsx");
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        [t("reports") || "Reports"],
        [],
        [t("totalBottles") || "Total bottles", stats.totalBottles],
        [t("stockValue") || "Stock value", stats.totalValue],
        [t("lowStock") || "Low stock", stats.lowStock],
        [t("date") || "Date", formatDate(new Date())],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // Products Sheet
      const productsData = [
        [
          t("productName") || "Product",
          t("area") || "Category",
          t("volumeMl") || "Volume (ml)",
          t("priceEuro") || "Price",
          t("fillLevel") || "Fill (%)",
          t("fullBottles") || "Full Bottles",
        ],
        ...(stats.products || []).map((p) => {
          const area = categories.find((a) => a.id === p.categoryId);
          return [
            p.name || "—",
            area?.name || "—",
            p.volume || 0,
            p.price || 0,
            p.fillLevel ?? 100,
            p.fullBottles || 0,
          ];
        }),
      ];
      const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(wb, wsProducts, "Products");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const dir = RNFS.CachesDirectoryPath || RNFS.DocumentDirectoryPath;
      const filePath = `${dir}/barlytics-report-${Date.now()}.xlsx`;

      await RNFS.writeFile(filePath, wbout, "base64");

      const platformPath = Platform.OS === "android" ? `file://${filePath}` : filePath;
      await shareFile(
        platformPath,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        t("exportExcel") || "Export Excel"
      );
    } catch (e) {
      console.error("Excel Export Error:", e);
      Alert.alert(t("error") || "Error", e?.message || "Excel export failed.");
    } finally {
      setExportingExcel(false);
    }
  }, [stats, categories, formatDate, t, shareFile]);


  if (!dbReady || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.safeInner}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon
              name={Icons.assessment}
              size={24}
              color={colors.primaryBlue}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>{t("reports")}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
        >
          <View style={styles.statsRow}>
            <View style={[styles.statCard, shadows.card]}>
              <Icon
                name={Icons.inventory2}
                size={28}
                color={colors.primaryBlue}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{stats.totalBottles}</Text>
              <Text style={styles.statLabel}>{t("totalBottles")}</Text>
            </View>
            <View style={[styles.statCard, shadows.card]}>
              <Icon
                name={Icons.euro}
                size={28}
                color={colors.accentGreen}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>
                {formatCurrency(stats.totalValue)}
              </Text>
              <Text style={styles.statLabel}>{t("stockValue")}</Text>
            </View>
            <TouchableOpacity
              style={[styles.statCard, shadows.card]}
              onPress={() => setLowStockModalVisible(true)}
              activeOpacity={0.8}
            >
              <Icon
                name={Icons.warning}
                size={28}
                color={stats.lowStock > 0 ? colors.danger : colors.textSecondary}
                style={styles.statIcon}
              />
              <Text style={[styles.statValue, stats.lowStock > 0 && styles.lowStock]}>
                {stats.lowStock}
              </Text>
              <Text style={styles.statLabel}>{t("lowStock")}</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={lowStockModalVisible} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLowStockModalVisible(false)}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View style={styles.lowStockModalBox}>
                  <View style={styles.lowStockModalHeader}>
                    <Text style={styles.lowStockModalTitle}>{t("lowStock")}</Text>
                    <TouchableOpacity onPress={() => setLowStockModalVisible(false)}>
                      <Icon name={Icons.close} size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={(stats.products || []).filter((p) => (p.fillLevel ?? 100) < 25)}
                    keyExtractor={(item) => String(item.id)}
                    style={styles.lowStockList}
                    renderItem={({ item }) => {
                      return (
                        <View style={styles.lowStockRow}>
                          <Text style={styles.lowStockRowName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.lowStockRowMeta}>
                            {item.volume ? `${item.volume} ml` : ""} ·{" "}
                            {t("fillLevel") || "Fill"}: {item.fillLevel ?? 100}%
                          </Text>
                        </View>
                      );
                    }}
                  />
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          <View style={styles.section}>
            <View style={styles.tableHeader}>
              <Text style={styles.th}>{t("area")}</Text>
              <Text style={styles.th}>{t("date")}</Text>
              <Text style={styles.th}>{t("team")}</Text>
            </View>
            {sessions.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon name={Icons.history} size={48} color={colors.textSecondary} />
                <Text style={styles.empty}>{t("noSessionsYet")}</Text>
              </View>
            ) : (
              sessions.map((s) => (
                <View key={s.id} style={styles.sessionRow}>
                  <Text style={styles.cell}>{s.categoryName || s.areaName || "—"}</Text>
                  <Text style={styles.cell}>{formatDate(s.date || s.createdAt)}</Text>
                  <View style={styles.teamBadge}>
                    <Text style={styles.teamText}>{s.team || "To"}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.exportRow}>
            <TouchableOpacity style={[styles.exportBtn, exportingPdf && styles.exportBtnDisabled]} onPress={handleExportPdf} disabled={exportingPdf}>
              {exportingPdf ? <ActivityIndicator size="small" color={colors.white} /> : <Icon name={Icons.pictureAsPdf} size={22} color={colors.white} />}
              <Text style={styles.exportBtnText}>{t("exportPdf")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportBtn, exportingExcel && styles.exportBtnDisabled]} onPress={handleExportExcel} disabled={exportingExcel}>
              {exportingExcel ? <ActivityIndicator size="small" color={colors.white} /> : <Icon name={Icons.tableChart} size={22} color={colors.white} />}
              <Text style={styles.exportBtnText}>{t("exportExcel")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  safeInner: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.cardBackground, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  content: { flex: 1 },
  contentInner: { padding: spacing.md, paddingBottom: 100 },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, padding: spacing.md, alignItems: "center" },
  statIcon: { marginBottom: spacing.sm },
  statValue: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  lowStock: { color: colors.danger },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  section: { marginBottom: spacing.xl },
  tableHeader: { flexDirection: "row", paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.background, borderRadius: borderRadius.sm, marginBottom: spacing.xs },
  th: { flex: 1, fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  sessionRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, marginBottom: spacing.sm, ...shadows.card },
  cell: { flex: 1, fontSize: 14, color: colors.textPrimary },
  teamBadge: { backgroundColor: colors.accentYellow, paddingVertical: 4, paddingHorizontal: 10, borderRadius: borderRadius.full },
  teamText: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },
  emptyWrap: { alignItems: "center", padding: spacing.xl },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.md },
  exportRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  exportBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.primaryBlue, paddingVertical: spacing.md, borderRadius: borderRadius.md },
  exportBtnText: { fontSize: 14, fontWeight: "600", color: colors.white },
  exportBtnDisabled: { opacity: 0.7 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
  lowStockModalBox: { backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg, marginHorizontal: spacing.lg, maxHeight: "90%" },
  lowStockModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  lowStockModalTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  lowStockList: { maxHeight: 320 },
  lowStockRow: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  lowStockRowName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  lowStockRowMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
