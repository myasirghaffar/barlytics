/**
 * Language context: English (en) primary, German (de) second. Persists choice in AsyncStorage.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en, de } from '../i18n/translations';

const STORAGE_KEY = '@bar_inventory_locale';

const translations = { en, de };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'de' || stored === 'en') setLocaleState(stored);
      setReady(true);
    });
  }, []);

  const setLocale = useCallback((next) => {
    if (next !== 'en' && next !== 'de') return;
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key, params) => {
      const str = translations[locale]?.[key] ?? translations.en[key] ?? key;
      if (params && typeof str === 'string') {
        return Object.entries(params).reduce((s, [k, v]) => s.replace(`{{${k}}}`, String(v)), str);
      }
      return str;
    },
    [locale]
  );

  const value = { locale, setLocale, t, ready };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
