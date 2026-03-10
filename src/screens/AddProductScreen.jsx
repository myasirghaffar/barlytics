/**
 * SCREEN 2 — Product Catalog Add. Search catalog, select multiple products, add to DB.
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Icons } from "../assets/icons";
import { useInventory } from "../context/InventoryContext";
import { useLanguage } from "../context/LanguageContext";
import SearchBar from "../components/SearchBar";
import ProductItem from "../components/ProductItem";
import { colors, spacing } from "../theme/colors";

// Catalog entries (product catalogue); images resolved via bottleImages.js.
const MOCK_CATALOG = [
  { id: "c1", name: "Botran 18 Anejo Rum", volume: 700 },
  { id: "c2", name: "Ableforths Rumbullion!", volume: 700 },
  { id: "c3", name: "Angostura Premium Rum Reserva", volume: 1000 },
  { id: "c3b", name: "Angostura Premium Rum Reserva", volume: 700 },
  { id: "c4", name: "Ardbeg Drum", volume: 700 },
  { id: "c5", name: "Ayrum Verdejo blanco", volume: 750 },
  { id: "c6", name: "Banks 5 Island Blend Rum", volume: 700 },
  { id: "c7", name: "Aperol Aperitivo Italiano", volume: 700 },
  { id: "c8", name: "Campari", volume: 700 },
  { id: "c9", name: "Heineken", volume: 330 },
  { id: "c10", name: "Red Bull", volume: 355 },
  { id: "c11", name: "Belsazar Red", volume: 750 },
  { id: "c12", name: "Sierra Milenario Reposado", volume: 700 },
];

function filterCatalog(list, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => p.name.toLowerCase().includes(q));
}

export default function AddProductScreen({ navigation }) {
  const { addProducts, currentAreaName, dbReady } = useInventory();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const catalog = filterCatalog(MOCK_CATALOG, search);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(async () => {
    if (selected.size === 0) return;
    setSaving(true);
    const toAdd = catalog.filter((p) => selected.has(p.id));
    const products = toAdd.map((p) => ({ name: p.name, volume: p.volume }));
    await addProducts(products);
    setSaving(false);
    navigation.goBack();
  }, [selected, catalog, addProducts, navigation]);

  const renderItem = useCallback(
    ({ item }) => (
      <ProductItem
        name={item.name}
        volume={item.volume}
        image={null}
        metaText={t("measurable")}
        showCheckbox
        selected={selected.has(item.id)}
        onSelect={() => toggleSelect(item.id)}
        onPress={() => toggleSelect(item.id)}
      />
    ),
    [selected, toggleSelect, t],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  if (!dbReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <View style={styles.safeInner}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentAreaName}
        </Text>
        <TouchableOpacity
          onPress={handleAdd}
          disabled={selected.size === 0 || saving}
          style={styles.headerAddBtn}
        >
          <Icon
            name={Icons.addCircleOutline}
            size={20}
            color={
              selected.size === 0 || saving
                ? colors.textSecondary
                : colors.primaryBlue
            }
            style={styles.addBtnIcon}
          />
          <Text
            style={[
              styles.addBtn,
              (selected.size === 0 || saving) && styles.addBtnDisabled,
            ]}
          >
            {t("add")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.addNewCard}
          onPress={() => navigation.navigate("AddNewProduct")}
          activeOpacity={0.7}
        >
          <Icon
            name={Icons.add}
            size={24}
            color={colors.primaryBlue}
            style={styles.addNewIcon}
          />
          <Text style={styles.addNewText}>{t("addNewProduct")}</Text>
          <Icon
            name={Icons.chevronRight}
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t("catalogPlaceholder")}
          style={styles.searchBar}
        />
        <FlatList
          data={catalog}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon
                name={Icons.searchOff}
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>{t("noProductsFound")}</Text>
              <Text style={styles.emptyHint}>{t("tryDifferentSearch")}</Text>
            </View>
          }
        />
      </View>
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}
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
  headerAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
  },
  addBtnIcon: {
    marginRight: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  addBtn: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryBlue,
  },
  addBtnDisabled: {
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  addNewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addNewIcon: {
    marginRight: spacing.sm,
  },
  addNewText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  searchBar: {
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl, 
    paddingHorizontal: 2,
    paddingTop: spacing.md,
    
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyHint: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});
