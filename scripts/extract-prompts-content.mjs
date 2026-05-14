// Extracts textual content from src/data/prompts.js + src/data/promptLibrary.js
// into src/locales/ru/{prompts,prompt-library}.json. Phase 3c migration.
//
// prompts.js — featured: { id, title, icon, description, text }
//   translatable: title, description, text
//   structural:   id, icon
//
// promptLibrary.js — templates: { id, category, level, title, icon, description, text }
//   translatable: title, description, text
//   structural:   id, category, level, icon
//
// PROMPT_CATEGORIES.{key}: { label, icon, description } — labels+description translatable
// PROMPT_LEVELS.{key}: { label, color } — labels translatable, colors structural

import { readyPrompts } from '../src/data/prompts.js';
import { promptLibrary, PROMPT_CATEGORIES, PROMPT_LEVELS } from '../src/data/promptLibrary.js';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_PROMPTS = resolve(__dirname, '../src/locales/ru/prompts.json');
const OUT_LIBRARY = resolve(__dirname, '../src/locales/ru/prompt-library.json');

// === Featured prompts ===
const featured = {};
for (const p of readyPrompts) {
  featured[p.id] = {
    title: p.title,
    description: p.description,
    text: p.text
  };
}
writeFileSync(OUT_PROMPTS, JSON.stringify(featured, null, 2) + '\n', 'utf8');
console.log(`✓ ${Object.keys(featured).length} featured prompts → ${OUT_PROMPTS}`);

// === Library templates + categories + levels ===
const templates = {};
for (const p of promptLibrary) {
  templates[p.id] = {
    title: p.title,
    description: p.description,
    text: p.text
  };
}
const categories = {};
for (const [key, cat] of Object.entries(PROMPT_CATEGORIES)) {
  categories[key] = { label: cat.label, description: cat.description };
}
const levels = {};
for (const [key, lvl] of Object.entries(PROMPT_LEVELS)) {
  levels[key] = { label: lvl.label };
}
const library = { categories, levels, templates };
writeFileSync(OUT_LIBRARY, JSON.stringify(library, null, 2) + '\n', 'utf8');
console.log(`✓ ${Object.keys(templates).length} library templates + ${Object.keys(categories).length} categories + ${Object.keys(levels).length} levels → ${OUT_LIBRARY}`);
