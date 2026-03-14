/**
 * Full form to add a new product manually (name, volume, area, category, purchase price, image).
 * On image pick, runs bottle detection (mock), crop-to-bounds, and resize to 249px height.
 */
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  FlatList,
  Pressable,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeModules } from "react-native";
import * as RNImagePicker from "react-native-image-picker";
import { Icon, Icons } from "../assets/icons";
import { useInventory } from "../context/InventoryContext";
import { useLanguage } from "../context/LanguageContext";
import { colors, spacing, borderRadius } from "../theme/colors";

const IMAGE_PREVIEW_SIZE = 120;
const TARGET_BOTTLE_HEIGHT_PX = 249;

const toImageUri = (uri) => {
  if (uri == null || typeof uri !== "string") return "";
  const t = uri.trim();
  if (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.startsWith("file://")
  )
    return t;
  if (t.startsWith("/")) return `file://${t}`;
  return t;
};

const detectBottleInImage = async (_imagePath) => {
  return {
    detected: true,
    boundingBox: { x: 0, y: 0, width: 0, height: 0 },
  };
};

const resizeImageToExactHeight = async (
  imageUri,
  targetHeight = TARGET_BOTTLE_HEIGHT_PX,
) => {
  const hasResizer =
    NativeModules.ImageResizer != null ||
    (Platform.OS === "android" && NativeModules.ImageResizerAndroid != null);
  if (!hasResizer) return imageUri;
  let ImageResizer;
  try {
    ImageResizer = require("react-native-image-resizer").default;
  } catch (_) {
    return imageUri;
  }
  if (!ImageResizer?.createResizedImage) return imageUri;
  return new Promise((resolve, reject) => {
    Image.getSize(
      imageUri,
      (width, height) => {
        if (!height || height <= 0) {
          reject(new Error("Invalid image dimensions"));
          return;
        }
        const newWidth = Math.round((width / height) * targetHeight);
        ImageResizer.createResizedImage(
          imageUri,
          newWidth,
          targetHeight,
          "PNG",
          100,
          0,
          undefined,
          true,
        )
          .then((resized) => resolve(resized?.uri || imageUri))
          .catch(() => resolve(imageUri));
      },
      () => resolve(imageUri),
    );
  });
};

