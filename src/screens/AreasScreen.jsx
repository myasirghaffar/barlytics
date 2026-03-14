/**
 * SCREEN 0 — Areas (Main Launcher). List of bar areas, summary stats.
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Icons } from "../assets/icons";
import { useInventory } from "../context/InventoryContext";
import { useLanguage } from "../context/LanguageContext";
import { colors, spacing, borderRadius } from "../theme/colors";

export default function AreasScreen({ navigation }) {
  const {
    areas,
    dbReady,
    setCurrentAreaId,
    setCurrentAreaName,
    addArea,
    updateArea,
    deleteArea,
    getReportStats
  } = useInventory();
  
  const { t } = useLanguage();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editArea, setEditArea] = useState(null);
  const [areaName, setAreaName] = useState("");
  const [stats, setStats] = useState({ totalBottles: 0, totalValue: 0, lowStock: 0 });

  useEffect(() => {
    if (!dbReady) return;
    getReportStats(null).then(setStats);
  }, [dbReady, getReportStats]);

  const onAreaPress = useCallback(
    (item) => {
      if (editMode) {
        setEditArea(item);
        setAreaName(item.name);
        setEditModalVisible(true);
      } else {
        setCurrentAreaId(item.id);
        setCurrentAreaName(item.name);
        navigation.navigate("ProductList");
      }
    },
    [editMode, navigation, setCurrentAreaId, setCurrentAreaName],
  );

  const openAddArea = useCallback(() => {
    setNewAreaName("");
    setAddModalVisible(true);
  }, []);

  const saveNewArea = useCallback(async () => {
    const name = (newAreaName || "").trim();
    if (!name) return;
    try {
      if (name.length < 2) {
        Alert.alert(t("addArea") || 'Add Area', "Area name must be at least 2 characters.");
        return;
      }
      await addArea(name);
      setAddModalVisible(false);
    } catch (err) {
      Alert.alert(t("addArea") || "Add Area", err?.message || "Failed to add area");
    }
  }, [newAreaName, addArea, t]);

  const saveEditArea = useCallback(async () => {
    const name = (areaName || "").trim();
    if (!name || !editArea) return;
    try {
      if (name.length < 2) {
        Alert.alert(t("editArea") || 'Edit Area', "Area name must be at least 2 characters.");
        return;
      }
      await updateArea(editArea.id, name);
      setEditModalVisible(false);
    } catch (err) {
      Alert.alert(t("editArea") || "Edit Area", err?.message || "Failed to update area");
    }
  }, [areaName, editArea, updateArea, t]);

  const confirmDeleteArea = useCallback(() => {
    if (!editArea?.id) return;
    Alert.alert(
      t("deleteArea") || "Delete Area",
      t("deleteAreaConfirm") || "Are you sure you want to delete this area and all its products?",
      [
        { text: t("cancel") || "Cancel", style: "cancel" },
        {
          text: t("delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteArea(editArea.id);
              setEditModalVisible(false);
            } catch (err) {
              Alert.alert(t("error") || "Error", err?.message || "Failed to delete area");
            }
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
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("yourAreas")}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerBtn, editMode && styles.headerBtnActive]}
            onPress={() => setEditMode(!editMode)}
            activeOpacity={0.7}
          >
            <Icon
              name={Icons.edit}
              size={22}
              color={editMode ? colors.primaryBlue : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate("Settings")}
          >
            <Icon name={Icons.settings} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name={Icons.inventory2} size={20} color={colors.primaryBlue} />
            <Text style={styles.statValue}>{stats.totalBottles}</Text>
            <Text style={styles.statLabel}>{t("bottles")}</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name={Icons.euro} size={20} color="#27AE60" />
            <Text style={styles.statValue}>{stats.totalValue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>{t("value")}</Text>
          </View>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => stats.lowStock > 0 && Alert.alert(t("lowStock"), `${stats.lowStock} products are below 25%`)}
          >
            <Icon name={Icons.warning} size={20} color={colors.danger} />
            <Text style={[styles.statValue, stats.lowStock > 0 && { color: colors.danger }]}>
              {stats.lowStock}
            </Text>
            <Text style={styles.statLabel}>{t("lowStock")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t("selectArea")}</Text>

        <View style={styles.areasGrid}>
          {areas.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.areaCard, editMode && styles.areaCardEdit]}
              onPress={() => onAreaPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.areaIconWrap}>
                <Icon name={Icons.localBar} size={28} color={colors.primaryBlue} />
              </View>
              <Text style={styles.areaName} numberOfLines={2}>
                {item.name}
              </Text>
              {editMode && (
                <View style={styles.editBadge}>
                  <Icon name={Icons.edit} size={12} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Add Area Button */}
          {!editMode && (
            <TouchableOpacity
              style={[styles.areaCard, styles.addAreaCard]}
              onPress={openAddArea}
              activeOpacity={0.7}
            >
              <View style={styles.addIconWrap}>
                <Icon name={Icons.add} size={30} color={colors.primaryBlue} />
              </View>
              <Text style={[styles.areaName, { color: colors.primaryBlue }]}>
                {t("addArea") || 'Add Area'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Add Area Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("addNewArea") || 'Add New Area'}</Text>
            <TextInput
              style={styles.modalInput}
              value={newAreaName}
              onChangeText={setNewAreaName}
              placeholder={t("areaNamePlaceholder") || "Basement, Floor 1..."}
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalBtnTextCancel}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={saveNewArea}
              >
                <Text style={styles.modalBtnTextSave}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Area Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("editArea") || 'Edit Area'}</Text>
            <TextInput
              style={styles.modalInput}
              value={areaName}
              onChangeText={setAreaName}
              placeholder={editArea?.name}
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={confirmDeleteArea}
              >
                <Text style={styles.modalBtnTextDelete}>{t("delete")}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalBtnTextCancel}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={saveEditArea}
              >
                <Text style={styles.modalBtnTextSave}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerBtnActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  areasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  areaCard: {
    width: "47%",
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 140,
  },
  areaCardEdit: {
    borderColor: colors.primaryBlue,
    borderStyle: "dashed",
  },
  addAreaCard: {
    borderStyle: "dashed",
    backgroundColor: "transparent",
    borderColor: colors.primaryBlue,
  },
  areaIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  addIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 122, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  areaName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  editBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalBtnPrimary: {
    backgroundColor: colors.primaryBlue,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  modalBtnTextCancel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalBtnTextDelete: {
    fontSize: 16,
    color: colors.danger,
  },
  modalBtnTextSave: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryBlue,
  },
});
