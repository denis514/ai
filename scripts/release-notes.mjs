#!/usr/bin/env node
/**
 * release-notes-generator companion script.
 *
 * Parses git log + diff stats + whatsNew.js → draft markdown digest.
 * Output requires light human/Claude polish on TL;DR and Highlights.
 *
 * Usage:
 *   node scripts/release-notes.mjs                          # previous calendar month
 *   node scripts/release-notes.mjs --month 2026-05
 *   node scripts/release-notes.mjs --from 2026-05-01 --to 2026-05-15
 *
 * Skill: skills/release-notes-generator/SKILL.md
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function arg(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
}

let from, to, label;
const monthArg = arg('month');
if (monthArg) {
  const [y, m] = monthArg.split('-').map(Number);
  from = `${y}-${String(m).padStart(2, '0')}-01`;
  to   = new Date(y, m, 0).toISOString().slice(0, 10);
  label = monthArg;
} else if (arg('from') && arg('to')) {
  from = arg('from');
  to   = arg('to');
  label = `${from}_to_${to}`;
} else {
  // Default: previous calendar month
  const now = new Date();
  const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const m = now.getMonth() === 0 ? 12 : now.getMonth();
  from = `${y}-${String(m).padStart(2, '0')}-01`;
  to   = new Date(y, m, 0).toISOString().slice(0, 10);
  label = `${y}-${String(m).padStart(2, '0')}`;
}

console.log(`→ Release notes for ${from} … ${to}`);

// ─── Git log ─────────────────────────────────────────────────────────────────
const log = execSync(
  `git log --since="${from}" --until="${to} 23:59:59" --pretty=format:"%h|%ad|%s" --date=short`,
  { cwd: ROOT, encoding: 'utf8' }
).trim();

if (!log) {
  console.error(`✗ No commits in range ${from} … ${to}`);
  process.exit(0);
}

const commits = log.split('\n').map(line => {
  const [hash, date, ...rest] = line.split('|');
  return { hash, date, subject: rest.join('|') };
});

// ─── Categorize by prefix ────────────────────────────────────────────────────
const PREFIXES = {
  'feat':    'feature',
  'fix':     'fix',
  'content': 'content',
  'infra':   'infra',
  'polish':  'polish',
  'docs':    'docs',
  'chore':   'chore',
  'pivot':   'pivot',
  'refactor': 'refactor',
  'perf':    'perf',
  'test':    'test',
  'breaking': 'breaking',
};
function categorize(subject) {
  // Check for "BREAKING" anywhere
  if (/BREAKING|breaking change/i.test(subject)) return 'breaking';
  const prefixMatch = subject.match(/^(\w+)(\([^)]+\))?:/);
  if (prefixMatch) {
    const pref = prefixMatch[1].toLowerCase();
    return PREFIXES[pref] || 'other';
  }
  return 'other';
}
commits.forEach(c => c.category = categorize(c.subject));

const byCategory = {};
commits.forEach(c => {
  (byCategory[c.category] ??= []).push(c);
});

// ─── Diff stats ──────────────────────────────────────────────────────────────
const firstHash = commits[commits.length - 1].hash;
const lastHash  = commits[0].hash;
let diffSummary = '';
try {
  diffSummary = execSync(
    `git diff --shortstat ${firstHash}~1..${lastHash}`,
    { cwd: ROOT, encoding: 'utf8' }
  ).trim();
} catch {
  diffSummary = '(diff stats unavailable)';
}

// ─── whatsNew.js content additions ───────────────────────────────────────────
let whatsNewByDate = {};
try {
  const whatsNewPath = resolve(ROOT, 'src/data/whatsNew.js');
  const txt = readFileSync(whatsNewPath, 'utf8');
  // Match { id: '...', type: 'new'|'updated', date: 'YYYY-MM-DD' }
  const re = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*type:\s*['"](new|updated)['"]\s*,\s*date:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    const [, id, type, date] = m;
    if (date >= from && date <= to) {
      (whatsNewByDate[type] ??= []).push({ id, date });
    }
  }
} catch (e) {
  console.warn('whatsNew.js read failed:', e.message);
}

// ─── Build markdown ──────────────────────────────────────────────────────────
const labelHuman = label.replace('_to_', ' → ');
const lines = [];
lines.push(`# Release Notes — ${labelHuman}`);
lines.push('');
lines.push('> 🚧 **Draft** — TL;DR и Highlights требуют human/Claude polish.');
lines.push('');
lines.push('## TL;DR');
lines.push('');
lines.push('_(2-3 предложения о главных изменениях периода — заполни вручную)_');
lines.push('');

// By the numbers
lines.push('## By the numbers');
lines.push('');
lines.push(`- Commits: **${commits.length}**`);
lines.push(`- Period: \`${from}\` → \`${to}\``);
lines.push(`- ${diffSummary || '(diff unavailable)'}`);
const newContent = whatsNewByDate.new?.length || 0;
const updContent = whatsNewByDate.updated?.length || 0;
if (newContent || updContent) {
  lines.push(`- Content: **${newContent} new**, **${updContent} updated** entries`);
}
lines.push('- Locales: 3 (RU/EN/FI) kept in sync');
lines.push('');

// Highlights placeholder
lines.push('## Highlights');
lines.push('');
lines.push('1. _(top change — fill in)_');
lines.push('2. _(second — fill in)_');
lines.push('3. _(third — fill in)_');
lines.push('');

// Per-category sections
const CATEGORY_HEADINGS = {
  content:  '## Content',
  feature:  '## Product / Features',
  fix:      '## Bug fixes',
  infra:    '## Infra / Tech debt',
  polish:   '## Polish & language',
  docs:     '## Documentation',
  chore:    '## Refactoring & chores',
  pivot:    '## Strategy shifts',
  perf:     '## Performance',
  refactor: '## Refactoring',
  test:     '## Tests',
  other:    '## Other',
  breaking: '## 🚨 Breaking changes',
};

const ORDER = ['breaking', 'pivot', 'content', 'feature', 'fix', 'infra', 'perf', 'polish', 'docs', 'refactor', 'chore', 'test', 'other'];

for (const cat of ORDER) {
  if (!byCategory[cat]) continue;
  lines.push(CATEGORY_HEADINGS[cat] || `## ${cat}`);
  lines.push('');
  byCategory[cat].forEach(c => {
    // Strip "category:" prefix from subject for cleaner display
    const cleanSubject = c.subject.replace(/^[\w]+(\([^)]+\))?:\s*/, '');
    lines.push(`- ${cleanSubject} (\`${c.hash}\`, ${c.date})`);
  });
  lines.push('');
}

