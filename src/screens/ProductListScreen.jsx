/**
 * SCREEN 1 — Product List (Main). Area name, search, product list, FAB. Tap product to open detail.
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Icons } from "../assets/icons";
import { useInventory } from "../context/InventoryContext";
import { useLanguage } from "../context/LanguageContext";
import SearchBar from "../components/SearchBar";
import ProductItem from "../components/ProductItem";
import FloatingAddButton from "../components/FloatingAddButton";
import { colors, spacing } from "../theme/colors";

const PLACEHOLDER_IMAGE = null;

export default function ProductListScreen({ navigation }) {
  const { 
    products, 
    currentAreaName, 
    currentAreaId, 
    dbReady, 
    searchProducts, 
    updateArea, 
    refreshProducts, 
    offlineDownloadEnabled, 
    setOfflineDownloadEnabled, 
    deleteProduct 
  } = useInventory();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(products);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [editMode, setEditMode] = useState(false); // pencil on: tap item to edit
  const [editAreaVisible, setEditAreaVisible] = useState(false);
  const [editAreaName, setEditAreaName] = useState(currentAreaName);

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
    [products, searchProducts],
  );

  React.useEffect(() => {
    if (!search.trim()) setFiltered(products);
  }, [products, search]);

  const handleAddProduct = () => {
    navigation.navigate("AddNewProduct");
  };

  const handleProductPress = useCallback(
    (item) => {
      if (editMode) {
        Alert.alert(
          t("editProduct") || "Edit product",
          item?.name || "",
          [
            {
              text: t("edit") || "Edit",
              onPress: () => navigation.navigate("EditProduct", { product: item }),
            },
            {
              text: t("delete") || "Delete",
              style: "destructive",
              onPress: () => {
                Alert.alert(
                  t("deleteProductTitle") || "Delete product",
                  t("deleteProductMessage") || "Do you really want to delete this product?",
                  [
                    { text: t("cancel") || "Cancel", style: "cancel" },
                    {
                      text: t("delete") || "Delete",
                      style: "destructive",
                      onPress: async () => {
                        await deleteProduct(item.id);
                        // Keep current search filter in sync
                        if (search.trim()) {
                          const list = await searchProducts(search);
                          setFiltered(list);
                        }
                      },
                    },
                  ],
                );
              },
            },
            { text: t("cancel") || "Cancel", style: "cancel" },
          ],
        );
      } else {
        navigation.navigate("ProductDetail", { product: item });
      }
    },
    [navigation, editMode, t, deleteProduct, search, searchProducts],
  );

  const renderItem = useCallback(
    ({ item }) => {
      const itemContent = (
        <ProductItem
          name={item.name}
          volume={item.volume}
          image={item.image || PLACEHOLDER_IMAGE}
          statusOk={item.fillLevel > 25}
          fillLevel={item.fillLevel}
          onPress={() => handleProductPress(item)}
        />
      );
      if (viewMode === "grid") {
        return <View style={styles.gridItemWrap}>{itemContent}</View>;
      }
      return itemContent;
    },
    [handleProductPress, viewMode],
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  const openEditArea = useCallback(() => {
    setEditAreaName(currentAreaName);
    setEditAreaVisible(true);
  }, [currentAreaName]);

  const saveAreaName = useCallback(async () => {
    const name = (editAreaName || "").trim();
    if (!name || !currentAreaId) return;
    try {
      if (name.length < 2) {
        Alert.alert(t("editArea") || 'Edit Area', "Area name must be at least 2 characters.");
        return;
      }
      await updateArea(currentAreaId, name);
      setEditAreaVisible(false);
    } catch (err) {
      Alert.alert(t("error") || "Error", err?.message || "Failed to update area");
    }
  }, [editAreaName, currentAreaId, updateArea, t]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "list" ? "grid" : "list"));
  }, []);

  const handleOfflineToggle = useCallback(
    (value) => {
      setOfflineDownloadEnabled(value);
      if (value) {
        refreshProducts();
        Alert.alert(t("offlineDownload"), t("offlineEnabledMessage"));
      } else {
        Alert.alert(t("offlineDownload"), t("offlineDisabledMessage"));
      }
    },
    [setOfflineDownloadEnabled, refreshProducts, t],
  );

  if (!dbReady) {
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerCenter}
          onLongPress={openEditArea}
          delayLongPress={400}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentAreaName}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, editMode && styles.iconBtnActive]}
            onPress={toggleEditMode}
          >
            <Icon
              name={Icons.edit}
              size={22}
              color={editMode ? colors.primaryBlue : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleViewMode}>
            <Icon
              name={viewMode === "list" ? Icons.viewModule : Icons.viewList}
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <SearchBar
          value={search}
          onChangeText={doSearch}
          placeholder={t("searchProduct") || "Search products"}
        />
        {editMode && (
          <View style={styles.editModeBanner}>
            <Icon name={Icons.edit} size={18} color={colors.primaryBlue} />
            <Text style={styles.editModeBannerText}>{t("tapItemToEdit")}</Text>
          </View>
        )}
        <View style={styles.offlineRow}>
          <Icon
            name={Icons.offlinePin}
            size={20}
            color={colors.textSecondary}
            style={styles.offlineIcon}
          />
          <Text style={styles.offlineLabel}>{t("offlineDownload")}</Text>
          <Switch
            value={offlineDownloadEnabled}
            onValueChange={handleOfflineToggle}
            trackColor={{ false: colors.border, true: colors.primaryBlue }}
            thumbColor={colors.white}
          />
        </View>

        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode}
          contentContainerStyle={[styles.listContent, viewMode === "grid" && styles.gridListContent]}
          columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon
                name={Icons.localBar}
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.empty}>{t("noProducts")}</Text>
              <Text style={styles.emptyHint}>{t("emptyHintAdd")}</Text>
            </View>
          }
        />
      </View>

      <Modal
        visible={editAreaVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditAreaVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditAreaVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContentWrap}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.editAreaBox}>
                <Text style={styles.editAreaTitle}>{t("area") || 'Area'}</Text>
                <TextInput
                  style={styles.editAreaInput}
                  value={editAreaName}
                  onChangeText={setEditAreaName}
                  placeholder={currentAreaName}
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                />
                <View style={styles.editAreaActions}>
                  <TouchableOpacity style={styles.editAreaBtn} onPress={() => setEditAreaVisible(false)}>
                    <Text style={styles.editAreaBtnTextCancel}>{t("cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editAreaBtn} onPress={saveAreaName}>
                    <Text style={styles.editAreaBtnTextSave}>{t("save")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      <FloatingAddButton onPress={handleAddProduct} />
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  iconBtnActive: {
    backgroundColor: colors.background,
    borderRadius: 8,
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
  content: {
    flex: 1,
    padding: spacing.md,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: spacing.md,
    paddingHorizontal: 2,
  },
  gridListContent: {
    paddingHorizontal: 0,
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  gridItemWrap: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalContentWrap: {
    width: "100%",
  },
  editAreaBox: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.xl,
  },
  editAreaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  editAreaInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  editAreaActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
  editAreaBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  editAreaBtnTextCancel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  editAreaBtnTextSave: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryBlue,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  empty: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: 16,
  },
  emptyHint: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 14,
  },
  offlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
});
