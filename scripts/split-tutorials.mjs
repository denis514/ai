#!/usr/bin/env node
/**
 * Splits src/locales/<locale>/tutorials.json по audience:
 *   tutorials/everyone.json   — 17 общих туториалов
 *   tutorials/developers.json — 14 dev-focused
 *   tutorials/business.json   — 4 business-focused
 *
 * Audience читается из src/data/tutorials.js (структурный source).
 * Re-run после добавления новых туториалов.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOCALES = ['ru', 'en', 'fi'];

// Tutorials.js — JS module, парсим runtime через dynamic import.
const tutorialsMod = await import(resolve(ROOT, 'src/data/tutorials.js'));
const structural = tutorialsMod.tutorials;

function getSection(id) {
  const audience = structural[id]?.audience;
  if (audience === 'developers') return 'developers';
  if (audience === 'business') return 'business';
  return 'everyone'; // default + explicit 'everyone'
}

const stats = {};

for (const locale of LOCALES) {
  const src = resolve(ROOT, `src/locales/${locale}/tutorials.json`);
  const all = JSON.parse(readFileSync(src, 'utf8'));

  const sections = { everyone: {}, developers: {}, business: {} };
  for (const [id, content] of Object.entries(all)) {
    const section = getSection(id);
    sections[section][id] = content;
  }

  const outDir = resolve(ROOT, `src/locales/${locale}/tutorials`);
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

  // Sanity
  const totalSplit = Object.values(sections).reduce((s, x) => s + Object.keys(x).length, 0);
  if (totalSplit !== Object.keys(all).length) {
    console.error(`✗ ${locale}: count mismatch: src=${Object.keys(all).length} split=${totalSplit}`);
    process.exit(1);
  }

  stats[locale] = localeStats;
  console.log(`✓ ${locale}: ${Object.keys(all).length} tutorials → everyone/${localeStats.everyone.count} + developers/${localeStats.developers.count} + business/${localeStats.business.count}`);
}

console.log('\nSection sizes (raw JSON):');
console.log('Locale  | everyone     | developers   | business     ');
console.log('--------|--------------|--------------|--------------');
for (const [loc, s] of Object.entries(stats)) {
  console.log(`${loc.padEnd(7)} | ${s.everyone.count}/${s.everyone.sizeKB}KB`.padEnd(7+15) +
              ` | ${s.developers.count}/${s.developers.sizeKB}KB`.padEnd(15) +
              ` | ${s.business.count}/${s.business.sizeKB}KB`);
}
