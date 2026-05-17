import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALES, DEFAULT_LOCALE, STORAGE_KEY, isLocale } from './config.js';
import { t as tFn } from './t.js';

const LocaleContext = createContext({ locale: DEFAULT_LOCALE, setLocale: () => {} });

// ── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Маппинг страна ISO → locale.
 * Финляндия → fi, русскоязычные страны → ru, остальные → en.
 */
const COUNTRY_TO_LOCALE = {
  FI: 'fi',                                    // Финляндия
  RU: 'ru', BY: 'ru', UA: 'ru', KZ: 'ru',     // Русскоязычные страны
  UZ: 'ru', KG: 'ru', TJ: 'ru', AM: 'ru',
};

const IP_DETECT_KEY = 'claude-mindmap:ip-locale:v1'; // кешируем результат

/**
 * Асинхронно определяет локаль по IP через ipapi.co.
 * Результат кешируется в localStorage, чтобы делать запрос только один раз.
 * Возвращает locale string или null при ошибке.
 */
async function detectIPLocale() {
  if (typeof window === 'undefined') return null;

  // Если уже определяли — берём из кеша (не делаем повторный запрос)
  try {
    const cached = localStorage.getItem(IP_DETECT_KEY);
    if (cached && isLocale(cached)) return cached;
  } catch {}

  try {
    // api.country.is — бесплатно, без лимитов, возвращает {"ip":"...","country":"FI"}
    const res = await fetch('https://api.country.is', {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const country = (json?.country || '').toUpperCase();
    const locale = COUNTRY_TO_LOCALE[country] || 'en';
    try { localStorage.setItem(IP_DETECT_KEY, locale); } catch {}
    return locale;
  } catch {
    return null; // сеть недоступна или таймаут — молча падаем на DEFAULT
  }
}

/**
 * Resolve локали при старте (синхронно):
 *   1. URL hash (#/ru/...) — абсолютный приоритет
 *   2. localStorage — пользователь уже выбирал вручную
 *   3. DEFAULT_LOCALE ('en') — пока IP не ответил
 *
 * IP-детекция запускается асинхронно в LocaleProvider и обновляет локаль
 * только если пользователь ещё не сделал явный выбор.
 */
function resolveInitialLocale() {
  return (
    readLocaleFromHash() ||
    readStoredLocale()   ||
    DEFAULT_LOCALE          // → 'en', IP подтянется асинхронно
  );
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(resolveInitialLocale);

  // ── IP-детекция при первом визите ────────────────────────────────────────
  // Запускается только если нет явного выбора пользователя (нет в localStorage)
  // и нет locale в URL. Не перебивает ручной выбор.
  useEffect(() => {
    const hasManualChoice = !!readStoredLocale();
    const hasUrlLocale    = !!readLocaleFromHash();
    if (hasManualChoice || hasUrlLocale) return; // пользователь уже выбрал — не трогаем

    detectIPLocale().then(detected => {
      if (!detected) return;
      // Перепроверяем — вдруг пользователь успел выбрать вручную пока грузился IP
      if (readStoredLocale()) return;
      setLocaleState(detected);
      // НЕ пишем в localStorage — IP-детекция не считается явным выбором.
      // При следующем визите запрос пойдёт снова (или из IP-кеша).
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    try {
      // Ручной выбор пишем в localStorage — это явное предпочтение пользователя
      window.localStorage.setItem(STORAGE_KEY, next);
      // Сохраняем IP-кеш тоже — чтобы при следующем визите без localStorage
      // система помнила что IP-детекция уже прошла (и не перебивала выбор)
      window.localStorage.setItem(IP_DETECT_KEY, next);
    } catch {}
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
