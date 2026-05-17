import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALES, DEFAULT_LOCALE, STORAGE_KEY, isLocale } from './config.js';
import { t as tFn } from './t.js';

const LocaleContext = createContext({ locale: DEFAULT_LOCALE, setLocale: () => {} });

// ─── Storage helpers ─────────────────────────────────────────────────────────

const IP_DETECT_KEY = 'claude-mindmap:ip-locale:v1';

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
  } catch { return null; }
}

function readCachedIPLocale() {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(IP_DETECT_KEY);
    return isLocale(v) ? v : null;
  } catch { return null; }
}

// ─── IP detection ─────────────────────────────────────────────────────────────

const COUNTRY_TO_LOCALE = {
  FI: 'fi',
  RU: 'ru', BY: 'ru', UA: 'ru', KZ: 'ru',
  UZ: 'ru', KG: 'ru', TJ: 'ru', AM: 'ru',
};

/**
 * Запрашивает страну по IP, кеширует в localStorage.
 * Если кеш есть — возвращает немедленно без сети.
 */
async function detectIPLocale() {
  if (typeof window === 'undefined') return null;
  const cached = readCachedIPLocale();
  if (cached) return cached; // уже знаем — не делаем запрос
  try {
    const res = await fetch('https://api.country.is', {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const country = (json?.country || '').toUpperCase();
    const locale  = COUNTRY_TO_LOCALE[country] || 'en';
    try { localStorage.setItem(IP_DETECT_KEY, locale); } catch {}
    return locale;
  } catch {
    return null;
  }
}

// ─── Initial locale resolution ────────────────────────────────────────────────

/**
 * Приоритет (синхронный):
 *   1. URL hash (#/ru/...) — абсолютный
 *   2. localStorage (ручной выбор пользователя)
 *   3. IP-кеш из прошлого визита (localStorage ip-locale)
 *   4. DEFAULT_LOCALE 'en'
 *
 * IP-запрос делается ТОЛЬКО если кеша нет (первый визит).
 * Результат записывается в кеш и применяется только в первые 800ms
 * загрузки страницы — когда пользователь ещё точно не открыл ни одной
 * модалки. Это исключает перерисовку во время взаимодействия.
 */
function resolveInitialLocale() {
  return (
    readLocaleFromHash()  ||
    readStoredLocale()    ||
    readCachedIPLocale()  || // ← синхронно из кеша
    DEFAULT_LOCALE
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(resolveInitialLocale);

  // IP-детекция: только если нет ни ручного выбора, ни кеша (= первый визит).
  // Применяем результат ТОЛЬКО в первые 800ms — пока пользователь ещё не успел
  // открыть модалку. Если ответ пришёл позже — просто сохраняем в кеш для
  // следующего визита, но НЕ перерисовываем сейчас.
  useEffect(() => {
    const hasManual = !!readStoredLocale();
    const hasURL    = !!readLocaleFromHash();
    const hasCache  = !!readCachedIPLocale();

    // Кеш есть или ручной выбор — ничего делать не нужно
    if (hasManual || hasURL || hasCache) return;

    const mountedAt = Date.now();

    detectIPLocale().then(detected => {
      if (!detected) return;
      // Защитный таймер: если прошло больше 800ms — не перерисовываем,
      // просто кеш уже записан (detectIPLocale делает это сам)
      const elapsed = Date.now() - mountedAt;
      if (elapsed > 800) return;
      // Двойная проверка — вдруг за это время пользователь выбрал язык
      if (readStoredLocale()) return;
      setLocaleState(detected);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync locale при смене hash (ссылки с #/fi/...)
  useEffect(() => {
    const onHash = () => {
      const fromHash = readLocaleFromHash();
      if (fromHash && fromHash !== locale) setLocaleState(fromHash);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [locale]);

  // Sync <html lang>
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  // Ручная смена языка — пишет в обе storage-ячейки и обновляет URL
  const setLocale = useCallback((next) => {
    if (!isLocale(next)) return;
    try {
      localStorage.setItem(STORAGE_KEY, next);    // явный выбор
      localStorage.setItem(IP_DETECT_KEY, next);  // перебить IP-кеш
    } catch {}
    const h = window.location.hash || '';
    const stripped = h.replace(/^#\/?([a-z]{2})(\/|$)/i, (m, code, sep) =>
      isLocale(code.toLowerCase()) ? (sep === '/' ? '#/' : '#') : m
    );
    const rest   = stripped.replace(/^#\/?/, '');
    const target = rest ? `#/${next}/${rest}` : `#/${next}`;
    window.history.replaceState(null, '', target);
    setLocaleState(next);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  const value = useMemo(() => ({
    locale,
    setLocale,
    locales: LOCALES,
    t: (key, vars) => tFn(key, locale, vars),
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }

export function useT() {
  const { t } = useContext(LocaleContext);
  return t;
}
