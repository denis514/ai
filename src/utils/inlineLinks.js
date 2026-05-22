// Парсер inline-ссылок в тексте узлов.
// Синтаксис: [[type:id]] или [[type:id|label]].
// Поддерживаемые типы: node, tutorial, prompt.
//
// Примеры:
//   "Используй [[prompt:create-project|готовый промпт «Создать Project»]]."
//   "Подробнее в [[node:sys-rag-architecture|RAG-архитектуре]]."
//   "Пройди [[tutorial:first-project]]."

const LINK_RE = /\[\[(node|tutorial|prompt):([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Парсит строку с inline-ссылками в массив частей.
 * @param {string} text
 * @returns {Array<{type:'text', value:string} | {type:'link', kind:'node'|'tutorial'|'prompt', id:string, label:string|null}>}
 */
export function parseInlineLinks(text) {
  if (!text || typeof text !== 'string') return [{ type: 'text', value: text || '' }];

  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset regex state (важно для глобальных regex)
  LINK_RE.lastIndex = 0;

  while ((match = LINK_RE.exec(text)) !== null) {
    const [full, kind, id, label] = match;
    const start = match.index;

    if (start > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, start) });
    }

    parts.push({
      type: 'link',
      kind,
      id,
      label: label ? label.trim() : null
    });

    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  // Если ссылок не было — возвращаем одну текстовую часть
  if (parts.length === 0) {
    parts.push({ type: 'text', value: text });
  }

  return parts;
}

/**
 * Извлекает только id-шники ссылок из текста — для аудита и построения relatedIds.
 * @param {string} text
 * @returns {Array<{kind:string, id:string}>}
 */
export function extractLinkRefs(text) {
  if (!text) return [];
  const refs = [];
  LINK_RE.lastIndex = 0;
  let match;
  while ((match = LINK_RE.exec(text)) !== null) {
    refs.push({ kind: match[1], id: match[2] });
  }
  return refs;
}
