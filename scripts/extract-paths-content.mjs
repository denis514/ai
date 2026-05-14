// Extracts textual content from src/data/learningPaths.js into
// src/locales/ru/paths.json. Phase 3d.
//
// translatable: title, description, duration, steps[].why
// structural:   id, icon, level, steps[].{type, id}

import { learningPaths } from '../src/data/learningPaths.js';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT = resolve(__dirname, '../src/locales/ru/paths.json');

const out = {};
for (const p of learningPaths) {
  out[p.id] = {
    title: p.title,
    description: p.description,
    duration: p.duration,
    // ключ шага = "<type>:<id>" — стабильный композитный идентификатор.
    steps: Object.fromEntries(
      (p.steps || []).map(s => [`${s.type}:${s.id}`, { why: s.why || '' }])
    )
  };
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`✓ Extracted ${Object.keys(out).length} learning paths → ${OUT}`);
