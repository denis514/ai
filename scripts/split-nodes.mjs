#!/usr/bin/env node
/**
 * Splits src/locales/<locale>/nodes.json into thematic section files:
 *   nodes/core.json     — foundation, basics, capabilities, fundamentals, MCP
 *   nodes/sys.json      — sys-* production patterns (largest)
 *   nodes/commerce.json — ec-*, uc-*, cs-*, mk-*, pd-* business use cases
 *
 * Re-run after content additions. Idempotent. Validates count matches input.
 *
 * Usage:  node scripts/split-nodes.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOCALES = ['ru', 'en', 'fi'];

/**
 * Classify a node id into a section.
 * Order matters: sys → commerce → core (catch-all).
 */
function getSection(id) {
  if (id.startsWith('sys-')) return 'sys';
  if (id.startsWith('ec-') || id.startsWith('uc-') || id.startsWith('cs-')
      || id.startsWith('mk-') || id.startsWith('pd-')) return 'commerce';
  return 'core';
}

const stats = {};

for (const locale of LOCALES) {
  const src = resolve(ROOT, `src/locales/${locale}/nodes.json`);
  const all = JSON.parse(readFileSync(src, 'utf8'));

  const sections = { core: {}, sys: {}, commerce: {} };
  for (const [id, node] of Object.entries(all)) {
    const section = getSection(id);
    sections[section][id] = node;
  }

  const outDir = resolve(ROOT, `src/locales/${locale}/nodes`);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const localeStats = {};
  for (const [name, data] of Object.entries(sections)) {
    const file = resolve(outDir, `${name}.json`);
    const content = JSON.stringify(data, null, 2) + '\n';
    writeFileSync(file, content, 'utf8');
    localeStats[name] = {
      count: Object.keys(data).length,
      sizeKB: (content.length / 1024).toFixed(1),
    };
  }

  // Sanity check
  const totalSplit = Object.values(sections).reduce((s, x) => s + Object.keys(x).length, 0);
  const totalSrc = Object.keys(all).length;
  if (totalSplit !== totalSrc) {
    console.error(`✗ ${locale}: count mismatch: src=${totalSrc} split=${totalSplit}`);
    process.exit(1);
  }

  stats[locale] = { total: totalSrc, sections: localeStats };
  console.log(`✓ ${locale}: ${totalSrc} nodes → core/${localeStats.core.count} + sys/${localeStats.sys.count} + commerce/${localeStats.commerce.count}`);
}

console.log('\nSection sizes (raw JSON):');
console.log('Locale  | core         | sys          | commerce     | total');
console.log('--------|--------------|--------------|--------------|------');
for (const [loc, s] of Object.entries(stats)) {
  const total = (parseFloat(s.sections.core.sizeKB) + parseFloat(s.sections.sys.sizeKB) + parseFloat(s.sections.commerce.sizeKB)).toFixed(1);
  console.log(`${loc.padEnd(7)} | ${s.sections.core.count}/${s.sections.core.sizeKB}KB`.padEnd(7+15) +
              ` | ${s.sections.sys.count}/${s.sections.sys.sizeKB}KB`.padEnd(15) +
              ` | ${s.sections.commerce.count}/${s.sections.commerce.sizeKB}KB`.padEnd(15) +
              ` | ${total}KB`);
}
console.log('\nNext: update src/i18n/content-<locale>.js to import from nodes/*.json');
