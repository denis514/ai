import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE, STORAGE_KEY, isLocale } from './config.js';
import { t as tFn } from './t.js';
import { loadLocaleContent, loadNodeSection, subscribeToContentChanges } from './strings.js';

const LocaleContext = createContext({ locale: DEFAULT_LOCALE, setLocale: () => {} });

// ─── Storage helpers ─────────────────────────────────────────────────────────

// v2 — новый ключ чтобы старый вечный кеш v1 не мешал
const IP_DETECT_KEY = 'claude-mindmap:ip-locale:v2';
const IP_CACHE_TTL  = 7 * 24 * 60 * 60 * 1000; // 7 дней

// Удаляем устаревший ключ v1 если он ещё есть
try { localStorage.removeItem('claude-mindmap:ip-locale:v1'); } catch {}

// Локаль из первого сегмента ПУТИ: /ru/... (path-routing, ADR-0008).
// Имя функции сохранено, чтобы не трогать вызовы.
function readLocaleFromHash() {
  if (typeof window === 'undefined') return null;
  const m = /^\/([a-z]{2})(?:\/|$)/i.exec(window.location.pathname || '');
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

/**
 * Читает IP-кеш с проверкой TTL (7 дней).
 * Если кеш истёк — удаляет его и возвращает null.
 */
function readCachedIPLocale() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(IP_DETECT_KEY);
    if (!raw) return null;
    const { locale, ts } = JSON.parse(raw);
    if (Date.now() - ts > IP_CACHE_TTL) {
      // Кеш протух — сбросить, чтобы при следующем визите снова определить
      localStorage.removeItem(IP_DETECT_KEY);
      return null;
    }
    return isLocale(locale) ? locale : null;
  } catch { return null; }
}

function writeIPCache(locale) {
  try {
    localStorage.setItem(IP_DETECT_KEY, JSON.stringify({ locale, ts: Date.now() }));
  } catch {}
}

// ─── IP detection ─────────────────────────────────────────────────────────────

const COUNTRY_TO_LOCALE = {
  FI: 'fi',
  RU: 'ru', BY: 'ru', UA: 'ru', KZ: 'ru',
  UZ: 'ru', KG: 'ru', TJ: 'ru', AM: 'ru',
};

/**
 * Запрашивает страну по IP, кеширует в localStorage на 7 дней.
 * Если свежий кеш есть — возвращает без сетевого запроса.
 */
async function detectIPLocale() {
  if (typeof window === 'undefined') return null;
  const cached = readCachedIPLocale();
  if (cached) return cached; // свежий кеш — не делаем запрос
  try {
    const res = await fetch('https://api.country.is', {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const country = (json?.country || '').toUpperCase();
    const locale  = COUNTRY_TO_LOCALE[country] || 'en';
    writeIPCache(locale);
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
  // contentVersion инкрементируется когда lazy-контент загружен.
  // Это заставляет useT()/useLocale() потребителей перерисоваться и
  // получить актуальные данные из STRINGS (уже мутированного).
  const [contentVersion, setContentVersion] = useState(0);

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

  // Lazy-load тяжёлого контента (nodes, tutorials, prompt-library) для
  // текущей локали + FALLBACK_LOCALE (en) для корректной работы fallback.
  // Мёржит данные в STRINGS[locale], затем инкрементирует contentVersion →
  // все useT()/useLocale() потребители перерисовываются с актуальным контентом.
  useEffect(() => {
    const locales = locale === FALLBACK_LOCALE
      ? [locale]
      : [locale, FALLBACK_LOCALE];
    Promise.all(locales.map(loadLocaleContent))
      .then(() => {
        setContentVersion(v => v + 1);
        // Path C — после критичного core грузим вторичные секции в фоне.
        // First-paint не блокируется, но titles сразу доступны к моменту
        // когда user expand'ит sys-* / commerce-* ветки или открывает Cmd+K.
        // Если getNode() обратится к узлу из ещё не загруженной секции —
        // он триггерит load сам, эта pre-fetch только ускоряет happy-path.
        for (const loc of locales) {
          loadNodeSection(loc, 'sys').catch(() => {});
          loadNodeSection(loc, 'commerce').catch(() => {});
        }
      })
      .catch(() => {}); // сеть недоступна — работаем с тем что есть
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe для lazy-section дозагрузок (sys, commerce). При дозагрузке
  // strings.js notify'ит — бампаем contentVersion, потребители ре-рендерятся.
  useEffect(() => {
    return subscribeToContentChanges(() => setContentVersion(v => v + 1));
  }, []);

  // Sync locale при смене пути (ссылки /fi/..., навигация). path-routing.
  useEffect(() => {
    const onNav = () => {
      const fromPath = readLocaleFromHash();
      if (fromPath && fromPath !== locale) setLocaleState(fromPath);
    };
    window.addEventListener('popstate', onNav);
    window.addEventListener('atlas:routechange', onNav);
    return () => {
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('atlas:routechange', onNav);
    };
  }, [locale]);

  // Sync <html lang>
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  // Ручная смена языка — пишет в обе storage-ячейки и обновляет ПУТЬ (/<lang>/...).
  const setLocale = useCallback((next) => {
    if (!isLocale(next)) return;
    try {
      localStorage.setItem(STORAGE_KEY, next);  // явный выбор пользователя
      writeIPCache(next);                        // перебить IP-кеш (с новым TTL)
    } catch {}
    // Подменяем первый сегмент пути на новую локаль, сохраняя остальной маршрут.
    const path = window.location.pathname || '/';
    const parts = path.split('/').filter(Boolean);
    if (parts.length && isLocale(parts[0].toLowerCase())) parts.shift();
    const target = '/' + [next, ...parts].join('/') + window.location.search;
    window.history.replaceState(null, '', target);
    setLocaleState(next);
    window.dispatchEvent(new Event('atlas:routechange'));
  }, []);

  const value = useMemo(() => ({
    locale,
    setLocale,
    locales: LOCALES,
    contentVersion, // потребители могут зависеть от него в useMemo/useEffect
    t: (key, vars) => tFn(key, locale, vars),
  }), [locale, setLocale, contentVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }

export function useT() {
  const { t } = useContext(LocaleContext);
  return t;
}
