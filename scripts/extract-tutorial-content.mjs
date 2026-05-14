// Extracts textual content from src/data/tutorials.js into
// src/locales/ru/tutorials.json. Phase 3b migration.
//
// Структура tutorial:
//   - top-level translatable: title, subtitle, totalTime, whatItIs, approach,
//     outcomes[], applyIn[].{title,description}, pitfalls[], exercises[].{question,hint}
//   - structural (НЕ переводится): nodeId, icon, level, prerequisites, relatedPrompts, next
//   - steps[].translatable: title, time, why, instructions[], prompt, example,
//                            validate, tip, troubleshoot{symptom: fix}
//   - steps[].structural: id

import { tutorials } from '../src/data/tutorials.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT = resolve(__dirname, '../src/locales/ru/tutorials.json');

const out = {};
for (const [id, tut] of Object.entries(tutorials)) {
  const t = {
    title: tut.title,
    subtitle: tut.subtitle,
    totalTime: tut.totalTime,
    whatItIs: tut.whatItIs,
    approach: tut.approach,
    outcomes: Array.isArray(tut.outcomes) ? tut.outcomes : [],
    applyIn: Array.isArray(tut.applyIn)
      ? tut.applyIn.map(a => ({ title: a.title, description: a.description }))
      : [],
    pitfalls: Array.isArray(tut.pitfalls) ? tut.pitfalls : [],
    exercises: Array.isArray(tut.exercises)
      ? tut.exercises.map(e => ({ question: e.question, hint: e.hint || '' }))
      : [],
    steps: {}
  };
  for (const step of tut.steps || []) {
    t.steps[step.id] = {
      title: step.title || '',
      time: step.time || '',
      why: step.why || '',
      instructions: Array.isArray(step.instructions) ? step.instructions : [],
      ...(step.prompt ? { prompt: step.prompt } : {}),
      ...(step.example ? { example: step.example } : {}),
      ...(step.validate ? { validate: step.validate } : {}),
      ...(step.tip ? { tip: step.tip } : {}),
      ...(step.troubleshoot ? { troubleshoot: step.troubleshoot } : {})
    };
  }
  out[id] = t;
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`✓ Extracted ${Object.keys(out).length} tutorials → ${OUT}`);
