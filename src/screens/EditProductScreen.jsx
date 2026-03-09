/**
 * Edit an existing product (name, volume, category, price, image).
 * Opened from ProductListScreen when in edit mode and user taps a product.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as RNImagePicker from 'react-native-image-picker';
import { Icon, Icons } from '../assets/icons';
import { useInventory } from '../context/InventoryContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing, borderRadius } from '../theme/colors';

const IMAGE_PREVIEW_SIZE = 120;

export default function EditProductScreen({ route, navigation }) {
  const product = route.params?.product;
  const { updateProduct, currentAreaName, dbReady } = useInventory();
  const { t } = useLanguage();
  const [name, setName] = useState(product?.name ?? '');
  const [volume, setVolume] = useState(product?.volume != null ? String(product.volume) : '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : '');
  const [imageUri, setImageUri] = useState(null);
  const [imageUrl, setImageUrl] = useState(product?.image && typeof product.image === 'string' ? product.image : '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setName(product.name ?? '');
      setVolume(product.volume != null ? String(product.volume) : '');
      setCategory(product.category ?? '');
      setPrice(product.price != null ? String(product.price) : '');
      setImageUrl(product.image && typeof product.image === 'string' ? product.image : '');
      setImageUri(null);
    }
  }, [product?.id]);

  const handlePickImage = useCallback(() => {
    const launchImageLibrary = RNImagePicker?.launchImageLibrary;
    if (typeof launchImageLibrary !== 'function') {
      Alert.alert(
        'Image picker unavailable',
        'Please rebuild the app: run "cd ios && pod install" then rebuild.'
      );
      return;
    }
    const promise = launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      (res) => {
        if (res?.didCancel || !res?.assets?.[0]?.uri) return;
        setImageUri(res.assets[0].uri);
      }
    );
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageUri(null);
    setImageUrl('');
  }, []);

  const validate = useCallback(() => {
    const next = {};
    if (!(name || '').trim()) next.name = t('productNameRequired');
    const vol = parseInt(volume, 10);
    if (volume !== '' && (isNaN(vol) || vol < 0)) next.volume = 'Invalid volume';
    const pr = parseFloat((price || '').replace(',', '.'));
    if (price !== '' && (isNaN(pr) || pr < 0)) next.price = 'Invalid price';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, volume, price, t]);

  const handleSave = useCallback(async () => {
    if (!product?.id || !validate()) return;
    setSaving(true);
    try {
      await updateProduct(product.id, {
        name: name.trim(),
        volume: volume === '' ? 0 : parseInt(volume, 10),
        category: category.trim() || undefined,
        price: price === '' ? 0 : parseFloat((price || '0').replace(',', '.')),
        image: imageUri || (imageUrl.trim() || ''),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  }, [product?.id, name, volume, category, price, imageUri, imageUrl, updateProduct, navigation, validate]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('noProducts')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backTextBtn}>
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{t('editProduct')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.areaHint}>{currentAreaName}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('productImage')}</Text>
            <View style={styles.imageRow}>
              <TouchableOpacity style={styles.imageTouchable} onPress={handlePickImage} activeOpacity={0.8}>
                {(imageUri || imageUrl.trim()) ? (
                  <View style={styles.imagePreviewWrap}>
                    <Image
                      source={{ uri: imageUri || imageUrl.trim() }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoveImage} hitSlop={8}>
                      <Icon name={Icons.close} size={20} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name={Icons.add} size={32} color={colors.primaryBlue} />
                    <Text style={styles.imagePlaceholderText}>{t('addPhoto')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.orUrlLabel}>{t('orImageUrl')}</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder={t('imageUrlPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('productName')} *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
              placeholder={t('productNamePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('volumeMl')}</Text>
            <TextInput
              style={[styles.input, errors.volume && styles.inputError]}
              value={volume}
              onChangeText={(v) => { setVolume(v.replace(/[^0-9]/g, '')); setErrors((e) => ({ ...e, volume: undefined })); }}
              placeholder={t('volumePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
            {errors.volume ? <Text style={styles.errorText}>{errors.volume}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('category')}</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder={t('categoryPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('purchasePrice')}</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={price}
              onChangeText={(v) => { setPrice(v); setErrors((e) => ({ ...e, price: undefined })); }}
              placeholder={t('purchasePricePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
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
                <Icon name={Icons.check} size={22} color={colors.white} style={styles.saveBtnIcon} />
                <Text style={styles.saveBtnText}>{t('saveProduct')}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { padding: spacing.sm, minWidth: 40 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  areaHint: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
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
  inputError: { borderColor: colors.danger },
  errorText: { fontSize: 12, color: colors.danger, marginTop: spacing.xs },
  imageRow: { marginTop: spacing.xs },
  imageTouchable: { alignSelf: 'flex-start' },
  imagePlaceholder: {
    width: IMAGE_PREVIEW_SIZE,
    height: IMAGE_PREVIEW_SIZE,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: { marginTop: spacing.xs, fontSize: 13, color: colors.textSecondary },
  imagePreviewWrap: {
    width: IMAGE_PREVIEW_SIZE,
    height: IMAGE_PREVIEW_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: { width: '100%', height: '100%' },
  orUrlLabel: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnIcon: { marginRight: spacing.sm },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
  backTextBtn: { marginTop: spacing.md },
  backText: { fontSize: 16, color: colors.primaryBlue },
});
