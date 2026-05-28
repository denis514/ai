import React from 'react';

/**
 * Markdown — минимальный безопасный рендерер Markdown в React-элементы.
 *
 * Зачем свой, а не библиотека: CLAUDE.md §5/§13 запрещает новые runtime-зависимости
 * без обоснования. Результат агента — это короткий ответ Claude (заголовки, списки,
 * жирный, код, ссылки), поэтому достаточно лёгкого парсера.
 *
 * Безопасность: НЕ используем dangerouslySetInnerHTML — строим React-узлы, поэтому
 * произвольный HTML из ответа модели не исполняется. Ссылки открываются с
 * rel="noopener noreferrer".
 *
 * Поддержка: # … ###### заголовки, **жирный**, *курсив* / _курсив_, `код`,
 * ```блоки кода```, - / * списки, 1. нумерованные списки, > цитаты, абзацы.
 */

// ─── Inline: код / жирный / курсив / ссылки ──────────────────────────────────
const INLINE_RULES = [
  { re: /`([^`]+)`/, render: (m, k) => <code key={k} className="md-code">{m[1]}</code> },
  { re: /\*\*([^*]+)\*\*/, render: (m, k) => <strong key={k}>{parseInline(m[1])}</strong> },
  { re: /__([^_]+)__/, render: (m, k) => <strong key={k}>{parseInline(m[1])}</strong> },
  { re: /\*([^*\n]+)\*/, render: (m, k) => <em key={k}>{parseInline(m[1])}</em> },
  { re: /_([^_\n]+)_/, render: (m, k) => <em key={k}>{parseInline(m[1])}</em> },
  {
    re: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/,
    render: (m, k) => (
      <a key={k} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>
    ),
  },
];

function parseInline(text) {
  if (!text) return [];
  // Находим самое раннее совпадение среди всех правил, рекурсивно разбираем остаток.
  let earliest = null;
  for (const rule of INLINE_RULES) {
    const m = rule.re.exec(text);
    if (m && (earliest === null || m.index < earliest.m.index)) {
      earliest = { rule, m };
    }
  }
  if (!earliest) return [text];
  const { rule, m } = earliest;
  const before = text.slice(0, m.index);
  const after = text.slice(m.index + m[0].length);
  const key = `${m.index}-${m[0].length}`;
  return [
    ...(before ? [before] : []),
    rule.render(m, key),
    ...parseInline(after),
  ];
}

// ─── Block-level ──────────────────────────────────────────────────────────────
export default function Markdown({ text = '', className = '' }) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Блок кода ```
    if (/^```/.test(line.trim())) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) { buf.push(lines[i]); i++; }
      i++; // закрывающая ```
      blocks.push(<pre key={key++} className="md-pre"><code>{buf.join('\n')}</code></pre>);
      continue;
    }

    // Заголовок # … ######
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = Math.min(h[1].length, 4); // визуально не глубже h4
      const Tag = `h${lvl + 2}`; // h1→h3 … чтобы не конкурировать с заголовком панели
      blocks.push(<Tag key={key++} className="md-h">{parseInline(h[2])}</Tag>);
      i++;
      continue;
    }

    // Цитата >
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      blocks.push(<blockquote key={key++} className="md-quote">{parseInline(buf.join(' '))}</blockquote>);
      continue;
    }

    // Нумерованный список
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++;
      }
      blocks.push(
        <ol key={key++} className="md-ol">
          {items.map((it, idx) => <li key={idx}>{parseInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    // Маркированный список
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++;
      }
      blocks.push(
        <ul key={key++} className="md-ul">
          {items.map((it, idx) => <li key={idx}>{parseInline(it)}</li>)}
        </ul>
      );
      continue;
    }

    // Пустая строка
    if (line.trim() === '') { i++; continue; }

    // Абзац: собираем подряд идущие непустые строки
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^```/.test(lines[i].trim()) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i])
    ) { buf.push(lines[i]); i++; }
    blocks.push(<p key={key++} className="md-p">{parseInline(buf.join(' '))}</p>);
  }

  return <div className={`md ${className}`.trim()}>{blocks}</div>;
}
