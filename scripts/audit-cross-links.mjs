#!/usr/bin/env node
// scripts/audit-cross-links.mjs
//
// Аудит «мёртвых» отсылок в текстах узлов (RU/EN/FI).
//
// Что ищет:
//   1) Явные dead-refs: «FAB», «открой …», «см. узел», «есть туториал», «промпт …»
//   2) Имена концептов которые есть как отдельный узел, но в тексте упомянуты
//      обычным текстом без [[node:…]] обёртки (возможность вставить ссылку)
//
// Запуск:   node scripts/audit-cross-links.mjs > audit-cross-links.csv

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const LOCALES = ['ru', 'en', 'fi'];

// Уже существующий regex для inline-ссылок (синхронно с src/utils/inlineLinks.js)
const LINK_RE = /\[\[(node|tutorial|prompt):([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g;

function stripLinks(text) {
  return (text || '').replace(LINK_RE, '');
}

// Загружаем все узлы из локалей
function loadNodes(locale) {
  const fp = path.join(ROOT, 'src', 'locales', locale, 'nodes.json');
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

// Маппинг title→nodeId для каждой локали (для поиска упоминаний концептов)
function buildTitleIndex(nodes) {
  const idx = new Map(); // lowercased title → nodeId
  for (const [id, n] of Object.entries(nodes)) {
    if (n.title && n.title.length >= 3) {
      idx.set(n.title.toLowerCase().trim(), id);
    }
  }
  return idx;
}

// ───── Паттерны dead-refs по локалям ─────
const DEAD_PATTERNS = {
  ru: [
    { re: /\bFAB\b|Floating Action Button/i, kind: 'fab' },
    { re: /\bсм\.\s+(узел|раздел|туториал|пример)/i, kind: 'see' },
    { re: /\b(открой|нажми|подключи|пройди)\s+[«"]?[А-ЯA-Z][^.!?\n]{3,40}[»"]?/i, kind: 'imperative' },
    { re: /(готовый\s+)?промпт\s+[«"][^»"]+[»"]/i, kind: 'prompt-name' },
    { re: /туториал[а-я]?\s+[«"][^»"]+[»"]/i, kind: 'tutorial-name' },
    { re: /\b(в разделе|внутри раздела)\s+[«"]?[А-Я]/i, kind: 'section-ref' },
  ],
  en: [
    { re: /\bFAB\b|Floating Action Button/i, kind: 'fab' },
    { re: /\bsee\s+(node|section|tutorial)/i, kind: 'see' },
    { re: /\b(open|click|connect|go through)\s+[«"]?[A-Z][^.!?\n]{3,40}[»"]?/i, kind: 'imperative' },
    { re: /(ready-made\s+)?prompt\s+[«"][^»"]+[»"]/i, kind: 'prompt-name' },
    { re: /tutorial\s+[«"][^»"]+[»"]/i, kind: 'tutorial-name' },
    { re: /\b(in (the )?section|inside (the )?section)\s+[«"]?[A-Z]/i, kind: 'section-ref' },
  ],
  fi: [
    { re: /\bFAB\b/i, kind: 'fab' },
    { re: /\bks\.\s+(solmu|osio|oppitunti)/i, kind: 'see' },
  ],
};

const FIELDS = ['what', 'why', 'when', 'impact', 'example', 'mistakes'];

function findDeadRefs(text, locale) {
  if (!text) return [];
  const stripped = stripLinks(text);
  const hits = [];
  for (const { re, kind } of DEAD_PATTERNS[locale] || []) {
    const m = stripped.match(re);
    if (m) {
      const idx = stripped.indexOf(m[0]);
      const ctx = stripped.slice(Math.max(0, idx - 20), idx + m[0].length + 40).replace(/\n+/g, ' ');
      hits.push({ kind, match: m[0], context: ctx });
    }
  }
  return hits;
}

// Поиск упоминаний концептов (других узлов) в обычном тексте.
// Сильно фильтруем чтобы не давать ложных совпадений.
function findConceptMentions(text, currentNodeId, titleIndex) {
  if (!text) return [];
  const stripped = stripLinks(text);
  const lower = stripped.toLowerCase();
  const mentions = [];
  for (const [title, nodeId] of titleIndex.entries()) {
    if (nodeId === currentNodeId) continue;
    // Только мульти-словные титлы (одиночные слова дают шум)
    if (title.split(/\s+/).length < 2) continue;
    // Игнорируем titlы которые сами содержат подстроку из служебных
    if (title.length > 60) continue;
    if (lower.includes(title)) {
      const idx = lower.indexOf(title);
      mentions.push({ nodeId, title, context: stripped.slice(Math.max(0, idx - 20), idx + title.length + 30).replace(/\n+/g, ' ') });
    }
  }
  return mentions;
}

// ───── Main ─────
function csvEscape(s) {
  s = (s || '').toString();
  if (/["\n,]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const rows = [['locale', 'node_id', 'field', 'kind', 'match_or_target', 'context']];
let totalDead = 0;
let totalMentions = 0;

for (const locale of LOCALES) {
  const nodes = loadNodes(locale);
  const titleIndex = buildTitleIndex(nodes);

  for (const [id, node] of Object.entries(nodes)) {
    for (const field of FIELDS) {
      const text = node[field];
      if (!text) continue;

      // Dead refs
      const dead = findDeadRefs(text, locale);
      for (const d of dead) {
        rows.push([locale, id, field, `dead:${d.kind}`, d.match, d.context]);
        totalDead++;
      }

      // Concept mentions (только в локалях с большим словарём)
      if (locale === 'ru' || locale === 'en') {
        const mentions = findConceptMentions(text, id, titleIndex);
        for (const m of mentions) {
          rows.push([locale, id, field, 'mention', m.nodeId, m.context]);
          totalMentions++;
        }
      }
    }
  }
}

// Выводим CSV
console.log(rows.map(r => r.map(csvEscape).join(',')).join('\n'));

// Summary в stderr
console.error(`\n— Аудит закончен —`);
console.error(`Dead refs:        ${totalDead}`);
console.error(`Concept mentions: ${totalMentions}`);
console.error(`Всего строк: ${rows.length - 1}`);
