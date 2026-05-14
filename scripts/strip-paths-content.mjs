// Regenerates src/data/learningPaths.js with structural-only paths.
// Translatable content lives in locales/<lang>/paths.json.

import { learningPaths } from '../src/data/learningPaths.js';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FILE = resolve(__dirname, '../src/data/learningPaths.js');

const structure = learningPaths.map(p => ({
  id: p.id,
  icon: p.icon,
  level: p.level,
  steps: (p.steps || []).map(s => ({ type: s.type, id: s.id }))
}));

const src = `// Learning Paths — структура. Текстовый контент (title, description,
// duration, steps[].why) — в src/locales/<lang>/paths.json. Резолвинг
// через getLocalizedPath() из src/i18n/usePath.js.

export const learningPaths = ${JSON.stringify(structure, null, 2)};

/** Индекс по id */
export const pathIndex = Object.fromEntries(learningPaths.map(p => [p.id, p]));
`;
writeFileSync(FILE, src, 'utf8');
console.log(`✓ Regenerated ${FILE} (${structure.length} paths, structure-only)`);
