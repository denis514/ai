import { readyPrompts } from '../data/prompts.js';
import { promptLibrary, PROMPT_CATEGORIES, PROMPT_LEVELS } from '../data/promptLibrary.js';
import { STRINGS } from './strings.js';
import { FALLBACK_LOCALE } from './config.js';

/**
 * Резолверы для промптов (featured + library) и категорий/уровней.
 * Структурный объект (id, icon, category, level) живёт в data-файлах,
 * текст — в locales/<lang>/{prompts,prompt-library}.json.
 */

// ===== Featured prompts (src/data/prompts.js) =====

function fpContent(id, locale) {
  return STRINGS[locale]?.prompts?.[id]
      || STRINGS[FALLBACK_LOCALE]?.prompts?.[id]
      || null;
}

export function getLocalizedFeaturedPrompt(id, locale) {
  const struct = readyPrompts.find(p => p.id === id);
  if (!struct) return null;
  const c = fpContent(id, locale) || {};
  return {
    id: struct.id,
    icon: struct.icon,
    title: c.title || '',
    description: c.description || '',
    text: c.text || ''
  };
}

export function getAllLocalizedFeatured(locale) {
  return readyPrompts.map(p => getLocalizedFeaturedPrompt(p.id, locale));
}

// ===== Library templates (src/data/promptLibrary.js) =====

function libContent(id, locale) {
  return STRINGS[locale]?.['prompt-library']?.templates?.[id]
      || STRINGS[FALLBACK_LOCALE]?.['prompt-library']?.templates?.[id]
      || null;
}

export function getLocalizedLibraryTemplate(id, locale) {
  const struct = promptLibrary.find(p => p.id === id);
  if (!struct) return null;
  const c = libContent(id, locale) || {};
  return {
    id: struct.id,
    category: struct.category,
    level: struct.level,
    icon: struct.icon,
    title: c.title || '',
    description: c.description || '',
    text: c.text || ''
  };
}

export function getAllLocalizedLibrary(locale) {
  return promptLibrary.map(p => getLocalizedLibraryTemplate(p.id, locale));
}

// ===== Categories + levels =====

export function getLibraryCategory(key, locale) {
  const struct = PROMPT_CATEGORIES[key] || {};
  const bag = STRINGS[locale]?.['prompt-library']?.categories?.[key]
           || STRINGS[FALLBACK_LOCALE]?.['prompt-library']?.categories?.[key]
           || {};
  return {
    key,
    icon: struct.icon,
    label: bag.label || '',
    description: bag.description || ''
  };
}

export function getAllLibraryCategories(locale) {
  const out = {};
  for (const key of Object.keys(PROMPT_CATEGORIES)) {
    out[key] = getLibraryCategory(key, locale);
  }
  return out;
}

export function getLibraryLevel(key, locale) {
  const struct = PROMPT_LEVELS[key] || {};
  const bag = STRINGS[locale]?.['prompt-library']?.levels?.[key]
           || STRINGS[FALLBACK_LOCALE]?.['prompt-library']?.levels?.[key]
           || {};
  return { key, color: struct.color, label: bag.label || '' };
}

export function getAllLibraryLevels(locale) {
  const out = {};
  for (const key of Object.keys(PROMPT_LEVELS)) {
    out[key] = getLibraryLevel(key, locale);
  }
  return out;
}
