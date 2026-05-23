#!/usr/bin/env node
// Вставляет relatedIds в узлы mindmapData.js где их нет.
// Использует ПОСЛЕДНЕЕ вхождение `"id": "X"` (т.е. в дереве) и
// добавляет блок relatedIds сразу после category-строки.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LOCALES = ['ru', 'en', 'fi'];
const LINK_RE = /\[\[node:([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g;
const FIELDS = ['what', 'why', 'when', 'impact', 'example', 'mistakes'];

const linkGraph = new Map();
for (const locale of LOCALES) {
  const fp = path.join(ROOT, 'src', 'locales', locale, 'nodes.json');
  if (!fs.existsSync(fp)) continue;
  const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  for (const [nodeId, node] of Object.entries(data)) {
    for (const field of FIELDS) {
      const text = node[field];
      if (!text) continue;
      LINK_RE.lastIndex = 0;
      let m;
      while ((m = LINK_RE.exec(text)) !== null) {
        const t = m[1];
        if (t === nodeId) continue;
        if (!linkGraph.has(nodeId)) linkGraph.set(nodeId, new Set());
        linkGraph.get(nodeId).add(t);
      }
    }
  }
}

const mdFp = path.join(ROOT, 'src', 'data', 'mindmapData.js');
let src = fs.readFileSync(mdFp, 'utf-8');

// Валидные узлы в дереве — для защиты от dangling refs
const validNodeIds = new Set(
  [...src.matchAll(/"id":\s*"([a-z0-9-]+)"/g)].map(m => m[1])
);

// Найдём ВСЕ `"id": "X"` позиции
function allIdPositions(s) {
  const re = /"id":\s*"([a-z0-9-]+)"/g;
  const positions = [];
  let m;
  while ((m = re.exec(s)) !== null) positions.push({ id: m[1], at: m.index });
  return positions;
}

// Проверка: уже есть relatedIds в блоке этого id (до следующего "id":)?
function blockHasRelated(s, pos, nextPos) {
  const scope = s.slice(pos, nextPos || pos + 3000);
  return /"relatedIds":\s*\[/.test(scope);
}

// Сортируем по убыванию позиции, чтобы при модификациях не сбивать offsets
const insertions = []; // { pos, str }
const allPositions = allIdPositions(src);

for (const [nodeId, rawTargets] of linkGraph.entries()) {
  // Фильтруем targets: оставляем только узлы которые реально есть в дереве.
  // Иначе мы создадим dangling reference → CI lint:data error.
  const targets = new Set([...rawTargets].filter(t => validNodeIds.has(t)));
  if (!targets.size) continue;
  // Берём ПОСЛЕДНЕЕ вхождение этого id (обычно это узел в дереве)
  const occurrences = allPositions
    .map((p, i) => ({ ...p, next: allPositions[i + 1]?.at }))
    .filter(p => p.id === nodeId);
  if (!occurrences.length) {
    console.warn(`  ⚠️  ${nodeId}: нет в mindmapData.js — пропускаю`);
    continue;
  }
  // Выбираем последнюю позицию, где блок не имеет relatedIds (мы его и добавим)
  let chosen = null;
  for (let i = occurrences.length - 1; i >= 0; i--) {
    const o = occurrences[i];
    if (!blockHasRelated(src, o.at, o.next)) {
      chosen = o;
      break;
    }
  }
  if (!chosen) continue; // у всех вхождений уже есть relatedIds

  // Найдём конец строки с "id" и потом конец последней «значимой» строки блока
  // (либо category, либо icon, либо children — после неё вставляем relatedIds)
  // Простой подход: вставить сразу после строки с "category": "..."
  const scope = src.slice(chosen.at, chosen.next || chosen.at + 3000);
  // Найдём строку category внутри scope (на том же уровне вложенности — пока эвристика)
  const catMatch = scope.match(/"category":\s*"[^"]+",?/);
  if (!catMatch) continue;
  const lineEnd = chosen.at + catMatch.index + catMatch[0].length;
  // Определим отступ по предыдущему \n
  const before = src.slice(0, lineEnd);
  const lastNl = before.lastIndexOf('\n');
  const indent = before.slice(lastNl + 1).match(/^\s*/)[0];

  const targetList = Array.from(targets).sort();
  // Если category не оканчивалось запятой — добавим запятую
  let prefix = '';
  if (!src.slice(lineEnd - 1, lineEnd).match(/,/)) prefix = ',';

  const block = `${prefix}\n${indent}"relatedIds": [\n${targetList.map(t => `${indent}  "${t}"`).join(',\n')}\n${indent}]`;
  insertions.push({ pos: lineEnd, str: block, nodeId, count: targetList.length });
}

// Применяем insertions с конца (чтобы offsets не сбивались)
insertions.sort((a, b) => b.pos - a.pos);
let totalAdded = 0;
for (const ins of insertions) {
  src = src.slice(0, ins.pos) + ins.str + src.slice(ins.pos);
  totalAdded += ins.count;
}

// Безопасный post-fix: после нового `]` перед следующим `"key":` должна быть
// запятая (иначе rollup parse error). Это вставляет недостающие запятые.
src = src.replace(/(\n\s+\])\n(\s+")/g, '$1,\n$2');

fs.writeFileSync(mdFp, src, 'utf-8');
console.log(`✅ Added relatedIds for ${insertions.length} nodes (${totalAdded} relations)`);
console.log('Запусти npm run build чтобы проверить.');