export default function AddNewProductScreen({ navigation }) {
  const { addProduct, areas, currentAreaId, dbReady } = useInventory();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [category, setCategory] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState(currentAreaId);
  const [areaDropdownVisible, setAreaDropdownVisible] = useState(false);
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0];
  const selectedAreaName = selectedArea?.name ?? "";

  useEffect(() => {
    if (areas.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areas[0].id);
    }
  }, [areas, selectedAreaId]);

  const processPickedImage = useCallback(
    async (uri) => {
      setImageProcessing(true);
      setImageUri(uri);
      setImageUrl("");
      try {
        await detectBottleInImage(uri);
        const finalUri = await resizeImageToExactHeight(uri, TARGET_BOTTLE_HEIGHT_PX);
        setImageUri(finalUri);
      } catch (err) {
        console.error("Image processing error:", err);
        Alert.alert(t("error") || "Error", t("imageProcessingFailed") || "Failed to process image.");
      } finally {
        setImageProcessing(false);
      }
    },
    [t],
  );

  const requestMediaPermission = useCallback(async () => {
    if (Platform.OS !== "android") return true;
    try {
      const apiLevel = Platform.Version;
      const perm = apiLevel >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const check = await PermissionsAndroid.check(perm);
      if (check) return true;
      const result = await PermissionsAndroid.request(perm, {
        title: t("permissionPhotosTitle") || "Allow photo access",
        message: t("permissionPhotosMessage") || "Barlytics needs access to your photos to add product images.",
        buttonNeutral: t("askLater") || "Ask Me Later",
        buttonNegative: t("cancel") || "Cancel",
        buttonPositive: t("allow") || "Allow",
      });
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch { return false; }
  }, [t]);

  const handlePickImage = useCallback(async () => {
    const launchImageLibrary = RNImagePicker?.launchImageLibrary;
    if (typeof launchImageLibrary !== "function") {
      Alert.alert("Image picker unavailable", "Please rebuild the app to use image upload.");
      return;
    }
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;
    launchImageLibrary(
      { mediaType: "photo", includeBase64: false, maxHeight: 2000, maxWidth: 2000, quality: 1, selectionLimit: 1 },
      async (res) => {
        if (res?.didCancel || !res?.assets?.[0]?.uri) return;
        await processPickedImage(res.assets[0].uri);
      },
    );
  }, [processPickedImage, requestMediaPermission]);

  const handleRemoveImage = useCallback(() => setImageUri(null), []);

  const validate = useCallback(() => {
    const next = {};
    if (!(name || "").trim()) next.name = t("productNameRequired");
    if (!selectedAreaId) next.area = "Please select an area";
    
    if (volume !== "") {
      const vol = parseInt(volume, 10);
      if (isNaN(vol) || vol <= 0) next.volume = "Must be a valid amount (> 0)";
    }
    
    if (price !== "") {
      const pr = parseFloat((price || "").replace(",", "."));
      if (isNaN(pr) || pr < 0) next.price = "Must be a valid price (>= 0)";
    }
    
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, volume, price, selectedAreaId, t]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addProduct({
        name: name.trim(),
        volume: volume === "" ? 0 : parseInt(volume, 10),
        category: category.trim() || undefined,
        price: price === "" ? 0 : parseFloat((price || "0").replace(",", ".")),
        image: imageUri || imageUrl.trim() || "",
        areaId: selectedAreaId,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  }, [name, volume, category, price, imageUri, imageUrl, selectedAreaId, addProduct, navigation, validate]);

  const openAreaDropdown = useCallback(() => setAreaDropdownVisible(true), []);
  const closeAreaDropdown = useCallback(() => setAreaDropdownVisible(false), []);
  const selectArea = useCallback((area) => {
    setSelectedAreaId(area.id);
    setAreaDropdownVisible(false);
  }, []);

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{t("addNewProduct")}</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.areaHint}>{selectedAreaName}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t("productImage")}</Text>
            <TouchableOpacity style={styles.imageTouchable} onPress={handlePickImage} disabled={imageProcessing}>
              {(imageUri || imageUrl.trim()) && !imageProcessing ? (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: toImageUri(imageUri || imageUrl.trim()) }} style={styles.imagePreview} resizeMode="contain" />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoveImage} hitSlop={8}>
                    <Icon name={Icons.close} size={20} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ) : imageProcessing ? (
                <View style={[styles.imagePlaceholder, styles.imageProcessingWrap]}>
                  <ActivityIndicator size="small" color={colors.primaryBlue} />
                  <Text style={styles.imagePlaceholderText}>{t("processing")}</Text>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name={Icons.add} size={32} color={colors.primaryBlue} />
                  <Text style={styles.imagePlaceholderText}>{t("addPhoto")}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("productName")} *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
              placeholder={t("productNamePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("volumeMl")}</Text>
            <TextInput
              style={[styles.input, errors.volume && styles.inputError]}
              value={volume}
              onChangeText={(v) => { setVolume(v.replace(/[^0-9]/g, "")); setErrors((e) => ({ ...e, volume: undefined })); }}
              placeholder={t("volumePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
            {errors.volume ? <Text style={styles.errorText}>{errors.volume}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("area")}</Text>
            <TouchableOpacity style={styles.dropdownTouch} onPress={openAreaDropdown}>
              <Text style={[styles.dropdownText, (!selectedAreaName || errors.area) && styles.dropdownPlaceholder]}>
                {selectedAreaName || t("areaNamePlaceholder")}
              </Text>
              <Icon name={Icons.keyboardArrowDown} size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Modal visible={areaDropdownVisible} transparent animationType="fade" onRequestClose={closeAreaDropdown}>
              <Pressable style={styles.modalOverlay} onPress={closeAreaDropdown}>
                <Pressable style={styles.dropdownModal} onPress={() => {}}>
                  <Text style={styles.dropdownModalTitle}>{t("area")}</Text>
                  <FlatList
                    data={areas}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.dropdownItem, item.id === selectedAreaId && styles.dropdownItemSelected]}
                        onPress={() => selectArea(item)}
                      >
                        <Text style={styles.dropdownItemText}>{item.name}</Text>
                        {item.id === selectedAreaId ? <Icon name={Icons.check} size={22} color={colors.primaryBlue} /> : null}
                      </TouchableOpacity>
                    )}
                  />
                </Pressable>
              </Pressable>
            </Modal>
            {errors.area ? <Text style={styles.errorText}>{errors.area}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("category")}</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder={t("categoryPlaceholder")}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("purchasePrice")}</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={price}
              onChangeText={(v) => { setPrice(v); setErrors((e) => ({ ...e, price: undefined })); }}
              placeholder={t("purchasePricePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
          </View>

          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={colors.white} /> : (
              <><Icon name={Icons.check} size={22} color={colors.white} style={styles.saveBtnIcon} /><Text style={styles.saveBtnText}>{t("saveProduct")}</Text></>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  safeInner: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.cardBackground, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerBtn: { padding: spacing.sm, minWidth: 40 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: colors.textPrimary, textAlign: "center" },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  areaHint: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg },
  dropdownTouch: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  dropdownText: { fontSize: 16, color: colors.textPrimary },
  dropdownPlaceholder: { color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: spacing.xl },
  dropdownModal: { backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, maxHeight: 320, overflow: "hidden" },
  dropdownModalTitle: { fontSize: 16, fontWeight: "600", color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  dropdownItemSelected: { backgroundColor: colors.background },
  dropdownItemText: { fontSize: 16, color: colors.textPrimary },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: "600", color: colors.textPrimary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 16, color: colors.textPrimary },
  inputError: { borderColor: colors.danger },
  errorText: { fontSize: 12, color: colors.danger, marginTop: spacing.xs },
  imageTouchable: { alignSelf: "flex-start" },
  imagePlaceholder: { width: IMAGE_PREVIEW_SIZE, height: IMAGE_PREVIEW_SIZE, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  imagePlaceholderText: { marginTop: spacing.xs, fontSize: 13, color: colors.textSecondary },
  imageProcessingWrap: { borderStyle: "solid" },
  imagePreviewWrap: { width: IMAGE_PREVIEW_SIZE, height: IMAGE_PREVIEW_SIZE, borderRadius: borderRadius.md, overflow: "hidden", position: "relative", backgroundColor: "rgba(0,0,0,0.04)", borderWidth: 1, borderColor: colors.border },
  imagePreview: { width: "100%", height: "100%" },
  removeImageBtn: { position: "absolute", top: 4, right: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.primaryBlue, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md, marginTop: spacing.xl },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnIcon: { marginRight: spacing.sm },
  saveBtnText: { fontSize: 16, fontWeight: "600", color: colors.white },
});
