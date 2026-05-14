// Regenerates src/data/tutorials.js with structural-only tutorials.
// Each tutorial keeps: nodeId, icon, level, prerequisites, relatedPrompts, next, steps:[{id}].
// All text moves to src/locales/<lang>/tutorials.json.

import { tutorials } from '../src/data/tutorials.js';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FILE = resolve(__dirname, '../src/data/tutorials.js');

const KEEP_TOP = ['nodeId', 'icon', 'level', 'prerequisites', 'relatedPrompts', 'next'];

function pickStructure(tut) {
  const out = {};
  for (const k of KEEP_TOP) {
    if (tut[k] === undefined) continue;
    out[k] = tut[k];
  }
  out.steps = (tut.steps || []).map(s => ({ id: s.id }));
  return out;
}

const structure = {};
for (const [id, tut] of Object.entries(tutorials)) {
  structure[id] = pickStructure(tut);
}

const header = `// Структура tutorials: nodeId, icon, level, prerequisites, relatedPrompts, next, steps:[{id}].
// Текстовый контент (title, subtitle, whatItIs, approach, outcomes, applyIn,
// pitfalls, exercises, totalTime, steps[].*) — в src/locales/<lang>/tutorials.json.
// Резолвинг через useTutorialContent() из src/i18n/.

export const tutorials = ${JSON.stringify(structure, null, 2)};

// Список ID всех туториалов для подсчёта прогресса.
export const tutorialIds = Object.keys(tutorials);
`;

writeFileSync(FILE, header, 'utf8');
console.log(`✓ Regenerated ${FILE} (structure-only, ${Object.keys(structure).length} tutorials)`);
