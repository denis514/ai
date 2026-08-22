// search-eval.mjs — прогон золотого набора запросов через РЕАЛЬНЫЙ движок
// (импорт из src/services/searchEngine.js — без дублирования логики).
// Использование: node scripts/search-eval.mjs [--baseline]
//   --baseline: старый механизм (подстрока), для сравнения.
// Метрика: доля запросов, где хоть один ожидаемый id попал в топ-3.

import { readFileSync } from 'node:fs';
import { getIndex, smartSearch } from '../src/services/searchEngine.js';

const golden = JSON.parse(readFileSync('tests/search-golden.json', 'utf8'));
const baseline = process.argv.includes('--baseline');

const nodesByLocale = {};
for (const loc of ['ru', 'en', 'fi']) {
  nodesByLocale[loc] = JSON.parse(readFileSync(`src/locales/${loc}/nodes.json`, 'utf8'));
}

function docsFor(loc) {
  return Object.entries(nodesByLocale[loc]).map(([id, c]) => ({
    id,
    type: 'node',
    title: c.title || '',
    subtitle: c.what || '',
    body: `${c.why || ''} ${c.when || ''} ${c.impact || ''} ${c.example || ''} ${c.mistakes || ''}`,
  }));
}

function smartTop(loc, q, n = 3) {
  const mini = getIndex('eval', loc, 0, () => docsFor(loc));
  return smartSearch(mini, q, loc, { limit: n }).map(r => r.id);
}

function baselineTop(loc, q, n = 3) {
  const bag = nodesByLocale[loc];
  const query = q.trim().toLowerCase();
  const out = [];
  for (const [id, c] of Object.entries(bag)) {
    const text = `${c.title} ${c.what} ${c.why} ${c.when} ${c.impact} ${c.example} ${c.mistakes}`.toLowerCase();
    if (text.includes(query)) out.push(id);
    if (out.length >= n) break;
  }
  return out;
}

let hits = 0;
const misses = [];
for (const c of golden.cases) {
  const top = baseline ? baselineTop(c.locale, c.q) : smartTop(c.locale, c.q);
  const ok = c.expect.some(e => top.includes(e));
  if (ok) hits++;
  else misses.push({ ...c, got: top });
}

const total = golden.cases.length;
console.log(`${baseline ? 'BASELINE (подстрока)' : 'SMART (движок из src/)'}: ${hits}/${total} = ${Math.round(hits / total * 100)}% запросов с релевантным в топ-3`);
if (misses.length) {
  console.log('\nПромахи:');
  for (const m of misses) console.log(`  [${m.locale}] «${m.q}» → ждали ${m.expect.join('|')}, топ-3: ${m.got.join(', ') || '(пусто)'}`);
}
