#!/usr/bin/env node
/**
 * build-tutorial-index.mjs
 *
 * Собирает лёгкий индекс туториалов: src/locales/<loc>/tutorials/titles.json.
 *
 * Зачем: полные тексты туториалов (~4 MB на язык, ~780 KB gzip) грузились при
 * входе на сайт, хотя списку курсов и поиску нужны только заголовок, подзаголовок
 * и длительность. Индекс весит доли процента от этого; тело туториала грузится
 * в момент открытия (по audience-чанку из src/data/tutorials.js).
 *
 * Запускается автоматически перед сборкой (npm `prebuild`) и внутри `npm run sync`,
 * поэтому индекс не может разойтись с текстами.
 *
 * Usage:
 *   node scripts/build-tutorial-index.mjs
 *   node scripts/build-tutorial-index.mjs --check   # только проверить свежесть
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const LOCALES = ['ru', 'en', 'fi'];
const AUDIENCES = ['everyone', 'developers', 'business'];
const INDEX_FIELDS = ['title', 'subtitle', 'totalTime'];

const CHECK = process.argv.includes('--check');

let stale = 0;

for (const loc of LOCALES) {
  const dir = join(ROOT, 'src', 'locales', loc, 'tutorials');
  const index = {};

  for (const audience of AUDIENCES) {
    const file = join(dir, `${audience}.json`);
    if (!existsSync(file)) {
      console.error(`[tutorial-index] нет файла: ${file}`);
      process.exit(1);
    }
    const data = JSON.parse(readFileSync(file, 'utf8'));
    for (const [id, tut] of Object.entries(data)) {
      const entry = {};
      for (const f of INDEX_FIELDS) if (tut[f]) entry[f] = tut[f];
      index[id] = entry;
    }
  }

  const out = join(dir, 'titles.json');
  const next = JSON.stringify(index, null, 2) + '\n';
  const prev = existsSync(out) ? readFileSync(out, 'utf8') : '';

  if (prev === next) {
    console.log(`[tutorial-index] ${loc}: без изменений (${Object.keys(index).length} туториалов)`);
    continue;
  }
  stale++;
  if (CHECK) {
    console.error(`[tutorial-index] ${loc}: индекс устарел — прогони node scripts/build-tutorial-index.mjs`);
    continue;
  }
  writeFileSync(out, next);
  const kb = (Buffer.byteLength(next) / 1024).toFixed(1);
  console.log(`[tutorial-index] ${loc}: записан (${Object.keys(index).length} туториалов, ${kb} KB)`);
}

if (CHECK && stale) process.exit(1);
