import { useCallback, useEffect, useState } from 'react';
import { LOCALES, isLocale } from '../i18n/config.js';

/**
 * Hash-based router c поддержкой locale-prefix.
 *
 * Формат хеша:
 *   #/<lang>/<type>/<id>   — каноничный вид (lang ∈ en|ru|fi)
 *   #/<lang>               — корень в указанной локали
 *   #/<type>/<id>          — legacy (без локали); locale берётся из LocaleContext
 *   ''                      — корень в текущей локали
 *
 * Семантика типов (как и раньше):
 *   node/<id>     — DetailPanel
 *   tutorial/<id> — TutorialModal
 *   courses       — WorkflowsModal
 *   library       — PromptLibraryModal
 *   prompt/<id>   — шаблон в fullscreen
 *
 * Возвращает [route, setRoute], где route = { type, id } | null.
 * Locale управляется отдельно через LocaleContext — она пишется/читается из
 * того же хеша, но это два разных concerns, чтобы компоненты не были вынуждены
 * пробрасывать locale в каждый setRoute.
 */

export function parseHash(hash) {
  if (!hash || hash === '#' || hash === '#/') return null;
  const clean = hash.replace(/^#\/?/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  // Если первый сегмент — поддерживаемая локаль, пропускаем её.
  let i = 0;
  if (isLocale(parts[0])) i = 1;

  if (i >= parts.length) return null; // только локаль, без route
  const type = parts[i];
  const id = parts[i + 1] || null;
  return { type, id };
}

function currentLocaleFromHash() {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash || '';
  const m = /^#\/?([a-z]{2})(?:\/|$)/i.exec(h);
  if (!m) return null;
  const code = m[1].toLowerCase();
  return isLocale(code) ? code : null;
}

function formatHash(route, locale) {
  const langSeg = isLocale(locale) ? `/${locale}` : '';
  if (!route || !route.type) {
    return langSeg ? `#${langSeg}` : '';
  }
  const tail = route.id ? `/${route.type}/${route.id}` : `/${route.type}`;
  return `#${langSeg}${tail}`;
}

function readHash() {
  if (typeof window === 'undefined') return null;
  return parseHash(window.location.hash);
}

export function useHashRoute() {
  const [route, setRouteState] = useState(readHash);

  useEffect(() => {
    const onChange = () => setRouteState(readHash());
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, []);

  const setRoute = useCallback((next) => {
    // Сохраняем существующую локаль в URL (или null — тогда без префикса).
    const locale = currentLocaleFromHash();
    const target = formatHash(next, locale);
    const current = window.location.hash;
    if (target === current) return;

    if (next) {
      window.history.pushState(null, '', target || window.location.pathname + window.location.search);
    } else if (locale) {
      // Очистка route, но сохраняем locale-префикс в URL.
      window.history.replaceState(null, '', `#/${locale}`);
    } else {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
    setRouteState(next || null);
  }, []);

  return [route, setRoute];
}

// Реэкспорт констант для удобства потребителей.
export { LOCALES };
