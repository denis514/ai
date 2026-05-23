#!/usr/bin/env node
// scripts/apply-concept-links-tutorials.mjs
//
// Авто-вставка [[node:X|title]] вокруг ПЕРВОГО упоминания «якорных»
// концептов в каждом текстовом поле каждого туториала. Аналог
// apply-concept-links.mjs, но для src/locales/<l>/tutorials.json.
//
// Структура tutorials.json:
//   {tutorialId: {title, subtitle, totalTime, whatItIs, approach,
//                 outcomes[], applyIn[{title, description}],
//                 pitfalls[], exercises[{question, hint}],
//                 steps: {stepId: {title, time, why, instructions[],
//                                  validate, tip, prompt?, example?,
//                                  troubleshoot?}}}}
//
// Запуск:
//   node scripts/apply-concept-links-tutorials.mjs [--dry]

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();

// Концепты — те же что в apply-concept-links.mjs
const CONCEPTS = {
  'claude-code': ['Claude Code'],
  'instructions': ['Custom Instructions'],
  'mcp': [],  // короткое, по-locale
  'skills': ['Claude Skills'],
  'projects': ['Claude Projects'],
  'ai-fundamentals': ['AI Fundamentals'],
  'cap-caching': ['Prompt caching'],
  'cc-plan-mode': ['Plan Mode'],
  'pr-fewshot': ['Few-shot examples', 'few-shot examples', 'few-shot prompting'],
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
    'af-rag-basics': ['RAG'],
    'af-llm-basics': ['LLM'],
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
    'af-rag-basics': ['RAG'],
    'af-llm-basics': ['LLM'],
  },
  fi: {
    'b-context': ['konteksti-ikkuna', 'konteksti-ikkunan'],
    'b-system': ['järjestelmäprompti', 'järjestelmäpromptin'],
    'pl-desktop': ['Claude Desktop'],
    'af-rag-basics': ['RAG'],
    'af-llm-basics': ['LLM'],
  },
};

const LOCALES = ['ru', 'en', 'fi'];

// Защита от вставки внутрь уже-существующих [[...]] ссылок
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
  const escaped = form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

/**
 * Применяет ссылки к одной текстовой строке. Возвращает новый текст
 * и обновляет triedTargets.
 */
function processText(text, allForms, triedTargets) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  // Pre-populate triedTargets из существующих [[type:id]]
  const existingLinkRe = /\[\[(?:node|tutorial|prompt):([a-z0-9-]+)/g;
  let em;
  while ((em = existingLinkRe.exec(text)) !== null) {
    triedTargets.add(em[1]);
  }
  for (const { tid, form } of allForms) {
    if (triedTargets.has(tid)) continue;
    const { text: newText, applied } = applyFirstMention(result, form, tid);
    if (applied) {
      result = newText;
      triedTargets.add(tid);
    }
  }
  return result;
}

function buildForms(locale) {
  const all = [];
  for (const [tid, forms] of Object.entries(CONCEPTS)) {
    for (const f of forms) all.push({ tid, form: f });
  }
  for (const [tid, forms] of Object.entries(LOCALE_FORMS[locale] || {})) {
    for (const f of forms) all.push({ tid, form: f });
  }
  // Длинные формы первыми, чтобы «Custom Instructions» матчил раньше «instructions»
  all.sort((a, b) => b.form.length - a.form.length);
  return all;
}

let totalApplied = 0;
const perLocale = {};

for (const locale of LOCALES) {
  const fp = path.join(ROOT, 'src', 'locales', locale, 'tutorials.json');
  if (!fs.existsSync(fp)) continue;
  const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  const allForms = buildForms(locale);
  let localeApplied = 0;

  for (const [tutId, tut] of Object.entries(data)) {
    // Per-tutorial triedTargets — кросс-полевая дедупликация
    const triedTargets = new Set();
    // Не линковать самого себя если у туториала есть nodeId
    // (тут nodeId хранится в tutorials.js — структура, не локаль, скип)

    const before = JSON.stringify(tut);

    // Top-level string fields
    for (const fld of ['whatItIs', 'approach']) {
      if (typeof tut[fld] === 'string') {
        tut[fld] = processText(tut[fld], allForms, triedTargets);
      }
    }
    // outcomes[]: string[]
    if (Array.isArray(tut.outcomes)) {
      tut.outcomes = tut.outcomes.map(s => processText(s, allForms, triedTargets));
    }
    // applyIn[]: {title, description}
    if (Array.isArray(tut.applyIn)) {
      tut.applyIn = tut.applyIn.map(item => ({
        ...item,
        description: processText(item.description, allForms, triedTargets)
      }));
    }
    // pitfalls[]: string[]
    if (Array.isArray(tut.pitfalls)) {
      tut.pitfalls = tut.pitfalls.map(s => processText(s, allForms, triedTargets));
    }
    // exercises[]: {question, hint}
    if (Array.isArray(tut.exercises)) {
      tut.exercises = tut.exercises.map(ex => ({
        ...ex,
        question: processText(ex.question, allForms, triedTargets),
        hint: ex.hint ? processText(ex.hint, allForms, triedTargets) : ex.hint
      }));
    }
    // steps: {stepId: {why, instructions[], validate, tip, example?, prompt?}}
    if (tut.steps && typeof tut.steps === 'object') {
      for (const [sid, step] of Object.entries(tut.steps)) {
        for (const fld of ['why', 'validate', 'tip', 'example', 'prompt']) {
          if (typeof step[fld] === 'string') {
            step[fld] = processText(step[fld], allForms, triedTargets);
          }
        }
        if (Array.isArray(step.instructions)) {
          step.instructions = step.instructions.map(s => processText(s, allForms, triedTargets));
        }
      }
    }

    const after = JSON.stringify(tut);
    if (before !== after) {
      // Считаем количество добавленных [[node:...]] до/после
      const linksBefore = (before.match(/\[\[node:/g) || []).length;
      const linksAfter = (after.match(/\[\[node:/g) || []).length;
      localeApplied += (linksAfter - linksBefore);
    }
  }

  if (!DRY) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }
  perLocale[locale] = localeApplied;
  totalApplied += localeApplied;
}

console.log(`\n— Apply concept links to tutorials${DRY ? ' (DRY)' : ''} —`);
for (const [l, n] of Object.entries(perLocale)) console.log(`  ${l}: ${n} new links`);
console.log(`  total: ${totalApplied}`);
