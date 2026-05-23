#!/usr/bin/env node
// scripts/sync-related-from-links.mjs
//
// Строит граф связей из inline-ссылок [[node:X]] в локалях и сравнивает
// с relatedIds в src/data/mindmapData.js. Печатает рекомендации.
//
// Mode:
//   default — отчёт «какие relatedIds стоит добавить» (по узлам)
//   --apply — автоматически дописать relatedIds в mindmapData.js
//             (только ДОБАВЛЯЕТ, никогда не удаляет)

import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();
const LOCALES = ['ru', 'en', 'fi'];
const LINK_RE = /\[\[node:([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g;
const FIELDS = ['what', 'why', 'when', 'impact', 'example', 'mistakes'];

// 1. Собираем все inline-связи: from → set(to)
const linkGraph = new Map(); // nodeId → Set<targetId>

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
        const target = m[1];
        if (target === nodeId) continue; // self
        if (!linkGraph.has(nodeId)) linkGraph.set(nodeId, new Set());
        linkGraph.get(nodeId).add(target);
      }
    }
  }
}

// 2. Читаем mindmapData.js как текст и парсим relatedIds руками (без eval)
const mdFp = path.join(ROOT, 'src', 'data', 'mindmapData.js');
const mdSrc = fs.readFileSync(mdFp, 'utf-8');

// 2a. Собираем все валидные id узлов в дереве. Это нужно чтобы НЕ добавлять
// dangling refs (relatedIds → узел которого нет в mindmapData) — иначе
// CI lint:data падает с «dangling reference» errors. Inline-ссылки в
// текстах могут указывать на «битые» узлы (есть только в locales) —
// их relatedIds должны игнорировать.
const validNodeIds = new Set(
  [...mdSrc.matchAll(/"id":\s*"([a-z0-9-]+)"/g)].map(m => m[1])
);

