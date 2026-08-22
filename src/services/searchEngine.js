/**
 * searchEngine.js — умный поиск «обычными словами» (этап 1 стратегии,
 * см. docs/smart-search-plan.md).
 *
 * MiniSearch + Snowball-стеммеры (ru/en/fi) + префиксный поиск + допуск
 * опечаток + взвешивание полей + карта синонимов. Один индекс на локаль,
 * собирается лениво при первом запросе (~десятки мс на нашем корпусе)
 * и кэшируется до смены локали/контента.
 *
 * Индексируются: узлы карты (title + все поля details), курсы (title +
 * subtitle; тела курсов лениво грузятся и в индекс не входят) и готовые
 * промпты. Оба потребителя — фильтр карты и палитра — используют один
 * и тот же индекс: search() возвращает ранжированный список
 * { id, type, score }, где type ∈ 'node' | 'tutorial' | 'prompt'.
 */

import MiniSearch from 'minisearch';
import { stemmer as stemRu } from '@orama/stemmers/russian';
import { stemmer as stemEn } from '@orama/stemmers/english';
import { stemmer as stemFi } from '@orama/stemmers/finnish';
import { SYNONYMS } from '../data/searchSynonyms.js';

const STEMMERS = { ru: stemRu, en: stemEn, fi: stemFi };

// Стоп-слова: при строгом И-поиске служебные слова душат запрос
// («сколько стоит» требовало бы слова «сколько» в теме). Списки маленькие
// и предметные — только частые слова запросов, не полный лингвистический набор.
const STOPWORDS = {
  ru: new Set(['и','в','во','на','с','со','к','ко','о','об','обо','за','из','у','по','до','не','ни','но','а','же','ли','бы','как','что','это','для','или','сколько','какой','какая','какие','когда','где','почему','можно','нужно','есть','мой','моя','мои','свой','через','при','от','то','так','вот','ещё','еще','уже','лучше']),
  en: new Set(['a','an','the','is','are','was','be','do','does','did','how','what','which','when','where','why','can','could','should','would','i','my','it','its','to','of','in','on','for','with','and','or','not','much','many','best','better']),
  fi: new Set(['ja','tai','ei','on','ovat','se','tämä','että','kuinka','mikä','mitä','missä','milloin','miksi','voi','voiko','paljonko','minun','oma','kanssa','ilman','myös','vielä','jo','paras']),
};

// Слишком короткие термы после стемминга дают шум; но односимвольные
// цифры/латиницу (например «5») оставляем — их мало.
function makeProcessTerm(locale) {
  const stem = STEMMERS[locale] || stemEn;
  const stop = STOPWORDS[locale];
  return (term) => {
    const t = term.toLowerCase();
    if (stop?.has(t)) return null; // выброшено и из индекса, и из запроса
    if (t.length <= 2) return t;
    try { return stem(t) || t; } catch { return t; }
  };
}

// ── Кэш индексов: несколько слотов (карта и палитра живут одновременно) ────
const indexCache = new Map(); // cacheKey → mini
const CACHE_MAX = 6;

function buildIndex(locale, sources) {
  const processTerm = makeProcessTerm(locale);
  const mini = new MiniSearch({
    fields: ['title', 'subtitle', 'body'],
    storeFields: ['type'],
    processTerm,
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,           // ~1 правка на короткое слово, 2 на длинное
      combineWith: 'AND',
      boost: { title: 5, subtitle: 2, body: 1 },
      processTerm,          // запрос стеммится так же, как индекс
    },
  });
  mini.addAll(sources);
  return mini;
}

/**
 * Получить (или собрать) индекс.
 * @param {string} name — имя потребителя ('map' | 'palette' | …)
 * @param {string} locale — локаль (выбирает стеммер и стоп-слова)
 * @param {number} version — contentVersion локали (инвалидация при смене контента)
 * @param {() => Array<{id,type,title,subtitle,body}>} getSources — ленивый сбор документов
 */
export function getIndex(name, locale, version, getSources) {
  const key = `${name}:${locale}:${version}`;
  const hit = indexCache.get(key);
  if (hit) return hit;
  const mini = buildIndex(locale, getSources());
  if (indexCache.size >= CACHE_MAX) {
    indexCache.delete(indexCache.keys().next().value); // простейший FIFO
  }
  indexCache.set(key, mini);
  return mini;
}

// Ключи синонимов сопоставляем по ОСНОВЕ слова: «интернете» находит ключ
// «интернет». Карта основ строится лениво на локаль.
const stemmedSynCache = {};
function stemmedSynonyms(locale) {
  if (stemmedSynCache[locale]) return stemmedSynCache[locale];
  const stem = STEMMERS[locale] || stemEn;
  const out = new Map();
  for (const [key, subs] of Object.entries(SYNONYMS[locale] || {})) {
    let k = key;
    try { k = key.length > 2 ? (stem(key) || key) : key; } catch { /* как есть */ }
    const prev = out.get(k) || [];
    out.set(k, [...prev, ...subs]);
  }
  stemmedSynCache[locale] = out;
  return out;
}

/** Расширение запроса синонимами (по основам слов). Возвращает 1-4 строки запроса. */
export function expandQuery(query, locale) {
  const map = stemmedSynonyms(locale);
  const stem = STEMMERS[locale] || stemEn;
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const variants = new Set([query]);
  for (const tok of tokens) {
    let k = tok;
    try { k = tok.length > 2 ? (stem(tok) || tok) : tok; } catch { /* как есть */ }
    const subs = map.get(k);
    if (!subs) continue;
    for (const sub of subs) {
      variants.add(tokens.map(t => (t === tok ? sub : t)).join(' '));
      if (variants.size >= 4) return [...variants];
    }
  }
  // Совокупный вариант: заменить ВСЕ найденные синонимы разом —
  // «поиск в интернете» → «search web» находит то, что по одной замене не находится.
  let cumulative = tokens.slice();
  let changed = false;
  for (let i = 0; i < cumulative.length; i++) {
    let k = cumulative[i];
    try { k = k.length > 2 ? (stem(k) || k) : k; } catch { /* как есть */ }
    const subs = map.get(k);
    if (subs && subs[0]) { cumulative[i] = subs[0]; changed = true; }
  }
  if (changed) variants.add(cumulative.join(' '));
  return [...variants];
}

/**
 * Умный поиск: ранжированный список { id, type, score }.
 * Синонимные варианты запроса сливаются по максимуму счёта.
 */
export function smartSearch(mini, query, locale, { limit = 60 } = {}) {
  const q = (query || '').trim();
  if (!q) return [];
  const byId = new Map();
  const collect = (results, penalty = 1) => {
    for (const r of results) {
      const score = r.score * penalty;
      const prev = byId.get(r.id);
      if (!prev || score > prev.score) {
        byId.set(r.id, { id: r.id, type: r.type, score });
      }
    }
  };
  const variants = expandQuery(q, locale);
  for (const variant of variants) collect(mini.search(variant));
  // Строгое И ничего не нашло (многословный запрос) — мягкий ИЛИ-фолбэк:
  // лучше показать частичные совпадения со скидкой, чем пустоту.
  if (byId.size === 0 && /\s/.test(q)) {
    for (const variant of variants) {
      collect(mini.search(variant, { combineWith: 'OR' }), 0.5);
    }
  }
  return [...byId.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}
