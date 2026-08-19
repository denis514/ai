// Реестр локалей.
//
// СТАТИЧЕСКИ (в main bundle): ui, prompts, paths, help — нужны сразу для UI.
// ЛЕНИВО (отдельные чанки): nodes, tutorials, prompt-library — тяжёлые,
// нужны только при открытии детальных панелей. Загружаются через
// loadLocaleContent(locale) из LocaleContext.
//
// При добавлении новой локали — импорт + регистрация в STRINGS + новый content-xx.js.

import { FALLBACK_LOCALE } from './config.js';

import enUI from '../locales/en/ui.json';
import ruUI from '../locales/ru/ui.json';
import fiUI from '../locales/fi/ui.json';

import enPrompts from '../locales/en/prompts.json';
import ruPrompts from '../locales/ru/prompts.json';
import fiPrompts from '../locales/fi/prompts.json';

import enPaths from '../locales/en/paths.json';
import ruPaths from '../locales/ru/paths.json';
import fiPaths from '../locales/fi/paths.json';

import enHelp from '../locales/en/help.json';
import ruHelp from '../locales/ru/help.json';
import fiHelp from '../locales/fi/help.json';

// Базовые строки — синхронно доступны сразу.
// nodes / tutorials / prompt-library добавляются после loadLocaleContent().
export const STRINGS = {
  en: { ...enUI, prompts: enPrompts, paths: enPaths, help: enHelp },
  ru: { ...ruUI, prompts: ruPrompts, paths: ruPaths, help: ruHelp },
  fi: { ...fiUI, prompts: fiPrompts, paths: fiPaths, help: fiHelp },
};

// ─── Lazy content loading ─────────────────────────────────────────────────────

const _loaded = new Set();
// _loaded помечается СРАЗУ (дедуп параллельных вызовов), поэтому для вопроса
// «контент уже можно спрашивать?» нужен отдельный набор — иначе промах во
// время загрузки выглядит как настоящая дыра в переводе.
const _ready = new Set();
// Per-locale Set of loaded tutorial audiences (everyone, developers, business).
const _loadedTutorials = new Map();
// Per-locale Set of loaded node-sections (sys, commerce).
// core загружается всегда вместе с loadLocaleContent().
const _loadedSections = new Map();
// Subscribers для notify когда секция дозагружена — UI re-renders.
const _subscribers = new Set();

const CONTENT_LOADERS = {
  en: () => import('./content-en.js'),
  ru: () => import('./content-ru.js'),
  fi: () => import('./content-fi.js'),
};

/**
 * Маршрутизатор id → section. Core грузится eager, остальные lazy.
 */
export function getNodeSection(id) {
  if (typeof id !== 'string') return 'core';
  if (id.startsWith('sys-')) return 'sys';
  if (id.startsWith('ec-') || id.startsWith('uc-') || id.startsWith('cs-')
      || id.startsWith('mk-') || id.startsWith('pd-')) return 'commerce';
  return 'core';
}

/** Подписка на изменения контента (lazy-load дозагрузил секцию). */
export function subscribeToContentChanges(fn) {
  _subscribers.add(fn);
  return () => _subscribers.delete(fn);
}
function notifyChange() {
  _subscribers.forEach(fn => { try { fn(); } catch {} });
}

/**
 * Lazy-load одной node-секции (sys или commerce). Идемпотентно.
 * Триггерится автоматически при первом обращении к id из несреднной секции
 * через getNode() helper, либо явно (например CommandPalette при открытии
 * грузит все секции для search index).
 */
export async function loadNodeSection(locale, section) {
  if (section === 'core') return; // core уже в STRINGS после loadLocaleContent
  const loaded = _loadedSections.get(locale) ?? new Set();
  if (loaded.has(section)) return;
  loaded.add(section); // dedupe concurrent calls
  _loadedSections.set(locale, loaded);
  try {
    const mod = await CONTENT_LOADERS[locale]();
    const data = await mod.loadNodeSection(section);
    STRINGS[locale].nodes = { ...STRINGS[locale].nodes, ...data };
    notifyChange();
  } catch (e) {
    loaded.delete(section);
    throw e;
  }
}

/**
 * Lazy-load текстов туториалов одной аудитории (everyone / developers / business).
 * Идемпотентно. При входе на сайт в памяти только индекс (заголовки), тела
 * подтягиваются когда пользователь открывает курс.
 */
