import { useEffect } from 'react';
import { STRINGS } from '../i18n/strings.js';
import { tutorialByNodeId } from '../data/tutorials.js';

/**
 * useDocumentMeta — динамически обновляет <title>, meta description, canonical
 * и og:title/og:description под текущий маршрут и локаль (SEO, path-routing).
 *
 * Раньше эти теги были статичны → каждая страница в выдаче/при шеринге выглядела
 * одинаково. Теперь у узла/туториала/раздела свой заголовок и описание.
 *
 * @param {{type,id}|null} route — текущий маршрут (из useHashRoute)
 * @param {string} locale — текущая локаль
 * @param {number} contentVersion — бампается после lazy-load контента (чтобы
 *        перечитать заголовки, когда STRINGS[locale].nodes подгрузились)
 */

const SITE = '105 Atlas';
// Домен берём из адреса текущей страницы → canonical/og/hreflang автоматически
// подстраиваются под ЛЮБОЙ домен (свой домен, preview-деплой) без правок кода.
// Строка-фолбэк — только для SSR/без window.
function siteOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'https://www.105-atlas.app';
}

const DEFAULTS = {
  ru: { title: '105 Atlas — карта AI-трансформации', desc: 'Интерактивная база знаний о Claude и экосистеме ИИ: навыки, агенты, MCP, автоматизация.' },
  en: { title: '105 Atlas — AI Transformation Map', desc: 'Interactive knowledge base on Claude and the AI ecosystem: skills, agents, MCP, automation.' },
  fi: { title: '105 Atlas — tekoälymuutoksen kartta', desc: 'Interaktiivinen tietopankki Claudesta ja tekoälyn ekosysteemistä: taidot, agentit, MCP, automaatio.' },
};

const SECTION = {
  builder: { ru: 'Agent Builder — конструктор ИИ-агентов', en: 'Agent Builder — visual AI agent builder', fi: 'Agent Builder — tekoälyagenttien rakentaja' },
  courses: { ru: 'Обучение', en: 'Courses', fi: 'Kurssit' },
  library: { ru: 'Библиотека промптов', en: 'Prompt library', fi: 'Promptikirjasto' },
  account: { ru: 'Аккаунт', en: 'Account', fi: 'Tili' },
};

function clamp(s, n = 160) {
  const str = String(s || '').replace(/\s+/g, ' ').trim();
  return str.length > n ? str.slice(0, n - 1).trimEnd() + '…' : str;
}

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const LOCALES = ['ru', 'en', 'fi'];

/**
 * hreflang-альтернаты: для текущего маршрута даём адрес той же страницы в каждой
 * локали + x-default. Поисковик отдаёт пользователю правильную языковую версию.
 */
function setAlternates() {
  if (typeof window === 'undefined') return;
  // Путь без ведущего сегмента-локали → общий «хвост» маршрута.
  const path = window.location.pathname || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts.length && LOCALES.includes(parts[0].toLowerCase())) parts.shift();
  const tail = parts.length ? '/' + parts.join('/') : '';

  // Удаляем прошлые управляемые alternate-теги.
  document.head.querySelectorAll('link[rel="alternate"][data-hreflang]').forEach(el => el.remove());

  const add = (lang, href) => {
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', lang);
    el.setAttribute('href', href);
    el.setAttribute('data-hreflang', '1');
    document.head.appendChild(el);
  };
  const origin = siteOrigin();
  for (const lng of LOCALES) add(lng, `${origin}/${lng}${tail}`);
  add('x-default', `${origin}/en${tail}`);
}

export function useDocumentMeta(route, locale, contentVersion) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const def = DEFAULTS[locale] || DEFAULTS.en;
    let title = def.title;
    let desc = def.desc;

    const type = route?.type;
    const id = route?.id;

    if (type === 'node' && id) {
      const n = STRINGS[locale]?.nodes?.[id] || STRINGS.en?.nodes?.[id];
      if (n?.title) { title = `${n.title} — ${SITE}`; desc = clamp(n.what || def.desc); }
    } else if (type === 'tutorial' && id) {
      const key = tutorialByNodeId[id] || id;
      const tut = STRINGS[locale]?.tutorials?.[key] || STRINGS.en?.tutorials?.[key];
      if (tut?.title) { title = `${tut.title} — ${SITE}`; desc = clamp(tut.subtitle || tut.whatItIs || def.desc); }
    } else if (type === 'path' && id) {
      const pa = STRINGS[locale]?.paths?.[id] || STRINGS.en?.paths?.[id];
      if (pa?.title) { title = `${pa.title} — ${SITE}`; desc = clamp(pa.description || def.desc); }
    } else if (type && SECTION[type]) {
      const label = SECTION[type][locale] || SECTION[type].en;
      title = `${label} — ${SITE}`;
    }

    document.title = title;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', desc);

    // Canonical и og:url — текущий путь.
    const url = siteOrigin() + (typeof window !== 'undefined' ? window.location.pathname : '/');
    setCanonical(url);
    setMeta('property', 'og:url', url);
    // Картинка превью — абсолютный адрес на текущем домене (автоподстройка).
    const ogImg = siteOrigin() + '/og-image.png';
    setMeta('property', 'og:image', ogImg);
    setMeta('name', 'twitter:image', ogImg);
    setAlternates();
  }, [route?.type, route?.id, locale, contentVersion]);
}
