#!/usr/bin/env node
/**
 * Data lint — превращает правила из docs/content-rules.md в исполняемые проверки.
 *
 * Запуск: node scripts/lint-data.mjs
 *
 * Проверяет:
 *  - mindmap: schema (6 details fields), уникальность id, валидные icon/category,
 *             глубина <= 4, ширина <= 18, длина title <= 30
 *  - prompts.js: валидные icon
 *  - promptLibrary.js: схема, валидные category/level/icon, уникальные id
 *  - tutorials.js: валидные icon
 *
 * Exit code: 0 — ok (могут быть warnings), 1 — есть errors.
 */
import { mindmapData, CATEGORIES } from '../src/data/mindmapData.js';
import { readyPrompts } from '../src/data/prompts.js';
import {
  promptLibrary,
  PROMPT_CATEGORIES,
  PROMPT_LEVELS
} from '../src/data/promptLibrary.js';
import { tutorials } from '../src/data/tutorials.js';
import { learningPaths } from '../src/data/learningPaths.js';
import nodesRu from '../src/locales/ru/nodes.json' with { type: 'json' };
import nodesEn from '../src/locales/en/nodes.json' with { type: 'json' };
import nodesFi from '../src/locales/fi/nodes.json' with { type: 'json' };
import tutorialsRu from '../src/locales/ru/tutorials.json' with { type: 'json' };
import tutorialsEn from '../src/locales/en/tutorials.json' with { type: 'json' };
import tutorialsFi from '../src/locales/fi/tutorials.json' with { type: 'json' };
import promptsRu from '../src/locales/ru/prompts.json' with { type: 'json' };
import promptsEn from '../src/locales/en/prompts.json' with { type: 'json' };
import promptsFi from '../src/locales/fi/prompts.json' with { type: 'json' };
import libraryRu from '../src/locales/ru/prompt-library.json' with { type: 'json' };
import libraryEn from '../src/locales/en/prompt-library.json' with { type: 'json' };
import libraryFi from '../src/locales/fi/prompt-library.json' with { type: 'json' };
import pathsRu from '../src/locales/ru/paths.json' with { type: 'json' };
import pathsEn from '../src/locales/en/paths.json' with { type: 'json' };
import pathsFi from '../src/locales/fi/paths.json' with { type: 'json' };
import glossary from '../src/locales/glossary.json' with { type: 'json' };
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// ---------------------------------------------------------------
// 1. Извлекаем валидные имена иконок из Icon.jsx (parse REGISTRY)
// ---------------------------------------------------------------
const iconJsxPath = resolve(__dirname, '../src/components/Icon.jsx');
const iconSrc = readFileSync(iconJsxPath, 'utf8');
const registryMatch = iconSrc.match(/const REGISTRY = \{([\s\S]*?)\n\};/);
if (!registryMatch) {
  console.error('FATAL: cannot parse REGISTRY block in Icon.jsx');
  process.exit(2);
}
const registryBlock = registryMatch[1];
const iconNames = new Set();
// Принимаем: bareKey: или 'quoted-key':
const keyRe = /^\s*(?:['"]([^'"]+)['"]|([A-Za-z_$][A-Za-z0-9_$]*))\s*:/gm;
let m;
while ((m = keyRe.exec(registryBlock)) !== null) {
  iconNames.add(m[1] || m[2]);
}

// ---------------------------------------------------------------
// 2. Mindmap
// ---------------------------------------------------------------
const ALLOWED_CATEGORIES = new Set(Object.keys(CATEGORIES));
const REQUIRED_DETAILS = ['what', 'why', 'when', 'impact', 'example', 'mistakes'];
const MAX_DEPTH = 4;
// Ширина ветки. Порог 18: широкие хабы (foundation, claude-code, use-cases,
// ec) — осознанные каталоги/инструменты. Группировать их нельзя без выхода
// за глубину 4 (правило «≤3 клика до узла»), поэтому плоский-широкий вид
// предпочтительнее глубокого. См. §6/§9 CLAUDE.md.
const MAX_WIDTH = 18;
const MAX_TITLE_LEN = 30;

const allIds = new Map(); // id -> human-readable path