export async function loadTutorialAudience(locale, audience) {
  if (!audience) return;
  const loaded = _loadedTutorials.get(locale) ?? new Set();
  if (loaded.has(audience)) return;
  loaded.add(audience); // dedupe параллельных вызовов
  _loadedTutorials.set(locale, loaded);
  try {
    const mod = await CONTENT_LOADERS[locale]();
    const data = await mod.loadTutorialAudience(audience);
    // Полные тексты перекрывают записи индекса того же id.
    STRINGS[locale].tutorials = { ...STRINGS[locale].tutorials, ...data };
    notifyChange();
  } catch (e) {
    loaded.delete(audience);
    throw e;
  }
}

/** Загружены ли полные тексты этой аудитории для локали. */
export function isTutorialAudienceLoaded(locale, audience) {
  return !!_loadedTutorials.get(locale)?.has(audience);
}

/**
 * Sync getter — возвращает узел если загружен, иначе undefined.
 * Если секция ещё не загружена — fire-and-forget триггерит её асинхронно;
 * по завершении бамп contentVersion в LocaleContext → UI рендерится заново.
 */
export function getNode(locale, id) {
  const node = STRINGS[locale]?.nodes?.[id];
  if (node) return node;
  const section = getNodeSection(id);
  if (section !== 'core') {
    loadNodeSection(locale, section).catch(() => {});
  }
  return undefined;
}

/**
 * Загружает тяжёлый контент (nodes, tutorials, prompt-library) для локали
 * и мёржит его в STRINGS[locale]. Идемпотентно — повторный вызов — no-op.
 */
export async function loadLocaleContent(locale) {
  if (_loaded.has(locale)) return;
  const loader = CONTENT_LOADERS[locale];
  if (!loader) return;
  _loaded.add(locale);
  try {
    const mod = await loader();
    // content-<locale>.js теперь экспортирует async loadContent() — это
    // даёт Vite повод эмиттить отдельные chunks на nodes/{core,sys,commerce},
    // tutorials и library вместо инлайнинга всего в content-<locale>.js.
    const content = await mod.loadContent();
    Object.assign(STRINGS[locale], {
      nodes:            content.nodes,
      tutorials:        content.tutorials,
      'prompt-library': content.library,
    });
    _ready.add(locale);   // контент реально в памяти, а не «загрузка начата»
  } catch (e) {
    // При ошибке снимаем флаг — позволяем повторить попытку
    _loaded.delete(locale);
    _ready.delete(locale);
    throw e;
  }
}

/** Проверить, загружен ли контент для локали */
export function isContentLoaded(locale) {
  return _loaded.has(locale);
}

// ── Запасной язык (en) по требованию ────────────────────────────────────────
// Раньше контент en грузился всегда рядом с текущим языком «на случай дыр» —
// это удваивало вес первой загрузки (туториалы ~800 KB gzip на язык), хотя
// ru/fi/en заполнены одинаково (261 туториал, 211 узлов core в каждом).
// Теперь грузим его ТОЛЬКО если запрошенного ключа реально нет в текущем языке.
let _fallbackKick = null;

function kickFallback() {
  if (_loaded.has(FALLBACK_LOCALE) || _fallbackKick) return;
  _fallbackKick = loadLocaleContent(FALLBACK_LOCALE)
    .then(() => notifyChange())
    .catch(() => { _fallbackKick = null; });
}

/**
 * Промах по тяжёлому ключу (`nodes.*`, `tutorials.*`, `prompt-library.*`).
 * Поднимаем запасной язык ТОЛЬКО если промах настоящий, то есть нужный кусок
 * текущего языка уже загружен. Иначе сработает на каждом рендере до загрузки
 * контента и утянет весь en — ровно то, от чего мы уходим.
 */
export function maybeLoadFallbackFor(locale, key) {
  if (locale === FALLBACK_LOCALE) return;
  if (!_ready.has(locale)) return;                  // свой контент ещё едет
  if (key.startsWith('nodes.')) {
    const id = key.split('.')[1];
    const section = getNodeSection(id);
    if (section !== 'core' && !(_loadedSections.get(locale)?.has(section))) return;
  }
  kickFallback();
}
