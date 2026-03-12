/**
 * Areas / Stations list. Tap an area to open its Product List.
 * Pencil: edit mode (tap area to edit name). Gear: Settings. FAB: add category.
 */
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Icons } from "../assets/icons";

const appLogo = require("../assets/images/logo.png");
import { useInventory } from "../context/InventoryContext";
import { useLanguage } from "../context/LanguageContext";
import SearchBar from "../components/SearchBar";
import FloatingAddButton from "../components/FloatingAddButton";
import { colors, spacing, borderRadius, shadows } from "../theme/colors";

const AREA_COLORS = ["#EC4899", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

export default function AreasScreen({ navigation }) {
  const {
    areas,
    dbReady,
    setCurrentAreaId,
    setCurrentAreaName,
    updateArea,
    deleteArea,
    addArea,
    getReportStats,
  } = useInventory();
  const { t, locale, setLocale } = useLanguage();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(areas);
  const [stats, setStats] = useState({
    totalBottles: 0,
    totalValue: 0,
    lowStock: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editArea, setEditArea] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [lowStockModalVisible, setLowStockModalVisible] = useState(false);

  useEffect(() => {
    if (!dbReady) return;
    getReportStats(null).then(setStats);
  }, [dbReady, getReportStats]);

  React.useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) setFiltered(areas);
    else
      setFiltered(
        areas.filter((a) => (a.name || "").toLowerCase().includes(q)),
      );
  }, [search, areas]);

  const onAreaPress = useCallback(
    (item) => {
      if (editMode) {
        setEditArea(item);
        setCategoryName(item.name || "");
        setEditModalVisible(true);
      } else {
        setCurrentAreaId(item.id);
        setCurrentAreaName(item.name);
        navigation.navigate("ProductList");
      }
    },
    [editMode, setCurrentAreaId, setCurrentAreaName, navigation],
  );

  const openAddCategory = useCallback(() => {
    setNewCategoryName("");
    setAddModalVisible(true);
  }, []);

  const saveNewCategory = useCallback(async () => {
    const name = (newCategoryName || "").trim();
    if (!name) return;
    await addArea(name);
    setAddModalVisible(false);
  }, [newCategoryName, addArea]);

  const saveEditCategory = useCallback(async () => {
    const name = (categoryName || "").trim();
    if (!name || !editArea?.id) return;
    await updateArea(editArea.id, name);
    setEditModalVisible(false);
    setEditArea(null);
  }, [categoryName, editArea, updateArea]);

  const confirmDeleteCategory = useCallback(() => {
    if (!editArea?.id) return;
    Alert.alert(
      t("deleteCategoryTitle") || "Delete category",
      t("deleteCategoryMessage") ||
        "Do you really want to delete this category and its products?",
      [
        { text: t("cancel") || "Cancel", style: "cancel" },
        {
          text: t("delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteArea(editArea.id);
            setEditModalVisible(false);
            setEditArea(null);
          },
        },
      ],
    );
  }, [editArea, deleteArea, t]);

  if (!dbReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.safeInner}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerLogoWrap}>
              <Image
                source={appLogo}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.langSwitcher}>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  locale === "en" && styles.langBtnActive,
                ]}
                onPress={() => setLocale("en")}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    locale === "en" && styles.langBtnTextActive,
                  ]}
                >
                  {t("langEn")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  locale === "de" && styles.langBtnActive,
                ]}
                onPress={() => setLocale("de")}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    locale === "de" && styles.langBtnTextActive,
                  ]}
                >
                  {t("langDe")}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.iconBtn, editMode && styles.iconBtnActive]}
              onPress={() => setEditMode((prev) => !prev)}
            >
              <Icon
                name={Icons.edit}
                size={22}
                color={editMode ? colors.primaryBlue : colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate("Settings")}
            >
              <Icon
                name={Icons.settings}
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
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
                {typeof stats.totalValue === "number"
                  ? `${stats.totalValue.toFixed(2)} €`
                  : "0.00 €"}
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
                color={
                  stats.lowStock > 0 ? colors.danger : colors.textSecondary
                }
                style={styles.statIcon}
              />
              <Text
                style={[
                  styles.statValue,
                  stats.lowStock > 0 && styles.statValueDanger,
                ]}
              >
                {stats.lowStock}
              </Text>
              <Text style={styles.statLabel}>{t("lowStock")}</Text>
            </TouchableOpacity>
          </View>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t("searchArea")}
          />
          {editMode && (
            <View style={styles.editModeBanner}>
              <Icon name={Icons.edit} size={18} color={colors.primaryBlue} />
              <Text style={styles.editModeBannerText}>
                {t("tapItemToEdit")}
              </Text>
            </View>
          )}
          <View style={styles.sectionTitleRow}>
            <Icon
              name={Icons.folderOpen}
              size={20}
              color={colors.primaryBlue}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>{t("yourAreas")}</Text>
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Icon
                  name={Icons.inventory2}
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>{t("noAreasFound")}</Text>
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
                    {
                      backgroundColor: AREA_COLORS[index % AREA_COLORS.length],
                    },
                  ]}
                >
                  <Icon name={Icons.clipboard} size={24} color={colors.white} />
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

        <FloatingAddButton onPress={openAddCategory} />

        <Modal visible={addModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAddModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalWrap}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>{t("addCategory")}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder={t("categoryNamePlaceholder")}
                    placeholderTextColor={colors.textSecondary}
                    autoFocus
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      onPress={() => setAddModalVisible(false)}
                      style={styles.modalBtn}
                    >
                      <Text style={styles.modalBtnCancel}>{t("cancel")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={saveNewCategory}
                      style={styles.modalBtn}
                    >
                      <Text style={styles.modalBtnSave}>
                        {t("saveCategory")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>

        <Modal visible={lowStockModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLowStockModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.lowStockModalBox}>
                <View style={styles.lowStockModalHeader}>
                  <Text style={styles.lowStockModalTitle}>{t("lowStock")}</Text>
                  <TouchableOpacity
                    onPress={() => setLowStockModalVisible(false)}
                    style={styles.modalBtn}
                  >
                    <Icon
                      name={Icons.close}
                      size={24}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={(stats.products || []).filter(
                    (p) => (p.fillLevel ?? 100) < 25,
                  )}
                  keyExtractor={(item) => String(item.id)}
                  style={styles.lowStockList}
                  ListEmptyComponent={
                    <View style={styles.lowStockEmpty}>
                      <Icon
                        name={Icons.check}
                        size={32}
                        color={colors.accentGreen}
                      />
                      <Text style={styles.lowStockEmptyText}>
                        {t("noLowStockProducts") || "No low stock products"}
                      </Text>
                    </View>
                  }
                  renderItem={({ item }) => {
                    const area = areas.find((a) => a.id === item.areaId);
                    return (
                      <View style={styles.lowStockRow}>
                        <Text style={styles.lowStockRowName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.lowStockRowMeta}>
                          {item.volume ? `${item.volume} ml` : ""} ·{" "}
                          {t("fillLevel") || "Fill"}: {item.fillLevel ?? 100}%
                          {area?.name ? ` · ${area.name}` : ""}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal visible={editModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalWrap}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>{t("editCategory")}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={categoryName}
                    onChangeText={setCategoryName}
                    placeholder={t("categoryNamePlaceholder")}
                    placeholderTextColor={colors.textSecondary}
                    autoFocus
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      onPress={() => setEditModalVisible(false)}
                      style={styles.modalBtn}
                    >
                      <Text style={styles.modalBtnCancel}>{t("cancel")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={confirmDeleteCategory}
                      style={styles.modalBtn}
                    >
                      <Text style={styles.modalBtnDelete}>
                        {t("delete") || "Delete"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={saveEditCategory}
                      style={styles.modalBtn}
                    >
                      <Text style={styles.modalBtnSave}>
                        {t("saveCategory")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>
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
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  langSwitcher: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: colors.textSecondary,
  },
  langBtnTextActive: {
    color: colors.white,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  iconBtnActive: {
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statValueDanger: {
    color: colors.danger,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editModeBannerText: {
    fontSize: 13,
    color: colors.primaryBlue,
    fontWeight: "600",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 2,
    paddingTop: spacing.xs,
  },
  areaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  areaIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  areaName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
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
    fontWeight: "600",
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalWrap: { width: "100%" },
  modalBox: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
  modalBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  modalBtnCancel: { fontSize: 16, color: colors.textSecondary },
  modalBtnDelete: { fontSize: 16, fontWeight: "600", color: colors.danger },
  modalBtnSave: { fontSize: 16, fontWeight: "600", color: colors.primaryBlue },
  lowStockModalBox: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    maxHeight: "90%",
  },
  lowStockModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lowStockModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  lowStockList: {
    maxHeight: 320,
  },
  lowStockEmpty: {
    alignItems: "center",
    padding: spacing.xl,
  },
  lowStockEmptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },
  lowStockRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lowStockRowName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  lowStockRowMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