function walk(node, depth = 0, path = []) {
  const here = [...path, node.id].join(' > ');

  // id присутствует и уникален
  if (!node.id) {
    err(`[mindmap] node without id at "${here}"`);
  } else if (allIds.has(node.id)) {
    err(`[mindmap] duplicate id "${node.id}" at ${here} (first: ${allIds.get(node.id)})`);
  } else {
    allIds.set(node.id, here);
  }

  // category
  if (!ALLOWED_CATEGORIES.has(node.category)) {
    err(`[mindmap] unknown category "${node.category}" on "${node.id}"`);
  }

  // icon
  if (!node.icon) {
    err(`[mindmap] missing icon on "${node.id}"`);
  } else if (!iconNames.has(node.icon)) {
    err(`[mindmap] unknown icon "${node.icon}" on "${node.id}" — add to Icon.jsx REGISTRY`);
  }

  // details + title теперь живут в locales/ru/nodes.json — проверяем там.
  const content = nodesRu[node.id];
  if (!content) {
    err(`[mindmap] no content in locales/ru/nodes.json for "${node.id}"`);
  } else {
    if (!content.title || content.title.trim().length === 0) {
      err(`[locales/ru/nodes] empty title on "${node.id}"`);
    } else if (content.title.length > MAX_TITLE_LEN) {
      warn(`[locales/ru/nodes] title >${MAX_TITLE_LEN} chars on "${node.id}" (${content.title.length})`);
    }
    for (const k of REQUIRED_DETAILS) {
      const v = content[k];
      if (!v || (typeof v === 'string' && v.trim().length === 0)) {
        err(`[locales/ru/nodes] empty ${k} on "${node.id}"`);
      }
    }
  }

  // depth / width
  if (depth > MAX_DEPTH) {
    warn(`[mindmap] depth ${depth} > ${MAX_DEPTH} at "${node.id}"`);
  }
  const childCount = node.children?.length || 0;
  if (childCount > MAX_WIDTH) {
    warn(`[mindmap] width ${childCount} > ${MAX_WIDTH} at "${node.id}"`);
  }

  // relatedIds (опционально) — должны указывать на существующие узлы
  if (node.relatedIds) {
    if (!Array.isArray(node.relatedIds)) {
      err(`[mindmap] relatedIds must be array on "${node.id}"`);
    } else {
      for (const rid of node.relatedIds) {
        if (rid === node.id) {
          warn(`[mindmap] self-reference in relatedIds on "${node.id}"`);
        }
        // Проверка существования будет после полного обхода (отложим)
        node.__pendingRelated = node.relatedIds;
      }
    }
  }

  if (node.children) {
    for (const c of node.children) walk(c, depth + 1, [...path, node.id]);
  }
}

walk(mindmapData);

// Locale completeness: все id из mindmapData должны быть в en/fi.
const ruIds = new Set(Object.keys(nodesRu));
const enMissing = [];
const fiMissing = [];
for (const id of ruIds) {
  if (!nodesEn[id]) enMissing.push(id);
  if (!nodesFi[id]) fiMissing.push(id);
}
if (enMissing.length > 0) {
  warn(`[locales/en/nodes] ${enMissing.length} missing keys: ${enMissing.slice(0, 5).join(', ')}${enMissing.length > 5 ? '…' : ''}`);
}
if (fiMissing.length > 0) {
  warn(`[locales/fi/nodes] ${fiMissing.length} missing keys: ${fiMissing.slice(0, 5).join(', ')}${fiMissing.length > 5 ? '…' : ''}`);
}

// Пост-обход: проверить что все relatedIds указывают на существующие узлы
function checkRelated(node) {
  if (node.relatedIds && Array.isArray(node.relatedIds)) {
    for (const rid of node.relatedIds) {
      if (rid === node.id) continue; // warn уже выдан
      if (!allIds.has(rid)) {
        err(`[mindmap] relatedIds dangling reference: "${node.id}" → "${rid}" (not found)`);
      }
    }
  }
  if (node.children) for (const c of node.children) checkRelated(c);
}
checkRelated(mindmapData);

