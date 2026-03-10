/**
 * Full form to add a new product manually (name, volume, category, purchase price, image).
 * On image pick, runs bottle detection (mock), crop-to-bounds, and resize to 249px height.
 */
import React, { useState, useCallback } from "react";
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

/** Ensure URI is valid for Image (local paths get file:// on Android if needed). */
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

/** Simple validation: background-removed images should be PNG (transparency). */
const isLikelyBackgroundRemoved = (uri) => {
  if (uri == null || typeof uri !== "string") return false;
  const t = uri.trim().split("?")[0].toLowerCase();
  return t.endsWith(".png");
};

/** Mock bottle detection – replace with ML model (e.g. TensorFlow.js, ML Kit) later. */
const detectBottleInImage = async (_imagePath) => {
  return {
    detected: true,
    boundingBox: { x: 0, y: 0, width: 0, height: 0 }, // full image = no crop
  };
};

/** Resize image to exact target height (keeps aspect ratio). Uses original URI if resizer native module is not linked. */
const resizeImageToExactHeight = async (
  imageUri,
  targetHeight = TARGET_BOTTLE_HEIGHT_PX,
) => {
  const hasResizer =
    NativeModules.ImageResizer != null ||
    (Platform.OS === "android" && NativeModules.ImageResizerAndroid != null);
  if (!hasResizer) {
    return imageUri;
  }
  let ImageResizer;
  try {
    ImageResizer = require("react-native-image-resizer").default;
  } catch (_) {
    return imageUri;
  }
  if (!ImageResizer?.createResizedImage) {
    return imageUri;
  }
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
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageUploadStep, setImageUploadStep] = useState("");
  const [errors, setErrors] = useState({});

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0];
  const selectedAreaName = selectedArea?.name ?? "";

  const processPickedImage = useCallback(
    async (uri) => {
      setImageProcessing(true);
      setImageUri(uri);
      setImageUrl("");
      try {
        if (!isLikelyBackgroundRemoved(uri)) {
          Alert.alert(
            t("error") || "Error",
            t("bgRemovalRequired") ||
              "Please upload a PNG image with transparent background (background removed).",
          );
          return;
        }
        setImageUploadStep("detecting");
        const detectionResult = await detectBottleInImage(uri);
        if (!detectionResult?.detected) {
          Alert.alert(
            t("warning") || "Warning",
            t("noBottleDetectedMessage") ||
              "No bottle detected. Please use a clear bottle photo.",
          );
        }
        setImageUploadStep("resizing");
        const finalUri = await resizeImageToExactHeight(
          uri,
          TARGET_BOTTLE_HEIGHT_PX,
        );
        setImageUri(finalUri);
      } catch (err) {
        console.error("Image processing error:", err);
        Alert.alert(
          t("error") || "Error",
          t("imageProcessingFailed") ||
            "Failed to process image. Please try another image.",
        );
      } finally {
        setImageProcessing(false);
        setImageUploadStep("");
      }
    },
    [t],
  );

  const handlePickImage = useCallback(() => {
    const launchImageLibrary = RNImagePicker?.launchImageLibrary;
    if (typeof launchImageLibrary !== "function") {
      Alert.alert(
        "Image picker unavailable",
        'Please rebuild the app: run "cd ios && pod install" then rebuild. Image upload will work after that.',
      );
      return;
    }
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 1,
      },
      async (res) => {
        if (res?.didCancel || !res?.assets?.[0]?.uri) return;
        const uri = res.assets[0].uri;
        await processPickedImage(uri);
      },
    );
  }, [processPickedImage]);

  const handleRemoveImage = useCallback(() => setImageUri(null), []);

  const validate = useCallback(() => {
    const next = {};
    if (!(name || "").trim()) next.name = t("productNameRequired");
    const vol = parseInt(volume, 10);
    if (volume !== "" && (isNaN(vol) || vol < 0))
      next.volume = "Invalid volume";
    const pr = parseFloat((price || "").replace(",", "."));
    if (price !== "" && (isNaN(pr) || pr < 0)) next.price = "Invalid price";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, volume, price, t]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addProduct({
        name: name.trim(),
        volume: volume === "" ? 0 : parseInt(volume, 10),
        category: category.trim() || selectedAreaName || undefined,
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
  }, [
    name,
    volume,
    category,
    price,
    imageUri,
    imageUrl,
    selectedAreaId,
    selectedAreaName,
    addProduct,
    navigation,
    validate,
  ]);

  const openCategoryDropdown = useCallback(
    () => setCategoryDropdownVisible(true),
    [],
  );
  const closeCategoryDropdown = useCallback(
    () => setCategoryDropdownVisible(false),
    [],
  );
  const selectArea = useCallback((area) => {
    setSelectedAreaId(area.id);
    setCategoryDropdownVisible(false);
  }, []);

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
          {t("addNewProduct")}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.areaHint}>{selectedAreaName}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t("productImage")}</Text>
            <View style={styles.imageRow}>
              <TouchableOpacity
                style={styles.imageTouchable}
                onPress={handlePickImage}
                activeOpacity={0.8}
                disabled={imageProcessing}
              >
                {(imageUri || imageUrl.trim()) && !imageProcessing ? (
                  <View style={styles.imagePreviewWrap}>
                    <Image
                      source={{ uri: toImageUri(imageUri || imageUrl.trim()) }}
                      style={styles.imagePreview}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => {
                        handleRemoveImage();
                        setImageUrl("");
                      }}
                      hitSlop={8}
                    >
                      <Icon name={Icons.close} size={20} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ) : imageProcessing ? (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      styles.imageProcessingWrap,
                    ]}
                  >
                    <ActivityIndicator
                      size="small"
                      color={colors.primaryBlue}
                    />
                    <Text style={styles.imagePlaceholderText}>
                      {imageUploadStep === "detecting"
                        ? t("detectingBottle") || "Detecting bottle..."
                        : imageUploadStep === "resizing"
                        ? t("resizingImage") ||
                          `Resizing to ${TARGET_BOTTLE_HEIGHT_PX}px...`
                        : t("processing") || "Processing..."}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon
                      name={Icons.add}
                      size={32}
                      color={colors.primaryBlue}
                    />
                    <Text style={styles.imagePlaceholderText}>
                      {t("addPhoto")}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {(imageUri || imageUrl.trim()) && !imageProcessing ? (
              <Text style={styles.imageFixedHint}>{t("imageFixedHint")}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("productName")} *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(v) => {
                setName(v);
                setErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder={t("productNamePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("volumeMl")}</Text>
            <TextInput
              style={[styles.input, errors.volume && styles.inputError]}
              value={volume}
              onChangeText={(v) => {
                setVolume(v.replace(/[^0-9]/g, ""));
                setErrors((e) => ({ ...e, volume: undefined }));
              }}
              placeholder={t("volumePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
            {errors.volume ? (
              <Text style={styles.errorText}>{errors.volume}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("categoryName")}</Text>
            <TouchableOpacity
              style={styles.dropdownTouch}
              onPress={openCategoryDropdown}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedAreaName && styles.dropdownPlaceholder,
                ]}
              >
                {selectedAreaName || t("categoryNamePlaceholder")}
              </Text>
              <Icon
                name={Icons.keyboardArrowDown}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <Modal
              visible={categoryDropdownVisible}
              transparent
              animationType="fade"
              onRequestClose={closeCategoryDropdown}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={closeCategoryDropdown}
              >
                <Pressable style={styles.dropdownModal} onPress={() => {}}>
                  <Text style={styles.dropdownModalTitle}>
                    {t("categoryName")}
                  </Text>
                  <FlatList
                    data={areas}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          item.id === selectedAreaId &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => selectArea(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText}>{item.name}</Text>
                        {item.id === selectedAreaId ? (
                          <Icon
                            name={Icons.check}
                            size={22}
                            color={colors.primaryBlue}
                          />
                        ) : null}
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.dropdownEmpty}>
                        {t("noProducts")}
                      </Text>
                    }
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("purchasePrice")}</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={price}
              onChangeText={(v) => {
                setPrice(v);
                setErrors((e) => ({ ...e, price: undefined }));
              }}
              placeholder={t("purchasePricePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            {errors.price ? (
              <Text style={styles.errorText}>{errors.price}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon
                  name={Icons.check}
                  size={22}
                  color={colors.white}
                  style={styles.saveBtnIcon}
                />
                <Text style={styles.saveBtnText}>{t("saveProduct")}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  flex: {
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
    minWidth: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  areaHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  dropdownTouch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  dropdownModal: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    maxHeight: 320,
    overflow: "hidden",
  },
  dropdownModalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownItemSelected: {
    backgroundColor: colors.background,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  dropdownEmpty: {
    fontSize: 14,
    color: colors.textSecondary,
    padding: spacing.lg,
    textAlign: "center",
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  imageRow: {
    marginTop: spacing.xs,
  },
  imageTouchable: {
    alignSelf: "flex-start",
  },
  imagePlaceholder: {
    width: IMAGE_PREVIEW_SIZE,
    height: IMAGE_PREVIEW_SIZE,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
  },
  imageProcessingWrap: {
    borderStyle: "solid",
  },
  imageFixedHint: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textSecondary,
  },
  imagePreviewWrap: {
    width: IMAGE_PREVIEW_SIZE,
    height: IMAGE_PREVIEW_SIZE,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  orUrlLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  removeImageBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnIcon: {
    marginRight: spacing.sm,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