// whatsNew detail
if (whatsNewByDate.new?.length || whatsNewByDate.updated?.length) {
  lines.push('## Content changelog (auto-detected)');
  lines.push('');
  if (whatsNewByDate.new?.length) {
    lines.push('**New entries:**');
    whatsNewByDate.new.forEach(({ id, date }) => lines.push(`- \`${id}\` — ${date}`));
    lines.push('');
  }
  if (whatsNewByDate.updated?.length) {
    lines.push('**Updated entries:**');
    whatsNewByDate.updated.forEach(({ id, date }) => lines.push(`- \`${id}\` — ${date}`));
    lines.push('');
  }
}

// References
lines.push('## References');
lines.push('');
lines.push(`- Commits range: \`${firstHash}\`..\`${lastHash}\``);
lines.push(`- View: \`git log --oneline ${firstHash}~1..${lastHash}\``);
lines.push('- Skill: `skills/release-notes-generator/SKILL.md`');
lines.push('');
lines.push('## What\'s next');
lines.push('');
lines.push('_(See `tasks/current.md` — 2-3 направления для preview)_');
lines.push('');

// ─── Write output ────────────────────────────────────────────────────────────
const outDir = resolve(ROOT, 'docs/releases');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, `${label}.md`);

writeFileSync(outPath, lines.join('\n'), 'utf8');

console.log(`\n✓ Draft written: docs/releases/${label}.md`);
console.log(`  ${commits.length} commits across ${Object.keys(byCategory).length} categories.`);
console.log(`  Edit TL;DR + Highlights manually before publishing.`);
