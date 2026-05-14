// Regenerates src/data/prompts.js and src/data/promptLibrary.js with
// structure-only entries. Text moves to locales/<lang>/{prompts,prompt-library}.json.
//
// prompts.js — structure: { id, icon }
// promptLibrary.js — structure: { id, category, level, icon }
//   PROMPT_CATEGORIES — { id: { icon } } (label/description out)
//   PROMPT_LEVELS — { id: { color } } (label out)

import { readyPrompts } from '../src/data/prompts.js';
import { promptLibrary, PROMPT_CATEGORIES, PROMPT_LEVELS } from '../src/data/promptLibrary.js';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const F_PROMPTS = resolve(__dirname, '../src/data/prompts.js');
const F_LIB = resolve(__dirname, '../src/data/promptLibrary.js');

// === prompts.js ===
const featured = readyPrompts.map(p => ({ id: p.id, icon: p.icon }));
const promptsSrc = `// Готовые промпты (структура). Текст — в src/locales/<lang>/prompts.json.
// Резолвинг через getLocalizedFeaturedPrompt() / getLocalizedFeaturedList().

export const readyPrompts = ${JSON.stringify(featured, null, 2)};
`;
writeFileSync(F_PROMPTS, promptsSrc, 'utf8');
console.log(`✓ Regenerated ${F_PROMPTS} (${featured.length} structures)`);

// === promptLibrary.js ===
const categoryStructs = {};
for (const [key, cat] of Object.entries(PROMPT_CATEGORIES)) {
  categoryStructs[key] = { icon: cat.icon };
}
const levelStructs = {};
for (const [key, lvl] of Object.entries(PROMPT_LEVELS)) {
  levelStructs[key] = { color: lvl.color };
}
const templates = promptLibrary.map(p => ({
  id: p.id,
  category: p.category,
  level: p.level,
  icon: p.icon
}));

const libSrc = `// Библиотека промпт-шаблонов (структура). Текст и labels — в
// src/locales/<lang>/prompt-library.json. Резолвинг через
// getLocalizedLibraryTemplate() / getLibraryCategoryLabel().

export const PROMPT_CATEGORIES = ${JSON.stringify(categoryStructs, null, 2)};

export const PROMPT_LEVELS = ${JSON.stringify(levelStructs, null, 2)};

export const promptLibrary = ${JSON.stringify(templates, null, 2)};

/** Быстрый индекс: id → структура шаблона */
export const promptIndex = Object.fromEntries(promptLibrary.map(p => [p.id, p]));

/** Считалка по категориям — для бейджей в UI */
export function countByCategory() {
  const counts = {};
  for (const key of Object.keys(PROMPT_CATEGORIES)) counts[key] = 0;
  for (const p of promptLibrary) counts[p.category] = (counts[p.category] || 0) + 1;
  return counts;
}
`;
writeFileSync(F_LIB, libSrc, 'utf8');
console.log(`✓ Regenerated ${F_LIB} (${templates.length} templates, ${Object.keys(categoryStructs).length} cats, ${Object.keys(levelStructs).length} levels)`);