// ---------------------------------------------------------------
// 3. prompts.js (10 featured)
// ---------------------------------------------------------------
const promptIds = new Set();
for (const p of readyPrompts) {
  if (!p.id) err(`[prompts] node without id`);
  else if (promptIds.has(p.id)) err(`[prompts] duplicate id "${p.id}"`);
  else promptIds.add(p.id);
  if (!p.icon) err(`[prompts] missing icon on "${p.id}"`);
  else if (!iconNames.has(p.icon)) err(`[prompts] unknown icon "${p.icon}" on "${p.id}"`);
  // Контент теперь в locales/ru/prompts.json.
  const pc = promptsRu[p.id];
  if (!pc) {
    err(`[prompts] no content in locales/ru/prompts.json for "${p.id}"`);
  } else {
    if (!pc.title || !pc.description || !pc.text) {
      err(`[locales/ru/prompts] missing field (title/description/text) on "${p.id}"`);
    }
  }
}
// Featured prompts locale completeness.
const pEnMissing = Object.keys(promptsRu).filter(id => !promptsEn[id]);
const pFiMissing = Object.keys(promptsRu).filter(id => !promptsFi[id]);
if (pEnMissing.length > 0) warn(`[locales/en/prompts] ${pEnMissing.length} missing keys`);
if (pFiMissing.length > 0) warn(`[locales/fi/prompts] ${pFiMissing.length} missing keys`);

// ---------------------------------------------------------------
// 4. promptLibrary.js
// ---------------------------------------------------------------
const ALLOWED_LEVELS = new Set(Object.keys(PROMPT_LEVELS));
const ALLOWED_LIB_CATS = new Set(Object.keys(PROMPT_CATEGORIES));
const libIds = new Set();
for (const p of promptLibrary) {
  if (!p.id) err(`[library] template without id`);
  else if (libIds.has(p.id)) err(`[library] duplicate id "${p.id}"`);
  else libIds.add(p.id);
  if (!iconNames.has(p.icon)) err(`[library] unknown icon "${p.icon}" on "${p.id}"`);
  if (!ALLOWED_LIB_CATS.has(p.category)) err(`[library] unknown category "${p.category}" on "${p.id}"`);
  if (!ALLOWED_LEVELS.has(p.level)) err(`[library] unknown level "${p.level}" on "${p.id}"`);
  // Контент теперь в locales/ru/prompt-library.json
  const lc = libraryRu.templates?.[p.id];
  if (!lc) {
    err(`[library] no content in locales/ru/prompt-library.json for "${p.id}"`);
  } else if (!lc.title || !lc.description || !lc.text) {
    err(`[locales/ru/prompt-library] missing field (title/description/text) on "${p.id}"`);
  }
}

// Также проверяем, что иконки самих категорий есть в реестре
for (const [key, cat] of Object.entries(PROMPT_CATEGORIES)) {
  if (!iconNames.has(cat.icon)) {
    err(`[library] category "${key}" uses unknown icon "${cat.icon}"`);
  }
  // Категории должны иметь label в локали ru.
  const ruCat = libraryRu.categories?.[key];
  if (!ruCat || !ruCat.label) {
    err(`[locales/ru/prompt-library] missing categories.${key}.label`);
  }
}
// Levels label check.
for (const key of Object.keys(PROMPT_LEVELS)) {
  if (!libraryRu.levels?.[key]?.label) {
    err(`[locales/ru/prompt-library] missing levels.${key}.label`);
  }
}
// Library locale completeness.
const lEnMissing = Object.keys(libraryRu.templates || {}).filter(id => !libraryEn.templates?.[id]);
const lFiMissing = Object.keys(libraryRu.templates || {}).filter(id => !libraryFi.templates?.[id]);
if (lEnMissing.length > 0) warn(`[locales/en/prompt-library] ${lEnMissing.length} missing template keys`);
if (lFiMissing.length > 0) warn(`[locales/fi/prompt-library] ${lFiMissing.length} missing template keys`);

// ---------------------------------------------------------------
// 5. tutorials.js
// ---------------------------------------------------------------
let tutCount = 0;
const ALLOWED_TUT_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
const tutorialIds = new Set(Object.keys(tutorials));

