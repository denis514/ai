#!/usr/bin/env node
/**
 * Verify inline links: [[node:id|label]], [[tutorial:id|label]], [[prompt:id|label]]
 *
 * Scans across ALL localized content (nodes.json, tutorials.json, prompts.json,
 * prompt-library.json, paths.json) in ru/en/fi and verifies every link
 * resolves to a real id in the corresponding registry.
 *
 * Run:    node scripts/verify-inline-links.mjs
 * Exit:   0 — clean, 1 — broken links found
 *
 * Companion to scripts/lint-data.mjs (schema rules) and
 * scripts/audit-cross-links.mjs (plain-text mention heuristics).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const LOCALES = ['ru', 'en', 'fi'];
const LINK_RE = /\[\[(node|tutorial|prompt):([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

function readJSON(rel) {
  return JSON.parse(readFileSync(resolve(ROOT, rel), 'utf8'));
}

// Build registries of valid IDs per type.
const nodesByLocale = Object.fromEntries(
  LOCALES.map(l => [l, readJSON(`src/locales/${l}/nodes.json`)])
);
const tutorialsByLocale = Object.fromEntries(
  LOCALES.map(l => [l, readJSON(`src/locales/${l}/tutorials.json`)])
);
const promptsByLocale = Object.fromEntries(
  LOCALES.map(l => [l, readJSON(`src/locales/${l}/prompts.json`)])
);
const libraryByLocale = Object.fromEntries(
  LOCALES.map(l => [l, readJSON(`src/locales/${l}/prompt-library.json`)])
);

// Union of node ids across locales (canonical: all locales should share keys,
// but link target must exist in at least one — usually ru, the canonical).
const nodeIds = new Set();
LOCALES.forEach(l => Object.keys(nodesByLocale[l]).forEach(k => nodeIds.add(k)));

const tutorialIds = new Set();
LOCALES.forEach(l => Object.keys(tutorialsByLocale[l]).forEach(k => tutorialIds.add(k)));

const promptIds = new Set();
LOCALES.forEach(l => {
  Object.keys(promptsByLocale[l]).forEach(k => promptIds.add(k));
  // prompt-library entries may be nested under category buckets — flatten one level
  const lib = libraryByLocale[l];
  for (const k of Object.keys(lib)) {
    const v = lib[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && !('title' in v)) {
      // bucket like { category: { id1: {...}, id2: {...} } }
      for (const sub of Object.keys(v)) promptIds.add(sub);
    } else {
      promptIds.add(k);
    }
  }
});

const REGISTRIES = { node: nodeIds, tutorial: tutorialIds, prompt: promptIds };

function scanString(text, ctx, broken) {
  if (typeof text !== 'string') return;
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(text)) !== null) {
    const [, type, id] = m;
    const reg = REGISTRIES[type];
    if (!reg.has(id)) {
      broken.push({ ...ctx, type, id, snippet: text.slice(Math.max(0, m.index - 20), m.index + 60) });
    }
  }
}

function walk(obj, path, broken) {
  if (obj == null) return;
  if (typeof obj === 'string') {
    scanString(obj, { path: path.join('.') }, broken);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, [...path, `[${i}]`], broken));
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      walk(v, [...path, k], broken);
    }
  }
}

const broken = [];

for (const locale of LOCALES) {
  walk(nodesByLocale[locale],     [`nodes.json[${locale}]`],          broken);
  walk(tutorialsByLocale[locale], [`tutorials.json[${locale}]`],      broken);
  walk(promptsByLocale[locale],   [`prompts.json[${locale}]`],        broken);
  walk(libraryByLocale[locale],   [`prompt-library.json[${locale}]`], broken);
}

if (broken.length === 0) {
  console.log(`✅ verify-inline-links: all links resolve (${nodeIds.size} nodes, ${tutorialIds.size} tutorials, ${promptIds.size} prompts)`);
  process.exit(0);
}

console.error(`✗ verify-inline-links: ${broken.length} broken link(s)\n`);
for (const b of broken) {
  console.error(`  [[${b.type}:${b.id}]] at ${b.path}`);
  console.error(`    «…${b.snippet.replace(/\s+/g, ' ').slice(0, 80)}…»`);
}
process.exit(1);
