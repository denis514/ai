import { useCallback, useEffect, useState } from 'react';
import { LOCALES, isLocale } from '../i18n/config.js';

/**
 * Path-based router c поддержкой locale-prefix (History API).
 *
 * Формат пути:
 *   /<lang>/<type>/<id>   — каноничный вид (lang ∈ en|ru|fi), напр. /ru/node/cap-tools
 *   /<lang>               — корень в указанной локали
 *   /<type>/<id>          — legacy (без локали); locale из LocaleContext
 *   /                     — корень
 *
 * Имя файла/экспортов сохранено (useHashRoute, parseHash) ради совместимости
 * импортов — реализация теперь читает window.location.pathname, а не hash.
 * См. ADR-0008. Это даёт реальные URL, которые индексирует Google.
 *
 * Семантика типов: node/<id>, tutorial/<id>, courses, library, prompt/<id>,
 * help/<id>, builder.
 *
 * Возвращает [route, setRoute], где route = { type, id } | null.
 * Locale управляется отдельно через LocaleContext (тот же путь, разные concerns).
 */

const EVT = 'atlas:routechange';

/** Разбор маршрута из строки пути (или legacy-хеша). */
export function parseHash(input) {
  let str = typeof input === 'string' ? input : '';
  str = str.replace(/^#/, ''); // поддержка legacy '#/...' и обычного '/...'
  const parts = str.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  let i = 0;
  if (isLocale(parts[0])) i = 1;
  if (i >= parts.length) return null; // только локаль
  const type = parts[i];
  const id = parts[i + 1] || null;
  return { type, id };
}

function localeFromPath() {
  if (typeof window === 'undefined') return null;
  const m = /^\/([a-z]{2})(?:\/|$)/i.exec(window.location.pathname || '');
  if (!m) return null;
  const code = m[1].toLowerCase();
  return isLocale(code) ? code : null;
}

function formatPath(route, locale) {
  const langSeg = isLocale(locale) ? `/${locale}` : '';
  if (!route || !route.type) {
    return langSeg || '/';
  }
  const tail = route.id ? `/${route.type}/${route.id}` : `/${route.type}`;
  return `${langSeg}${tail}`;
}

function readRoute() {
  if (typeof window === 'undefined') return null;
  return parseHash(window.location.pathname);
}

/**
 * Обратная совместимость: старые ссылки '#/<lang>/<type>/<id>' переписываем на
 * новый путь при загрузке. Не трогаем auth-хеш Supabase ('#access_token=…').
 * Возвращает true, если миграция была.
 */
export function migrateLegacyHash() {
  if (typeof window === 'undefined') return false;
  const h = window.location.hash || '';
  if (!h.startsWith('#/')) return false; // не наш маршрут (или auth-токен)
  const route = parseHash(h);
  const m = /^#\/?([a-z]{2})(?:\/|$)/i.exec(h);
  const locale = m && isLocale(m[1].toLowerCase()) ? m[1].toLowerCase() : null;
  const path = formatPath(route, locale);
  window.history.replaceState(null, '', path + window.location.search);
  return true;
}

export function useHashRoute() {
  const [route, setRouteState] = useState(readRoute);

  useEffect(() => {
    // Сравниваем маршрут ПО ЗНАЧЕНИЮ: parseHash отдаёт новый объект {type,id}
    // на каждое событие. Если вернуть его как есть — ссылка route меняется при
    // КАЖДОМ routechange/popstate, и все эффекты [route] (которые закрывают
    // дропдауны) срабатывают вхолостую, гася только что открытое меню в момент
    // первого клика. Возвращаем prev при том же type/id → нет лишнего ре-рендера.
    const onChange = () => setRouteState(prev => {
      const next = readRoute();
      if (prev && next && prev.type === next.type && prev.id === next.id) return prev;
      return next;
    });
    window.addEventListener('popstate', onChange);
    window.addEventListener(EVT, onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener(EVT, onChange);
    };
  }, []);

  const setRoute = useCallback((next) => {
    const locale = localeFromPath();
    const target = formatPath(next, locale) + window.location.search;
    const current = window.location.pathname + window.location.search;
    if (target === current) { setRouteState(next || null); return; }

    if (next) {
      window.history.pushState(null, '', target);
    } else {
      window.history.replaceState(null, '', (locale ? `/${locale}` : '/') + window.location.search);
    }
    setRouteState(next || null);
    // pushState/replaceState не триггерят popstate — оповещаем другие инстансы вручную.
    window.dispatchEvent(new Event(EVT));
  }, []);

  return [route, setRoute];
}

export { LOCALES };
