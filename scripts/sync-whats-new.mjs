#!/usr/bin/env node
/**
 * sync-whats-new.mjs — авто-обновление реестра новинок
 *
 * Запуск (вручную или после правки контента):
 *   node scripts/sync-whats-new.mjs
 *
 * Также запускается автоматически через:
 *   npm run sync          — явный вызов
 *   npm run build         — через prebuild
 *
 * ── Алгоритм ─────────────────────────────────────────────────────────────────
 * 1. Вычисляет sha1-хеши контентных полей каждого узла (ru/nodes.json)
 *    и каждого туториала (ru/tutorials.json + структура tutorials.js)
 * 2. Сравнивает с сохранёнными хешами (src/data/nodeHashes.json)
 * 3. Новые ID   → тип 'new'     + сегодняшняя дата → в whatsNew.js
 *    Изменённые → тип 'updated' + сегодняшняя дата → в whatsNew.js
 * 4. Сохраняет обновлённые хеши в nodeHashes.json
 *
 * ── Первый запуск (nodeHashes.json отсутствует) ───────────────────────────────
 * Только создаёт начальный snapshot хешей.
 * whatsNew.js НЕ изменяется — чтобы не помечать всё как «новое» разом.
 *
 * ── После правки контента ─────────────────────────────────────────────────────
 * AI должен запускать этот скрипт ПЕРЕД git commit.
 * Изменённые файлы (whatsNew.js + nodeHashes.json) коммитятся вместе с контентом.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createHash }   from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10);

// ── Утилиты ──────────────────────────────────────────────────────────────────

function sha1(obj) {
  return createHash('sha1').update(JSON.stringify(obj), 'utf8').digest('hex');
}

function readJson(filePath) {
  if (!existsSync(filePath)) return null;
  try   { return JSON.parse(readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

// ── Пути ─────────────────────────────────────────────────────────────────────

const NODES_RU_PATH      = resolve(ROOT, 'src/locales/ru/nodes.json');
const TUTORIALS_JS_PATH  = resolve(ROOT, 'src/data/tutorials.js');
const TUTORIALS_RU_PATH  = resolve(ROOT, 'src/locales/ru/tutorials.json');
const HASHES_PATH        = resolve(ROOT, 'src/data/nodeHashes.json');
const WHATS_NEW_PATH     = resolve(ROOT, 'src/data/whatsNew.js');

// ── Загрузка предыдущих хешей ────────────────────────────────────────────────

// Флаг --regen: принудительно пересобирает whatsNew.js из существующих записей
// (не меняет хеши и даты, только приводит формат к актуальному)
const isRegen = process.argv.includes('--regen');

const storedHashes = readJson(HASHES_PATH);
const isFirstRun   = storedHashes === null;

if (isFirstRun) {
  console.log('ℹ️  sync-whats-new: первый запуск — создаю snapshot хешей (whatsNew.js не меняется).');
}

const prevNodeHashes = storedHashes?.nodes     || {};
const prevTutHashes  = storedHashes?.tutorials || {};

// ── Хеши узлов (ru/nodes.json) ───────────────────────────────────────────────

const nodes        = readJson(NODES_RU_PATH) || {};
const newNodeHashes = {};
const addedNodes   = [];
const changedNodes = [];

for (const [id, node] of Object.entries(nodes)) {
  const hash = sha1({
    what:     node.what,
    why:      node.why,
    when:     node.when,
    impact:   node.impact,
    example:  node.example,
    mistakes: node.mistakes,
  });
  newNodeHashes[id] = hash;

  if      (!prevNodeHashes[id])                     addedNodes.push(id);
  else if (prevNodeHashes[id] !== hash)             changedNodes.push(id);
}

// ── Хеши туториалов (tutorials.js + ru/tutorials.json) ───────────────────────

// Структура туториала (шаги, уровень, аудитория) из tutorials.js
// dynamic import работает т.к. файл — чистые данные без зависимостей
const { tutorials: tutStruct } = await import(
  pathToFileURL(TUTORIALS_JS_PATH).href
);

const tutContent    = readJson(TUTORIALS_RU_PATH) || {};
const newTutHashes  = {};
const addedTutorials   = [];
const changedTutorials = [];

for (const [key, struct] of Object.entries(tutStruct)) {
  const content = tutContent[key] || {};

  // Шаги переехали из tutorials.js в локали (там они ключи объекта steps,
  // в нужном порядке). Для хеша восстанавливаем прежнюю форму [{id}] —
  // иначе смена формата хранения пометила бы все 261 туториал как «обновлён».
  const stepsForHash = Object.keys(content.steps || {}).map(id => ({ id }));

  const hash = sha1({
    // Структура (добавили шаг, изменили уровень/аудиторию)
    steps:    stepsForHash,
    level:    struct.level,
    audience: struct.audience,
    nodeId:   struct.nodeId,
    // Текстовый контент (заголовок, описание, итоги)
    title:     content.title,
    subtitle:  content.subtitle,
    whatItIs:  content.whatItIs,
    approach:  content.approach,
    outcomes:  content.outcomes,
  });
  newTutHashes[key] = hash;

  if      (!prevTutHashes[key])                   addedTutorials.push(key);
  else if (prevTutHashes[key] !== hash)           changedTutorials.push(key);
}

// ── Сохраняем обновлённые хеши ───────────────────────────────────────────────

const updatedHashes = {
  _updated: TODAY,
  _note: 'Авто-генерируется скриптом scripts/sync-whats-new.mjs. Не редактируй вручную.',
  nodes:     newNodeHashes,
  tutorials: newTutHashes,
};
writeFileSync(HASHES_PATH, JSON.stringify(updatedHashes, null, 2) + '\n', 'utf8');

// ── Первый запуск: только snapshot, выходим ───────────────────────────────────

if (isFirstRun) {
  console.log(`✅ Snapshot создан:`);
  console.log(`   ${Object.keys(newNodeHashes).length} узлов`);
  console.log(`   ${Object.keys(newTutHashes).length} туториалов`);
  console.log(`   Следующие запуски будут автоматически обновлять whatsNew.js`);
  process.exit(0);
}

// ── Нет изменений ─────────────────────────────────────────────────────────────

const hasChanges = addedNodes.length || changedNodes.length ||
                   addedTutorials.length || changedTutorials.length;

if (!hasChanges && !isRegen) {
  console.log('✅ sync-whats-new: контент не изменился, whatsNew.js актуален');
  process.exit(0);
}

if (isRegen) {
  console.log('ℹ️  sync-whats-new: --regen — пересобираю whatsNew.js без изменения дат');
}

// ── Читаем текущий whatsNew.js ────────────────────────────────────────────────

const whatsNewText = existsSync(WHATS_NEW_PATH)
  ? readFileSync(WHATS_NEW_PATH, 'utf8')
  : '';

// Парсим существующие записи.
// Ищем ТОЛЬКО внутри тела объекта WHATS_NEW (после '= {', до финального '};')
// чтобы не захватить примеры из комментариев.
const existingEntries = {};
const bodyMatch = whatsNewText.match(/WHATS_NEW\s*=\s*\{([\s\S]*?)\};/);
const bodyText  = bodyMatch ? bodyMatch[1] : '';
const entryRegex = /'([a-z][a-z0-9-]*)'\s*:\s*\{\s*date:\s*'([^']+)'\s*,\s*type:\s*'([^']+)'(?:\s*,\s*kind:\s*'([^']+)')?\s*\}/g;
let m;
while ((m = entryRegex.exec(bodyText)) !== null) {
  const [, id, date, type, kind] = m;
  existingEntries[id] = { date, type, ...(kind ? { kind } : {}) };
}

// ── Очищаем мусорные записи (ID не существует ни в узлах, ни в туториалах) ────

const validNodeIds = new Set(Object.keys(newNodeHashes));
const validTutIds  = new Set(Object.keys(newTutHashes));

for (const id of Object.keys(existingEntries)) {
  const entry = existingEntries[id];
  const isTut  = entry.kind === 'tutorial';
  if (isTut  && !validTutIds.has(id))  delete existingEntries[id];
  if (!isTut && !validNodeIds.has(id)) delete existingEntries[id];
}

// ── Применяем изменения ───────────────────────────────────────────────────────

for (const id of addedNodes)       existingEntries[id] = { date: TODAY, type: 'new' };
for (const id of changedNodes)     existingEntries[id] = { date: TODAY, type: 'updated' };
for (const id of addedTutorials)   existingEntries[id] = { date: TODAY, type: 'new',     kind: 'tutorial' };
for (const id of changedTutorials) existingEntries[id] = { date: TODAY, type: 'updated', kind: 'tutorial' };

// ── Генерируем новый whatsNew.js ──────────────────────────────────────────────

// Разделяем на туториалы и узлы
const tutEntries  = Object.entries(existingEntries).filter(([, v]) => v.kind === 'tutorial');
const nodeEntries = Object.entries(existingEntries).filter(([, v]) => v.kind !== 'tutorial');

// Сортируем по дате desc (свежие — сверху)
const byDateDesc = ([, a], [, b]) => b.date.localeCompare(a.date);
tutEntries.sort(byDateDesc);
nodeEntries.sort(byDateDesc);

function formatEntry([id, v]) {
  const parts = [`date: '${v.date}'`, `type: '${v.type}'`];
  if (v.kind) parts.push(`kind: '${v.kind}'`);
  return `  '${id}': { ${parts.join(', ')} },`;
}

const output = [
  `/**`,
  ` * Реестр обновлений — ГЕНЕРИРУЕТСЯ АВТОМАТИЧЕСКИ скриптом scripts/sync-whats-new.mjs`,
  ` * НЕ РЕДАКТИРУЙ ВРУЧНУЮ.`,
  ` *`,
  ` * Запусти вручную:  node scripts/sync-whats-new.mjs`,
  ` * Или через npm:    npm run sync`,
  ` *`,
  ` * date — уникальный ключ в localStorage (меняется = лейбл появляется у всех снова).`,
  ` * type — 'new' | 'updated'`,
  ` * kind — 'node' (по умолчанию) | 'tutorial'`,
  ` *         node     → клик открывает узел на карте`,
  ` *         tutorial → клик открывает туториал`,
  ` */`,
  `export const WHATS_NEW = {`,
  `  // ─── Туториалы ─────────────────────────────────────────────────────────────`,
  ...tutEntries.map(formatEntry),
  ``,
  `  // ─── Узлы карты ─────────────────────────────────────────────────────────────`,
  ...nodeEntries.map(formatEntry),
  `};`,
  ``,
].join('\n');

