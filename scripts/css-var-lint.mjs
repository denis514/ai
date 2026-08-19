#!/usr/bin/env node
/**
 * css-var-lint.mjs — ловит два класса багов CSS-переменных, которые
 * деградируют тему (особенно тёмную):
 *
 *   1. UNDEFINED — var(--foo) где --foo не объявлена нигде в :root.
 *      (Поймал бы --surface-soft, --text-soft — они не существуют,
 *       fallback давал светлый цвет в тёмной теме.)
 *
 *   2. SEMANTIC MISMATCH — переменная используется не по роли:
 *      • color/fill/stroke → border/surface/shadow var  (низкий контраст)
 *      • background* → text var
 *      • border*-color → text var
 *      (Поймал бы color: var(--border-strong) — 35 мест, contrast ~1.8:1.)
 *
 * Источник истины для имён — :root блоки в App.css + index.css.
 *
 * Usage:  node scripts/css-var-lint.mjs
 * Exit:   0 = чисто, 1 = найдены ошибки (для pre-commit hook).
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const DEFINING_FILES = ['src/App.css', 'src/index.css'];
const SCAN_FILES = ['src/App.css', 'src/index.css', 'src/builder/BuilderApp.css'];

// ─── 1. Собрать объявленные переменные ───────────────────────────────────────
const defined = new Set();
for (const f of DEFINING_FILES) {
  const txt = readFileSync(resolve(ROOT, f), 'utf8');
  for (const m of txt.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)) defined.add(m[1]);
}

// Динамические/локальные переменные — задаются inline через style={{}} или
// внутри узких scope. Разрешены везде, семантику не проверяем.
const DYNAMIC = new Set([
  '--cat-color', '--lvl-color', '--match-color', '--node-color',
  '--header-h', '--radius', '--radius-lg', '--radius-pill', '--radius-sm',
  // inline-set (через style={{}}), не объявляются в :root:
  '--avatar-color', '--canvas-tint', '--accent-rgb',
  // выставляются из JS в рантайме, в CSS всегда с запасным значением:
  '--bsheet-max',   // BottomSheet сжимает лист под клавиатуру (visualViewport)
  '--side-top',     // TutorialModal считает высоту шапки
  // semantic color tokens (Atlas хардкодит, но конвенция допустима везде):
  '--success', '--danger', '--warning', '--info',
]);

// Файлы, для которых нарушения = ERROR (блокируют commit). Остальные = WARNING
// (legacy Atlas CSS — фиксим отдельно, не блокируем работу над Builder).
const STRICT_FILES = new Set(['src/builder/BuilderApp.css']);
// Также любые переменные, объявленные локально в самом scan-файле (например
// --node-color в BuilderApp), добавим в defined по ходу — см. ниже.
for (const f of SCAN_FILES) {
  const txt = readFileSync(resolve(ROOT, f), 'utf8');
  for (const m of txt.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)) defined.add(m[1]);
}

// ─── 2. Семантические группы ─────────────────────────────────────────────────
const TEXT   = new Set(['--text', '--text-muted', '--text-dim', '--tooltip-text']);
const BG     = new Set(['--bg', '--bg-grid', '--surface', '--surface-2', '--surface-3', '--tooltip-bg', '--accent-soft']);
const BORDER = new Set(['--border', '--border-strong']);
const LINE   = new Set(['--line', '--line-soft', '--line-deep']);
const SHADOW = new Set(['--shadow-sm', '--shadow-md', '--shadow-lg']);
// Универсальные — допустимы в любом свойстве (accent + динамические).
const WILD   = new Set(['--accent', ...DYNAMIC]);

// Свойство → множество ЗАПРЕЩЁННЫХ групп.
//
// ВНИМАНИЕ: проверяем ТОЛЬКО text-color свойства против border/shadow —
// это единственный класс багов, который реально деградирует читаемость
// (color: var(--border-strong) → contrast ~1.8:1).
//
// НЕ проверяем background/border против --text: inversion-паттерн
// (тёмный бейдж: background:var(--text); color:var(--surface)) легитимен
// и широко используется в Atlas. Эти проверки давали false positives.
function forbiddenFor(prop) {
  const p = prop.toLowerCase();
  if (p === 'color' || p === 'fill' || p === 'stroke' || p === '-webkit-text-fill-color') {
    return { bad: [BORDER, SHADOW], label: 'text-color', hint: 'use --text / --text-muted / --text-dim / --accent' };
  }
  return null;
}

function groupName(v) {
  if (TEXT.has(v)) return 'text';
  if (BG.has(v)) return 'surface/bg';
  if (BORDER.has(v)) return 'border';
  if (LINE.has(v)) return 'line';
  if (SHADOW.has(v)) return 'shadow';
  return 'other';
}

// ─── 3. Скан ─────────────────────────────────────────────────────────────────
const errors = [];

for (const f of SCAN_FILES) {
  const txt = readFileSync(resolve(ROOT, f), 'utf8');
  const lines = txt.split('\n');
  lines.forEach((line, i) => {
    // Пропускаем объявления переменных (--foo: ...) — это assignment.
    const declMatch = line.match(/^\s*(--[a-z0-9-]+|[a-z-]+)\s*:/i);
    if (!declMatch) return;
    const prop = declMatch[1];
    if (prop.startsWith('--')) return; // var definition, не usage

    // Все var(--name) в строке.
    const vars = [...line.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map(m => m[1]);
    if (vars.length === 0) return;

    const rule = forbiddenFor(prop);
    for (const v of vars) {
      // (1) undefined
      if (!defined.has(v) && !DYNAMIC.has(v)) {
        errors.push({ f, line: i + 1, type: 'UNDEFINED', prop, v,
          msg: `var(${v}) is not defined in any :root block` });
        continue;
      }
      if (WILD.has(v)) continue;
      // (2) semantic mismatch
      if (rule) {
        for (const badSet of rule.bad) {
          if (badSet.has(v)) {
            errors.push({ f, line: i + 1, type: 'SEMANTIC', prop, v,
              msg: `${rule.label} property uses ${groupName(v)} var ${v} — ${rule.hint}` });
            break;
          }
        }
      }
    }
  });
}

// ─── 4. Отчёт ────────────────────────────────────────────────────────────────
const strictErrors = errors.filter(e => STRICT_FILES.has(e.f));
const warnings = errors.filter(e => !STRICT_FILES.has(e.f));

function fmt(e) {
  const rel = e.f.replace('src/', '');
  return `  [${e.type}] ${rel}:${e.line}  ${e.prop}: var(${e.v})\n           → ${e.msg}`;
}

if (warnings.length > 0) {
  console.log(`⚠️  css-var-lint: ${warnings.length} legacy-предупреждений (Atlas CSS — не блокируют):`);
  for (const e of warnings) console.log(fmt(e));
  console.log('');
}

if (strictErrors.length === 0) {
  console.log(`✅ css-var-lint: BuilderApp.css чист (${defined.size} переменных определено)`);
  process.exit(0);
}

const byType = strictErrors.reduce((a, e) => ((a[e.type] = (a[e.type] || 0) + 1), a), {});
console.error(`❌ css-var-lint: ${strictErrors.length} ошибок в strict-файлах (UNDEFINED: ${byType.UNDEFINED || 0}, SEMANTIC: ${byType.SEMANTIC || 0})\n`);
for (const e of strictErrors) console.error(fmt(e));
console.error(`\nИсправь или (если переменная новая) объяви её в :root блоке App.css.`);
process.exit(1);
