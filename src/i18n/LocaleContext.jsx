import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALES, DEFAULT_LOCALE, STORAGE_KEY, isLocale } from './config.js';
import { t as tFn } from './t.js';

const LocaleContext = createContext({ locale: DEFAULT_LOCALE, setLocale: () => {} });

/**
 * Извлекает locale из текущего hash. Формат: #/<lang>/<rest>
 * Возвращает null если первый сегмент не один из поддерживаемых.
 */
function readLocaleFromHash() {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash || '';
  const m = /^#\/?([a-z]{2})(?:\/|$)/i.exec(h);
  if (!m) return null;
  const code = m[1].toLowerCase();
  return isLocale(code) ? code : null;
}

function readStoredLocale() {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(v) ? v : null;
  } catch {
    return null;
  }
}

function detectBrowserLocale() {
  if (typeof navigator === 'undefined') return null;
  const list = navigator.languages || [navigator.language || ''];
  for (const lang of list) {
    const code = (lang || '').slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return null;
}

/**
 * Resolve локали по приоритету: URL → localStorage → browser → DEFAULT_LOCALE.
 */
function resolveInitialLocale() {
  return (
    readLocaleFromHash() ||
    readStoredLocale() ||
    detectBrowserLocale() ||
    DEFAULT_LOCALE
  );
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(resolveInitialLocale);

  // Sync со сменой hash (например, переход по ссылке #/fi/...).
  useEffect(() => {
    const onHash = () => {
      const fromHash = readLocaleFromHash();
      if (fromHash && fromHash !== locale) setLocaleState(fromHash);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [locale]);

  // Sync <html lang> для корректного SEO и accessibility.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Persist в localStorage + обновить URL при программной смене.
  const setLocale = useCallback((next) => {
    if (!isLocale(next)) return;
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch {}
    // Переписать первый сегмент hash под новую локаль.
    const h = window.location.hash || '';
    const stripped = h.replace(/^#\/?([a-z]{2})(\/|$)/i, (m, code, sep) => {
      return isLocale(code.toLowerCase()) ? (sep === '/' ? '#/' : '#') : m;
    });
    const rest = stripped.replace(/^#\/?/, '');
    const target = rest ? `#/${next}/${rest}` : `#/${next}`;
    window.history.replaceState(null, '', target);
    setLocaleState(next);
    // Эвент для других подписчиков (useHashRoute), чтобы они перечитали URL.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  const value = useMemo(() => ({
    locale,
    setLocale,
    locales: LOCALES,
    t: (key, vars) => tFn(key, locale, vars)
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/**
 * Прямой хук для перевода — короче в JSX:
 *   const t = useT();
 *   <button>{t('common.close')}</button>
 */
export function useT() {
  const { t } = useContext(LocaleContext);
  return t;
}
