#!/usr/bin/env node
// scripts/apply-concept-links.mjs
//
// Автоматически вставляет [[node:X|title]] вокруг ПЕРВОГО упоминания концепта
// в каждом поле каждого узла (только если упоминание не уже в ссылке).
//
// Принцип: только высокочастотные «якорные» концепты, у которых есть отдельный
// узел в Atlas. Без ссылки на самого себя.
//
// Запуск: node scripts/apply-concept-links.mjs [--dry]

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();

// Список концептов: id → массив форм для поиска (case-insensitive, word boundary)
const CONCEPTS = {
  // Технические: те же слова в RU и EN
  'claude-code': ['Claude Code'],
  'instructions': ['Custom Instructions'],
  'mcp': [], // только в EN ниже (MCP слишком короткое для безопасной авто-вставки; вручную)
  'skills': ['Claude Skills'], // НЕ просто «Skills» — слишком общее
  'projects': ['Claude Projects'], // НЕ просто «Projects» — слишком общее
  'ai-fundamentals': ['AI Fundamentals'],
  'cap-caching': ['Prompt caching'],
  'cc-plan-mode': ['Plan Mode'],
  'pr-fewshot': ['Few-shot examples', 'few-shot examples', 'few-shot prompting'],
  // Новые добавления (волна 2)
  'pl-desktop': ['Claude Desktop'],
  'pl-web-setup': ['claude.ai'],
  'cap-computer': ['Computer Use', 'computer use'],
  'cap-files': ['Files API', 'files API'],
  'cap-vision': ['Vision API'],
  'cap-thinking': ['extended thinking'],
  'cap-code-exec': ['code execution'],
  'sys-rag-architecture': ['RAG architecture'],
  'cc-cmd-compact': ['/compact'],
  'cc-cmd-clear': ['/clear'],
  'cc-cmd-init': ['/init'],
  'cc-md': ['CLAUDE.md'],
  'cc-hooks': ['Claude Code hooks', 'CC hooks'],
};

// Локализованные формы для концептов, чьи titlы отличаются в RU vs EN
const LOCALE_FORMS = {
  ru: {
    'b-context': ['контекстное окно', 'контекстного окна', 'контекстном окне'],
    'b-system': ['системный промпт', 'системного промпта', 'системному промпту'],
    'cap-tools': ['Tool use'],
    'cap-search': ['Web search'],
    'p-team': ['командная работа', 'командной работы'],
    'p-instructions': ['Project instructions', 'project-инструкции'],
    'i-claudemd': ['CLAUDE.md'],
    'i-style': ['стиль письма', 'стиль ответов'],
    'cap-memory': ['Memory tool', 'memory tool'],
    'cap-citations': ['Citations API', 'citations'],
    'af-vector-db': ['vector database', 'векторная база'],
    'af-embeddings': ['embeddings'],
  },
  en: {
    'b-context': ['context window'],
    'b-system': ['system prompt'],
    'cap-tools': ['tool use'],
    'cap-search': ['web search'],
    'p-team': ['team work'],
    'p-instructions': ['Project instructions'],
    'cap-memory': ['Memory tool'],
    'cap-citations': ['Citations API'],
    'af-vector-db': ['vector database'],
    'af-embeddings': ['embeddings'],
  },
  fi: {
    'b-context': ['konteksti-ikkuna', 'konteksti-ikkunan'],
    'b-system': ['järjestelmäprompti', 'järjestelmäpromptin'],
    'pl-desktop': ['Claude Desktop'],
  },
};

const FIELDS = ['what', 'why', 'when', 'impact', 'example', 'mistakes'];
const LOCALES = ['ru', 'en', 'fi'];

// Уже-внутри-ссылки проверка
const EXISTING_LINK_RE = /\[\[[^\]]+\]\]/g;

function getProtectedRanges(text) {
  const ranges = [];
  EXISTING_LINK_RE.lastIndex = 0;
  let m;
  while ((m = EXISTING_LINK_RE.exec(text)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  return ranges;
}

function inProtected(pos, ranges) {
  for (const [a, b] of ranges) if (pos >= a && pos < b) return true;
  return false;
}

function applyFirstMention(text, form, nodeId) {
  if (!text) return { text, applied: false };
  const ranges = getProtectedRanges(text);
  // Word boundary: чтобы «Skills» не цеплялся в «Claude Skills» (если уже есть)
  // и чтобы не цеплять подстроку.
  // Учитываем что русские слова не подходят под \b — для них делаем lookahead-lookbehind по не-буквенным.
  const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Используем case-insensitive
  const re = new RegExp(`(?<![\\p{L}\\p{N}-])${escaped}(?![\\p{L}\\p{N}-])`, 'iu');
  const m = text.match(re);
  if (!m) return { text, applied: false };
  const idx = text.indexOf(m[0]);
  if (inProtected(idx, ranges)) return { text, applied: false };
  const matched = m[0];
  const replacement = `[[node:${nodeId}|${matched}]]`;
  return {
    text: text.slice(0, idx) + replacement + text.slice(idx + matched.length),
    applied: true
  };
}

let totalApplied = 0;
const perLocale = {};

for (const locale of LOCALES) {
  const fp = path.join(ROOT, 'src', 'locales', locale, 'nodes.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  let localeApplied = 0;

  for (const [nodeId, node] of Object.entries(data)) {
    for (const field of FIELDS) {
      if (!node[field]) continue;
      let text = node[field];

      // Для каждой пары (targetId, форма) — пытаемся подставить ПЕРВУЮ
      // попавшуюся в этом поле. Внутри одного поля только ОДНА вставка
      // на target (чтобы не было «Claude Code … Claude Code» оба линкованы).
      // Также skip targetы которые уже линкованы в этом поле через любую форму.
      const triedTargets = new Set();
      // Pre-populate: targetы которые уже встречаются в [[...]] этого поля
      const existingLinkRe = /\[\[(?:node|tutorial|prompt):([a-z0-9-]+)/g;
      let em;
      while ((em = existingLinkRe.exec(text)) !== null) {
        triedTargets.add(em[1]);
      }
      const allForms = [];
      for (const [tid, forms] of Object.entries(CONCEPTS)) {
        if (tid === nodeId) continue;
        for (const f of forms) allForms.push({ tid, form: f });
      }
      for (const [tid, forms] of Object.entries(LOCALE_FORMS[locale] || {})) {
        if (tid === nodeId) continue;
        for (const f of forms) allForms.push({ tid, form: f });
      }

      // Сортируем формы по убыванию длины — длинные первыми («Custom Instructions» раньше «instructions»)
      allForms.sort((a, b) => b.form.length - a.form.length);

      for (const { tid, form } of allForms) {
        if (triedTargets.has(tid)) continue;
        const { text: newText, applied } = applyFirstMention(text, form, tid);
        if (applied) {
          text = newText;
          triedTargets.add(tid);
          localeApplied++;
        }
      }

      node[field] = text;
    }
  }

  if (!DRY) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }
  perLocale[locale] = localeApplied;
  totalApplied += localeApplied;
}

console.log(`\n— Apply concept links${DRY ? ' (DRY)' : ''} —`);
for (const [l, n] of Object.entries(perLocale)) console.log(`  ${l}: ${n} links inserted`);
console.log(`  total: ${totalApplied}`);
