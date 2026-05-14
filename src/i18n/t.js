import { STRINGS } from './strings.js';
import { FALLBACK_LOCALE } from './config.js';

/**
 * Получить значение по dotted-пути ИЛИ по плоскому ключу с точкой.
 * Сначала пробуем плоский лук-ап (для ключей вида "data.reset", когда они
 * лежат под одним уровнем). Затем — вложенный обход. Возвращает undefined,
 * если ключа нет.
 */
function getByPath(obj, path) {
  if (obj == null) return undefined;
  // JSON-словари у нас полу-плоские: { profile: { "data.export": "..." } }.
  // На каждом шаге сначала проверяем оставшийся путь как плоский ключ,
  // только потом спускаемся глубже.
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    if (cur == null || typeof cur !== 'object') return undefined;
    const rest = parts.slice(i).join('.');
    if (Object.prototype.hasOwnProperty.call(cur, rest)) return cur[rest];
    cur = cur[parts[i]];
  }
  return cur;
}

/**
 * Получить строку по ключу из заданной локали. Bag — это плоский объект
 * локали (см. strings.js): UI-блоки на верхнем уровне, контентные коллекции
 * под своими namespace-ключами. getByPath решает оба случая.
 */
function lookup(locale, key) {
  const bag = STRINGS[locale];
  if (!bag) return undefined;
  return getByPath(bag, key);
}

/**
 * Подставить плейсхолдеры вида {name} в шаблон.
 */
function interpolate(template, vars) {
  if (!vars || typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (m, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m
  );
}

/**
 * Перевод по ключу с fallback на источник (RU) и финальным fallback на сам ключ.
 *
 * t('profile.level.beginner', 'en') → 'Beginner'
 * t('profile.tutorials.done', 'fi', { done: 3, total: 18 }) → '3 / 18 suoritettu'
 * t('unknown.key', 'fi') → 'unknown.key' (видно в UI, что забыли перевести)
 */
export function t(key, locale, vars) {
  const primary = lookup(locale, key);
  if (primary !== undefined) return interpolate(primary, vars);
  if (locale !== FALLBACK_LOCALE) {
    const fallback = lookup(FALLBACK_LOCALE, key);
    if (fallback !== undefined) return interpolate(fallback, vars);
  }
  if (typeof window !== 'undefined' && import.meta.env?.DEV) {
    console.warn(`[i18n] missing key: ${key} (locale: ${locale})`);
  }
  return key;
}
