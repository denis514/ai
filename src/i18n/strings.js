// Реестр локалей.
//
// СТАТИЧЕСКИ (в main bundle): ui, prompts, paths, help — нужны сразу для UI.
// ЛЕНИВО (отдельные чанки): nodes, tutorials, prompt-library — тяжёлые,
// нужны только при открытии детальных панелей. Загружаются через
// loadLocaleContent(locale) из LocaleContext.
//
// При добавлении новой локали — импорт + регистрация в STRINGS + новый content-xx.js.

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

const CONTENT_LOADERS = {
  en: () => import('./content-en.js'),
  ru: () => import('./content-ru.js'),
  fi: () => import('./content-fi.js'),
};

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
  } catch (e) {
    // При ошибке снимаем флаг — позволяем повторить попытку
    _loaded.delete(locale);
    throw e;
  }
}

/** Проверить, загружен ли контент для локали */
export function isContentLoaded(locale) {
  return _loaded.has(locale);
}
