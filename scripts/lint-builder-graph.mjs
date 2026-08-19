#!/usr/bin/env node
/**
 * lint-builder-graph.mjs — проверка консистентности реестра узлов Builder.
 *
 * Фаза 3 (governance). Гарантирует, что:
 *  1. Каждый NODE_DEFS имеет обязательные поля и валидный kind (есть в KIND_PORTS).
 *  2. i18n-ключи (labelKey/descKey) присутствуют во ВСЕХ локалях (ru/en/fi).
 *  3. TOOLBOX_GROUPS ссылаются только на существующие def; нет «сирот» (def вне групп).
 *  4. TEMPLATES используют валидные defId и только ДОПУСТИМЫЕ связи (по движку
 *     connectionRules: нет несовместимых пар, дубликатов, циклов в DATA-потоке).
 *
 * errors → exit 1 (блокирует). warnings → exit 0 (не блокирует).
 *
 * Запуск: node scripts/lint-builder-graph.mjs   (или npm run lint:builder)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const { NODE_DEFS, TOOLBOX_GROUPS } = await import(resolve(ROOT, 'src/builder/data/nodeTypes.js'));
const { KIND_PORTS } = await import(resolve(ROOT, 'src/builder/data/nodeCapabilities.js'));
const { evaluateConnection } = await import(resolve(ROOT, 'src/builder/services/connectionRules.js'));
const { TEMPLATES } = await import(resolve(ROOT, 'src/builder/data/templates.js'));
const { NODE_TEMPLATES } = await import(resolve(ROOT, 'src/data/nodeTemplates.js'));
const { mindmapData } = await import(resolve(ROOT, 'src/data/mindmapData.js'));

const LOCALES = ['ru', 'en', 'fi'];
const REQUIRED_FIELDS = ['kind', 'icon', 'color', 'labelKey', 'descKey'];

const errors = [];
const warnings = [];

// ── Загрузка локалей ──────────────────────────────────────────────────────────
const dicts = {};
for (const loc of LOCALES) {
  dicts[loc] = JSON.parse(readFileSync(resolve(ROOT, `src/locales/${loc}/ui.json`), 'utf8'));
}
const hasKey = (dict, dotted) => {
  let cur = dict;
  for (const part of dotted.split('.')) {
    if (cur && typeof cur === 'object' && part in cur) cur = cur[part];
    else return false;
  }
  return typeof cur === 'string' && cur.trim().length > 0;
};

// ── 1. NODE_DEFS ────────────────────────────────────────────────────────────
for (const [defId, def] of Object.entries(NODE_DEFS)) {
  for (const f of REQUIRED_FIELDS) {
    if (def[f] == null || def[f] === '') errors.push(`[def ${defId}] отсутствует поле "${f}"`);
  }
  if (def.kind && !KIND_PORTS[def.kind]) {
    errors.push(`[def ${defId}] kind "${def.kind}" не описан в KIND_PORTS (nodeCapabilities.js)`);
  }
  if (!def.atlasAnchor) warnings.push(`[def ${defId}] нет atlasAnchor (нет «Подробнее» в Atlas)`);
  for (const keyField of ['labelKey', 'descKey']) {
    const key = def[keyField];
    if (!key) continue;
    for (const loc of LOCALES) {
      if (!hasKey(dicts[loc], key)) errors.push(`[def ${defId}] ключ ${keyField}="${key}" отсутствует в локали ${loc}`);
    }
  }
}

// ── 2. TOOLBOX_GROUPS ─────────────────────────────────────────────────────────
const grouped = new Set();
for (const group of TOOLBOX_GROUPS) {
  for (const loc of LOCALES) {
    if (group.labelKey && !hasKey(dicts[loc], group.labelKey)) {
      errors.push(`[group ${group.id}] labelKey="${group.labelKey}" отсутствует в локали ${loc}`);
    }
  }
  for (const id of group.items) {
    if (!NODE_DEFS[id]) errors.push(`[group ${group.id}] ссылается на несуществующий def "${id}"`);
    else grouped.add(id);
  }
}
for (const defId of Object.keys(NODE_DEFS)) {
  if (!grouped.has(defId)) warnings.push(`[def ${defId}] не входит ни в одну группу палитры (не виден пользователю)`);
}

// ── 3. TEMPLATES ────────────────────────────────────────────────────────────
for (const tpl of TEMPLATES) {
  const ids = tpl.nodes.map((_, i) => `t${i}`);
  const nodeKind = {};
  tpl.nodes.forEach((n, i) => {
    const def = NODE_DEFS[n.defId];
    if (!def) errors.push(`[template ${tpl.id}] узел #${i} ссылается на несуществующий def "${n.defId}"`);
    nodeKind[ids[i]] = def?.kind;
  });
  const acc = [];
  for (const e of tpl.edges) {
    const src = ids[e.from];
    const tgt = ids[e.to];
    if (src == null || tgt == null) {
      errors.push(`[template ${tpl.id}] связь {from:${e.from}, to:${e.to}} ссылается на несуществующий индекс`);
      continue;
    }
    const res = evaluateConnection({ source: src, target: tgt, nodeKind, edges: acc });
    if (!res.ok) {
      errors.push(`[template ${tpl.id}] недопустимая связь ${tpl.nodes[e.from].defId} → ${tpl.nodes[e.to].defId} (${res.code})`);
    } else {
      acc.push({ source: src, target: tgt });
    }
  }
}

// ── Мост «узел карты → шаблон» ────────────────────────────────────────────────
// Индекс живёт отдельно от обоих концов, поэтому легко протухает: шаблон
// переименовали — кнопка в узле ведёт в никуда; узел удалили — запись мусорная.
{
  const templateIds = new Set(TEMPLATES.map(t => t.id));
  const nodeIds = new Set();
  (function walk(n) {
    if (!n) return;
    nodeIds.add(n.id);
    (n.children || []).forEach(walk);
  })(mindmapData);

  for (const [nodeId, tplId] of Object.entries(NODE_TEMPLATES)) {
    if (!templateIds.has(tplId)) {
      errors.push(`[nodeTemplates] узел "${nodeId}" ссылается на несуществующий шаблон "${tplId}"`);
    }
    if (!nodeIds.has(nodeId)) {
      errors.push(`[nodeTemplates] в карте нет узла "${nodeId}" (запись устарела)`);
    }
  }
}

// ── Отчёт ─────────────────────────────────────────────────────────────────────
const c = { red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', dim: '\x1b[2m', reset: '\x1b[0m', bold: '\x1b[1m' };
console.log(`${c.bold}\nBuilder graph lint${c.reset}`);
console.log(`${c.dim}──────────────────────────────────────────────────${c.reset}`);
console.log(`  Node defs:   ${Object.keys(NODE_DEFS).length}`);
console.log(`  Groups:      ${TOOLBOX_GROUPS.length}`);
console.log(`  Templates:   ${TEMPLATES.length}`);
console.log(`  Демо узел→шаблон: ${Object.keys(NODE_TEMPLATES).length}`);

if (warnings.length) {
  console.log(`${c.yellow}\n⚠ Warnings (${warnings.length})${c.reset}`);
  for (const w of warnings) console.log(`  • ${w}`);
}
if (errors.length) {
  console.log(`${c.red}\n✗ Errors (${errors.length})${c.reset}`);
  for (const e of errors) console.log(`  • ${e}`);
  console.log(`${c.red}\n✗ Builder graph lint failed.${c.reset}\n`);
  process.exit(1);
}
console.log(`${c.green}\n✓ Builder graph lint passed.${c.reset}`);
if (warnings.length) console.log(`${c.dim}  (${warnings.length} warnings — not blocking)${c.reset}`);
console.log('');
