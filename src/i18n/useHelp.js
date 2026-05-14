import { STRINGS } from './strings.js';
import { DEFAULT_LOCALE } from './config.js';

/**
 * Возвращает локализованные секции справки.
 *   const sections = getLocalizedHelp(locale);
 *   // [{ id, title, icon, items: [{ id, q, a, actions }] }, ...]
 *
 * Fallback на RU, если в нужной локали секции отсутствуют или невалидны.
 */
export function getLocalizedHelp(locale) {
  const bag = STRINGS[locale]?.help || STRINGS[DEFAULT_LOCALE]?.help;
  const sections = bag?.sections;
  return Array.isArray(sections) ? sections : [];
}

/** Найти секцию по id; null если не найдена. */
export function getLocalizedHelpSection(locale, sectionId) {
  const sections = getLocalizedHelp(locale);
  return sections.find(s => s.id === sectionId) || null;
}