// Парсим существующие relatedIds: для каждого id: 'X' блока находим relatedIds
// мини-парсер: ищем "id: 'X'" → внутри объекта ищем "relatedIds: [...]"
function parseExistingRelated(src) {
  const result = new Map(); // nodeId → Set<related>
  // Простой шаблон: id: 'X' ... relatedIds: [...] (в той же объектной области)
  // Используем глобальный regex по 'id: \'X\'' и ищем relatedIds в следующих ~3000 char до следующего "id:"
  const idRe = /id:\s*['"]([a-z0-9-]+)['"]/g;
  let m;
  const positions = [];
  while ((m = idRe.exec(src)) !== null) {
    positions.push({ id: m[1], at: m.index });
  }
  for (let i = 0; i < positions.length; i++) {
    const { id, at } = positions[i];
    const end = i + 1 < positions.length ? positions[i + 1].at : src.length;
    const block = src.slice(at, end);
    const rm = block.match(/relatedIds:\s*\[([^\]]*)\]/);
    if (rm) {
      const ids = Array.from(rm[1].matchAll(/['"]([a-z0-9-]+)['"]/g)).map(x => x[1]);
      if (!result.has(id)) result.set(id, new Set());
      ids.forEach(x => result.get(id).add(x));
    }
  }
  return result;
}

const existing = parseExistingRelated(mdSrc);

// 3. Считаем что нужно добавить (с защитой от dangling refs)
const suggestions = new Map(); // nodeId → Array<missingTarget>
const skippedDangling = []; // for reporting
for (const [from, targets] of linkGraph.entries()) {
  // Защита: from-узел тоже должен существовать в дереве (иначе нет
  // куда добавлять relatedIds — узел не существует как DOM-сущность).
  if (!validNodeIds.has(from)) continue;
  const have = existing.get(from) || new Set();
  const missing = [];
  for (const t of targets) {
    if (have.has(t)) continue;
    // КРИТИЧНО: target должен существовать в mindmapData.js, иначе будет
    // dangling reference → CI lint:data error.
    if (!validNodeIds.has(t)) {
      skippedDangling.push(`${from} → ${t}`);
      continue;
    }
    missing.push(t);
  }
  if (missing.length) suggestions.set(from, missing);
}
if (skippedDangling.length && !APPLY) {
  console.log(`— Skipped ${skippedDangling.length} dangling target(s) —`);
  for (const d of skippedDangling.slice(0, 10)) console.log(`  ${d}`);
  if (skippedDangling.length > 10) console.log(`  ... и ещё ${skippedDangling.length - 10}`);
}

// Двусторонняя связь: ещё добавляем обратные (из mindmapData.js buildRelatedIndex
// и так делает обратное связывание, но визуально полезно записать обе стороны)

if (!APPLY) {
  console.log('— Suggested additions to relatedIds (in mindmapData.js) —\n');
  if (!suggestions.size) {
    console.log('Все inline-ссылки уже отражены в relatedIds. ✓');
    process.exit(0);
  }
  const sorted = Array.from(suggestions.entries()).sort((a, b) => b[1].length - a[1].length);
  for (const [nodeId, missing] of sorted) {
    console.log(`  ${nodeId}:  +[${missing.map(m => `'${m}'`).join(', ')}]`);
  }
  console.log(`\nTotal: ${suggestions.size} nodes need additions, ${[...suggestions.values()].reduce((s, a) => s + a.length, 0)} new relations`);
  console.log('Запусти с --apply чтобы применить.');
  process.exit(0);
}

// APPLY mode: дописываем relatedIds в файл
// Стратегия: только МОДИФИЦИРУЕМ существующие relatedIds. Если у узла нет
// relatedIds — выводим предложение в stderr (вставлять «в воздух» опасно,
// потому что в файле бывает несколько `"id": "X"` упоминаний).

// Сначала строим карту: nodeId → позиция блока с relatedIds (если есть)
function findRelatedBlocks(src) {
  // Все позиции `"id": "X"`
  const idRe = /"id":\s*"([a-z0-9-]+)"/g;
  const positions = [];
  let m;
  while ((m = idRe.exec(src)) !== null) {
    positions.push({ id: m[1], at: m.index });
  }
  // Для каждой позиции смотрим, есть ли relatedIds в её скоупе
  // (до следующего "id":, но не дальше ~2500 символов).
  const map = new Map(); // nodeId → { idAt, relStart, relEnd, existing[] }
  for (let i = 0; i < positions.length; i++) {
    const { id, at } = positions[i];
    const scopeEnd = i + 1 < positions.length
      ? Math.min(positions[i + 1].at, at + 3000)
      : at + 3000;
    const block = src.slice(at, scopeEnd);
    const rm = block.match(/"relatedIds":\s*\[([\s\S]*?)\]/);
    if (rm) {
      const existing = Array.from(rm[1].matchAll(/"([a-z0-9-]+)"/g)).map(x => x[1]);
      // Если у узла несколько вхождений с relatedIds — берём первое непустое
      if (!map.has(id)) {
        map.set(id, {
          idAt: at,
          relStart: at + rm.index,
          relEnd: at + rm.index + rm[0].length,
          existing
        });
      }
    }
  }
  return map;
}

const relBlocks = findRelatedBlocks(mdSrc);

// Сортируем suggestions по убыванию позиции в файле — модифицируем с конца,
// чтобы позиции не сбивались.
const sortedSugs = Array.from(suggestions.entries())
  .filter(([id]) => relBlocks.has(id))
  .map(([id, missing]) => ({ id, missing, block: relBlocks.get(id) }))
  .sort((a, b) => b.block.relStart - a.block.relStart);

let newSrc = mdSrc;
let appliedCount = 0;
let modifiedNodes = 0;
const noRelatedBlock = [];

for (const [nodeId, missing] of suggestions.entries()) {
  if (!relBlocks.has(nodeId)) {
    noRelatedBlock.push({ nodeId, missing });
  }
}

for (const { id, missing, block } of sortedSugs) {
  const existing = block.existing;
  const newIds = [...existing];
  let added = 0;
  for (const m of missing) {
    if (!newIds.includes(m)) {
      newIds.push(m);
      added++;
    }
  }
  if (!added) continue;
  // Форматируем как многострочный массив, чтобы соответствовать стилю файла
  const indent = '            '; // 12 пробелов — стиль вложенного в дерево
  const formatted = `"relatedIds": [\n${newIds.map(x => `${indent}"${x}"`).join(',\n')}\n${indent.slice(0, -2)}]`;
  newSrc = newSrc.slice(0, block.relStart) + formatted + newSrc.slice(block.relEnd);
  appliedCount += added;
  modifiedNodes++;
}

fs.writeFileSync(mdFp, newSrc, 'utf-8');
console.log(`✅ Applied: ${appliedCount} new relations across ${modifiedNodes} nodes`);

if (noRelatedBlock.length) {
  console.log(`\n— ${noRelatedBlock.length} узлов без существующего relatedIds-блока (добавь вручную) —`);
  for (const { nodeId, missing } of noRelatedBlock.slice(0, 30)) {
    console.log(`  ${nodeId}: ${missing.map(m => `'${m}'`).join(', ')}`);
  }
  if (noRelatedBlock.length > 30) console.log(`  ... и ещё ${noRelatedBlock.length - 30}`);
}

fs.writeFileSync(mdFp, newSrc, 'utf-8');
console.log(`✅ Applied: ${appliedCount} new relations to mindmapData.js`);
console.log('Запусти npm run build чтобы проверить.');