writeFileSync(WHATS_NEW_PATH, output, 'utf8');

// ── Отчёт ─────────────────────────────────────────────────────────────────────

const summary = [
  addedNodes.length       && `+${addedNodes.length} новых узлов`,
  changedNodes.length     && `~${changedNodes.length} обновлённых узлов`,
  addedTutorials.length   && `+${addedTutorials.length} новых туториалов`,
  changedTutorials.length && `~${changedTutorials.length} обновлённых туториалов`,
].filter(Boolean).join(', ');

console.log(`✅ sync-whats-new: ${summary}`);
if (addedNodes.length)       console.log(`   Новые узлы:             ${addedNodes.join(', ')}`);
if (changedNodes.length)     console.log(`   Обновлённые узлы:       ${changedNodes.join(', ')}`);
if (addedTutorials.length)   console.log(`   Новые туториалы:        ${addedTutorials.join(', ')}`);
if (changedTutorials.length) console.log(`   Обновлённые туториалы:  ${changedTutorials.join(', ')}`);
console.log(`   whatsNew.js и nodeHashes.json обновлены → включи в git commit`);

// ── Регенерация node-section файлов ───────────────────────────────────────────
// nodes.json — source of truth для скриптов; nodes/{core,sys,commerce}.json —
// генерируемые артефакты. Bundler читает секции (см. src/i18n/content-*.js),
// поэтому sync обязан их актуализировать после каждого изменения контента.
try {
  const { execSync } = await import('node:child_process');
  console.log('');
  execSync('node scripts/split-nodes.mjs', { stdio: 'inherit' });
  console.log('');
  execSync('node scripts/split-tutorials.mjs', { stdio: 'inherit' });
} catch (e) {
  console.error('⚠ splitter не отработал — секции могут быть устаревшими:', e.message);
  process.exit(1);
}
