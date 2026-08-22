/**
 * shareUrl.js — построение абсолютной ссылки на обучающую сущность для «Поделиться».
 *
 * URL совпадает с path-роутингом приложения (ADR-0008):
 *   <origin>/<lang>/<type>/<id>   напр. https://www.105-atlas.app/ru/node/cap-tools
 * Превью-карточку (title/og) страница отдаёт сама (см. useDocumentMeta).
 */
import { isLocale } from '../i18n/config.js';

const FALLBACK_ORIGIN = 'https://www.105-atlas.app';

function currentLocale() {
  if (typeof window === 'undefined') return 'ru';
  const m = /^\/([a-z]{2})(?:\/|$)/i.exec(window.location.pathname || '');
  const c = m && m[1].toLowerCase();
  return isLocale(c) ? c : 'ru';
}

/** Абсолютная ссылка на сущность { type, id }. */
export function buildShareUrl({ type, id }, locale) {
  const origin = (typeof window !== 'undefined' && window.location.origin) || FALLBACK_ORIGIN;
  const lang = locale || currentLocale();
  const tail = id ? `/${type}/${id}` : `/${type}`;
  return `${origin}/${lang}${tail}`;
}

/** Готовые share-ссылки внешних сервисов (без backend). */
export function shareTargets(url, title) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title || '');
  return {
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    email: `mailto:?subject=${t}&body=${u}`,
  };
}
