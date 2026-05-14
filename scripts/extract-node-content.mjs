// Extracts textual content (title + details) from src/data/mindmapData.js
// into src/locales/ru/nodes.json. Run once for Phase 3 migration.
//
// Usage: node scripts/extract-node-content.mjs
//
// Idempotent: re-running produces identical output.

import { mindmapData } from '../src/data/mindmapData.js';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUT_RU = resolve(__dirname, '../src/locales/ru/nodes.json');

function walk(node, acc) {
  const d = node.details || {};
  acc[node.id] = {
    title: node.title,
    what: d.what || '',
    why: d.why || '',
    when: d.when || '',
    impact: d.impact || '',
    example: d.example || '',
    mistakes: d.mistakes || ''
  };
  if (node.children) for (const c of node.children) walk(c, acc);
  return acc;
}

const out = walk(mindmapData, {});
const ids = Object.keys(out);

mkdirSync(dirname(OUT_RU), { recursive: true });
writeFileSync(OUT_RU, JSON.stringify(out, null, 2) + '\n', 'utf8');

console.log(`✓ Extracted ${ids.length} nodes → ${OUT_RU}`);
console.log(`  fields per node: title, what, why, when, impact, example, mistakes`);
