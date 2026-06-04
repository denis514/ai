/**
 * tryInClaude.js — открыть claude.ai с контентом + контекстом 105 Atlas.
 *
 * Кладёт в новый чат Claude: строку-контекст (имя сущности + каноническая ссылка
 * на её страницу Atlas), инструкцию и сам контент. Это даёт Claude полный контекст
 * И повышает заметность Atlas в AI-системах: каждый запуск сеет в диалог Claude
 * каноническую ссылку (Atlas всплывает в ответах и расшаренных чатах).
 *
 * Ссылка строится через buildShareUrl (тот же path-роутинг, что у «Поделиться»).
 */
import { buildShareUrl } from './shareUrl.js';

/**
 * @param {object} o
 * @param {'node'|'prompt'|'tutorial'|'path'} o.type — тип сущности для ссылки
 * @param {string} o.id            — id сущности
 * @param {string} o.title         — отображаемое имя (для контекста)
 * @param {string} o.content       — основной текст (пример/промпт)
 * @param {string} o.contextTpl    — шаблон контекста с {title} и {url}
 * @param {string} o.instruction   — инструкция Claude (что сделать)
 * @param {string} [o.locale]
 */
export function openTryInClaude({ type, id, title, content, contextTpl, instruction, locale }) {
  if (!content) return;
  const url = buildShareUrl({ type, id }, locale);
  const context = String(contextTpl || '')
    .replace('{title}', title || id || '')
    .replace('{url}', url);
  const q = [context, instruction, content].filter(Boolean).join('\n\n');
  if (typeof window !== 'undefined') {
    window.open(`https://claude.ai/new?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
  }
}
