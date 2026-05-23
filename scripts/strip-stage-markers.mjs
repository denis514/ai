#!/usr/bin/env node
// scripts/strip-stage-markers.mjs
//
// Удаляет «Stage X→Y» маркеры из контента узлов. Voice-guide §6 явно
// квалифицирует их как corporate slide-язык. Аудит 2026-05-23 выявил
// 33 узла × 3 локали = 99 вхождений во всех Tier-2 Transformation узлах.
//
// Запуск:
//   node scripts/strip-stage-markers.mjs --dry   # показать что будет удалено
//   node scripts/strip-stage-markers.mjs         # применить ко всем 3 локалям

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();
const LOCALES = ['ru', 'en', 'fi'];
const FIELDS = ['what', 'why', 'when', 'impact', 'example', 'mistakes'];

// Шаблоны для удаления:
// 1) «. Stage 1→2.» в конце предложения → «.»
// 2) «; Stage 2→3.» → «.»
// 3) « Stage 1→2.» в конце строки → «»
// 4) «Stage 1→2.\n» — отдельной строкой → удалить строку
const PATTERNS = [
  // Маркер на отдельной строке (после \n или в начале) — удалить со строкой
  { re: /\n\s*Stage\s*\d+\s*[→\-—]+\s*\d+\.?\s*(?=\n|$)/g, replace: '' },
  // Маркер в конце предложения после точки/пробела — оставить предыдущую точку
  { re: /([.!?])\s+Stage\s*\d+\s*[→\-—]+\s*\d+\.?(?=\s|$)/g, replace: '$1' },
  // Маркер в конце поля (без знака препинания перед) — просто удалить
  { re: /\s*Stage\s*\d+\s*[→\-—]+\s*\d+\.?\s*$/g, replace: '' },
  // Маркер после ; или , — заменить на .
  { re: /[;,]\s+Stage\s*\d+\s*[→\-—]+\s*\d+\.?(?=\s|$)/g, replace: '.' },
];

const summary = {};
for (const locale of LOCALES) {
  const fp = path.join(ROOT, 'src', 'locales', locale, 'nodes.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  let removedCount = 0;
  const affected = [];

  for (const [nid, node] of Object.entries(data)) {
    for (const fld of FIELDS) {
      const v = node[fld];
      if (!v) continue;
      let newV = v;
      for (const { re, replace } of PATTERNS) {
        newV = newV.replace(re, replace);
      }
      // Trim trailing whitespace в каждой строке + удалить пустые финальные строки
      newV = newV.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
      if (newV !== v) {
        const wasCount = (v.match(/Stage\s*\d+\s*[→\-—]+\s*\d+/g) || []).length;
        const stillCount = (newV.match(/Stage\s*\d+\s*[→\-—]+\s*\d+/g) || []).length;
        removedCount += (wasCount - stillCount);
        affected.push({ nid, fld, removed: wasCount - stillCount });
        if (!DRY) node[fld] = newV;
      }
    }
  }

  summary[locale] = { count: removedCount, affected };

  if (!DRY) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }
}

console.log(`\n— strip-stage-markers${DRY ? ' (DRY)' : ''} —`);
for (const [loc, s] of Object.entries(summary)) {
  console.log(`  ${loc}: удалено ${s.count} маркеров в ${s.affected.length} полях`);
}
const total = Object.values(summary).reduce((acc, s) => acc + s.count, 0);
console.log(`  ИТОГО: ${total} вхождений`);

// Список затронутых полей (top 15)
if (DRY) {
  console.log('\n— Затронутые узлы (RU sample) —');
  for (const a of summary.ru.affected.slice(0, 15)) {
    console.log(`  ${a.nid}.${a.fld}: -${a.removed}`);
  }
  if (summary.ru.affected.length > 15) {
    console.log(`  ... и ещё ${summary.ru.affected.length - 15}`);
  }
}