for (const [id, t] of Object.entries(tutorials)) {
  tutCount++;
  if (t.icon && !iconNames.has(t.icon)) {
    err(`[tutorials] unknown icon "${t.icon}" on "${id}"`);
  }
  // tutorial.nodeId должен ссылаться на существующий узел mindmap
  if (t.nodeId && !allIds.has(t.nodeId)) {
    err(`[tutorials] "${id}" references non-existent mindmap node "${t.nodeId}"`);
  }

  // === Новые поля (level, whatItIs, outcomes, prerequisites, approach,
  // applyIn, relatedPrompts, pitfalls, exercises) — все опциональны для
  // обратной совместимости, но если присутствуют — должны быть валидны.
  if (t.level !== undefined && !ALLOWED_TUT_LEVELS.has(t.level)) {
    err(`[tutorials] "${id}": unknown level "${t.level}" (expected beginner/intermediate/advanced)`);
  }

  if (t.prerequisites !== undefined) {
    if (!Array.isArray(t.prerequisites)) {
      err(`[tutorials] "${id}": prerequisites must be array`);
    } else {
      for (const pid of t.prerequisites) {
        if (!tutorialIds.has(pid)) {
          err(`[tutorials] "${id}": prerequisites references non-existent tutorial "${pid}"`);
        }
      }
    }
  }

  if (t.relatedPrompts !== undefined) {
    if (!Array.isArray(t.relatedPrompts)) {
      err(`[tutorials] "${id}": relatedPrompts must be array`);
    } else {
      // Ссылка может быть как на featured prompt (prompts.js), так и на
      // library template (promptLibrary.js) — оба валидны.
      for (const pid of t.relatedPrompts) {
        if (!libIds.has(pid) && !promptIds.has(pid)) {
          err(`[tutorials] "${id}": relatedPrompts references non-existent prompt "${pid}" (not in featured or library)`);
        }
      }
    }
  }

  // Контентные поля (outcomes / pitfalls / applyIn / exercises) теперь
  // в locales/ru/tutorials.json. Проверяем там.
  const tc = tutorialsRu[id];
  if (!tc) {
    err(`[tutorials] no content in locales/ru/tutorials.json for "${id}"`);
  } else {
    if (!tc.title) err(`[locales/ru/tutorials] "${id}": missing title`);
    if (!tc.subtitle) warn(`[locales/ru/tutorials] "${id}": missing subtitle`);
    if (tc.applyIn && !Array.isArray(tc.applyIn)) {
      err(`[locales/ru/tutorials] "${id}": applyIn must be array`);
    } else if (Array.isArray(tc.applyIn)) {
      for (const a of tc.applyIn) {
        if (!a.title || !a.description) {
          err(`[locales/ru/tutorials] "${id}": applyIn entry must have title and description`);
        }
      }
    }
    if (tc.exercises && Array.isArray(tc.exercises)) {
      for (const e of tc.exercises) {
        if (!e.question) {
          err(`[locales/ru/tutorials] "${id}": exercise entry must have question`);
        }
      }
    }
  }
}

// Tutorials locale completeness.
const tEnMissing = [];
const tFiMissing = [];
for (const id of Object.keys(tutorialsRu)) {
  if (!tutorialsEn[id]) tEnMissing.push(id);
  if (!tutorialsFi[id]) tFiMissing.push(id);
}
if (tEnMissing.length > 0) warn(`[locales/en/tutorials] ${tEnMissing.length} missing keys: ${tEnMissing.slice(0, 5).join(', ')}${tEnMissing.length > 5 ? '…' : ''}`);
if (tFiMissing.length > 0) warn(`[locales/fi/tutorials] ${tFiMissing.length} missing keys: ${tFiMissing.slice(0, 5).join(', ')}${tFiMissing.length > 5 ? '…' : ''}`);

// ---------------------------------------------------------------
// 6. learningPaths.js
// ---------------------------------------------------------------
const pathIds = new Set();
const ALLOWED_STEP_TYPES = new Set(['node', 'tutorial', 'prompt']);
const ALLOWED_PATH_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
for (const path of learningPaths) {
  if (!path.id) err(`[paths] path without id`);
  else if (pathIds.has(path.id)) err(`[paths] duplicate path id "${path.id}"`);
  else pathIds.add(path.id);

  if (!path.icon) err(`[paths] missing icon on path "${path.id}"`);
  else if (!iconNames.has(path.icon)) err(`[paths] unknown icon "${path.icon}" on path "${path.id}"`);

  if (!ALLOWED_PATH_LEVELS.has(path.level)) {
    err(`[paths] unknown level "${path.level}" on path "${path.id}"`);
  }

  // Контент (title/description/duration/step.why) — в locales/ru/paths.json.
  const pc = pathsRu[path.id];
  if (!pc) {
    err(`[paths] no content in locales/ru/paths.json for "${path.id}"`);
  } else if (!pc.title || !pc.description) {
    err(`[locales/ru/paths] missing title/description on "${path.id}"`);
  }

  if (!Array.isArray(path.steps) || path.steps.length === 0) {
    err(`[paths] path "${path.id}" has no steps`);
    continue;
  }

  for (const step of path.steps) {
    if (!ALLOWED_STEP_TYPES.has(step.type)) {
      err(`[paths] "${path.id}": unknown step type "${step.type}"`);
      continue;
    }
    if (!step.id) {
      err(`[paths] "${path.id}": step without id (type=${step.type})`);
      continue;
    }
    // Проверка существования ссылки
    let exists = false;
    if (step.type === 'node') exists = allIds.has(step.id);
    else if (step.type === 'tutorial') exists = !!tutorials[step.id];
    else if (step.type === 'prompt') exists = libIds.has(step.id);

    if (!exists) {
      err(`[paths] "${path.id}": dangling ${step.type} reference "${step.id}"`);
    }
  }
}

