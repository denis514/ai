import { learningPaths } from '../data/learningPaths.js';
import { STRINGS } from './strings.js';
import { FALLBACK_LOCALE } from './config.js';

function content(id, locale) {
  return STRINGS[locale]?.paths?.[id]
      || STRINGS[FALLBACK_LOCALE]?.paths?.[id]
      || null;
}

/**
 * Локализованный learning path: структура + текст из локали.
 * Сохраняет совместимый shape (title, description, duration, steps[].why),
 * чтобы компоненты продолжали читать поля без правок.
 */
export function getLocalizedPath(id, locale) {
  const struct = learningPaths.find(p => p.id === id);
  if (!struct) return null;
  const c = content(id, locale) || {};
  const stepsContent = c.steps || {};
  return {
    id: struct.id,
    icon: struct.icon,
    level: struct.level,
    title: c.title || '',
    description: c.description || '',
    duration: c.duration || '',
    steps: (struct.steps || []).map(s => ({
      type: s.type,
      id: s.id,
      why: stepsContent[`${s.type}:${s.id}`]?.why || ''
    }))
  };
}

export function getAllLocalizedPaths(locale) {
  return learningPaths.map(p => getLocalizedPath(p.id, locale));
}
