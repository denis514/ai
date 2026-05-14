// Поддерживаемые локали. Порядок = порядок в LocaleSwitcher.
// EN — дефолт при первом заходе; RU — source-of-truth контента; FI — целевой перевод.
export const LOCALES = ['en', 'ru', 'fi'];

export const LOCALE_LABEL = {
  en: 'English',
  ru: 'Русский',
  fi: 'Suomi'
};

// Короткие коды для компактных переключателей.
export const LOCALE_SHORT = {
  en: 'EN',
  ru: 'RU',
  fi: 'FI'
};

// Дефолт при первом заходе (если в URL и localStorage пусто).
export const DEFAULT_LOCALE = 'en';

// Fallback при отсутствии ключа в текущей локали.
// RU — source-of-truth, поэтому в нём всегда есть полный набор ключей.
export const FALLBACK_LOCALE = 'ru';

export const STORAGE_KEY = 'claude-mindmap:locale:v1';

export function isLocale(value) {
  return typeof value === 'string' && LOCALES.includes(value);
}