// Paths locale completeness.
const pathEnMissing = Object.keys(pathsRu).filter(id => !pathsEn[id]);
const pathFiMissing = Object.keys(pathsRu).filter(id => !pathsFi[id]);
if (pathEnMissing.length > 0) warn(`[locales/en/paths] ${pathEnMissing.length} missing keys`);
if (pathFiMissing.length > 0) warn(`[locales/fi/paths] ${pathFiMissing.length} missing keys`);

// ---------------------------------------------------------------
// 7. Glossary check — английские термины не должны быть переведены в FI
// ---------------------------------------------------------------
// Стратегия: считаем вхождения каждого термина в RU-локалях vs FI-локалях.
// Если FI-counts заметно ниже RU-counts — термин был, скорее всего, переведён.
// Толерантность: 50% (термин может пропасть из-за переформулировки).
function collectStrings(obj, out = []) {
  if (typeof obj === 'string') { out.push(obj); return out; }
  if (Array.isArray(obj)) { for (const x of obj) collectStrings(x, out); return out; }
  if (obj && typeof obj === 'object') { for (const v of Object.values(obj)) collectStrings(v, out); return out; }
  return out;
}
function countTerm(strings, term) {
  // Word-boundary count, case-sensitive (термины из глоссария — с сохранением регистра).
  // Используем escape для regex-чувствительных символов.
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Не требуем word-boundary, потому что после термина может идти `:`, `-`, etc.
  const re = new RegExp(escaped, 'g');
  let count = 0;
  for (const s of strings) {
    count += (s.match(re) || []).length;
  }
  return count;
}

const ruAll = [
  ...collectStrings(nodesRu),
  ...collectStrings(tutorialsRu),
  ...collectStrings(promptsRu),
  ...collectStrings(libraryRu),
  ...collectStrings(pathsRu)
];
const fiAll = [
  ...collectStrings(nodesFi),
  ...collectStrings(tutorialsFi),
  ...collectStrings(promptsFi),
  ...collectStrings(libraryFi),
  ...collectStrings(pathsFi)
];

const glossaryTerms = Array.isArray(glossary.terms) ? glossary.terms : [];
let glossaryDropped = 0;
for (const term of glossaryTerms) {
  const ruN = countTerm(ruAll, term);
  if (ruN === 0) continue; // термин не используется в текущем контенте — норма
  const fiN = countTerm(fiAll, term);
  if (fiN < ruN * 0.5) {
    glossaryDropped++;
    warn(`[glossary] term "${term}" appears ${ruN}× in RU but only ${fiN}× in FI — possibly translated`);
  }
}

// ---------------------------------------------------------------
// Отчёт
// ---------------------------------------------------------------
const C = {
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`
};

console.log(C.bold('\nData lint summary'));
console.log(C.dim('─'.repeat(50)));
console.log(`  Mindmap nodes:    ${allIds.size}`);
console.log(`  Featured prompts: ${readyPrompts.length}`);
console.log(`  Library templates:${promptLibrary.length}`);
console.log(`  Tutorials:        ${tutCount}`);
console.log(`  Learning paths:   ${learningPaths.length}`);
console.log(`  Icons registered: ${iconNames.size}`);
console.log(`  Glossary terms:   ${glossaryTerms.length}`);

if (warnings.length) {
  console.log(C.yellow(`\n⚠ Warnings (${warnings.length})`));
  for (const w of warnings) console.log('  • ' + w);
}

if (errors.length) {
  console.log(C.red(`\n✗ Errors (${errors.length})`));
  for (const e of errors) console.log('  • ' + e);
  console.log(C.red(`\nFix ${errors.length} error(s) before commit.\n`));
  process.exit(1);
} else {
  console.log(C.green('\n✓ Data lint passed.'));
  if (warnings.length) console.log(C.dim(`  (${warnings.length} warnings — not blocking)`));
  console.log('');
  process.exit(0);
}
