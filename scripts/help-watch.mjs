/**
 * help-watch — сторож актуальности вкладки «Помощь» в Agent Builder.
 *
 * Идея (как у docs-watcher, но для НАШИХ функций, а не внешних доков):
 *   1. Берёт набор «функциональных» файлов билдера — те, что определяют поведение,
 *      описанное в справке (узлы, шаблоны, правила связей, расписание, ключи,
 *      код-панель, автозапуски).
 *   2. Считает sha256 каждого и сравнивает с базой docs/help-watch/baseline.json.
 *   3. Если что-то изменилось с момента последней сверки справки:
 *        - печатает список изменённых файлов;
 *        - шлёт короткий сигнал в Telegram (если заданы секреты);
 *        - дописывает напоминание в tasks/backlog.md.
 *      Это СИГНАЛ «проверь Помощь», а не авто-правка.
 *   4. После того как справка проверена/обновлена — принять базу:
 *        node scripts/help-watch.mjs --accept
 *
 * Запуск:
 *   node scripts/help-watch.mjs            # проверка (для CI/еженедельного крона)
 *   node scripts/help-watch.mjs --accept   # зафиксировать текущее состояние как «справка сверена»
 *
 * ENV (опционально): TELEGRAM_TOKEN, TELEGRAM_CHAT_ID — если не заданы, Telegram тихо пропускается.
 *
 * Выходной код всегда 0 — это сигнальный сторож, он не должен валить CI.
 */
import { readFile, writeFile, mkdir, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Функциональные файлы билдера, влияющие на содержание справки.
// Меняются они → справку стоит перечитать. (Сам HelpPanel сюда не входит:
// его правка и есть «сверка», и принимается через --accept.)
const WATCHED = [
  'src/builder/data/nodeTypes.js',
  'src/builder/data/templates.js',
  'src/builder/services/connectionRules.js',
  'src/builder/components/panels/ScheduleModal.jsx',
  'src/builder/components/panels/ApiKeysModal.jsx',
  'src/builder/components/panels/CodePanel.jsx',
  'src/builder/components/panels/AllSchedulesModal.jsx',
  'src/builder/components/panels/ExecutionPanel.jsx',
];

const BASELINE = join(ROOT, 'docs/help-watch/baseline.json');
const isAccept = process.argv.includes('--accept') || process.argv.includes('--baseline');

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

async function currentHashes() {
  const out = {};
  for (const rel of WATCHED) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) { out[rel] = 'MISSING'; continue; }
    out[rel] = sha256(await readFile(p, 'utf8'));
  }
  return out;
}

async function loadBaseline() {
  if (!existsSync(BASELINE)) return null;
  try { return JSON.parse(await readFile(BASELINE, 'utf8')); }
  catch { return null; }
}

async function saveBaseline(hashes) {
  await mkdir(dirname(BASELINE), { recursive: true });
  await writeFile(BASELINE, JSON.stringify({ reviewedAt: new Date().toISOString().slice(0, 10), files: hashes }, null, 2) + '\n');
}

async function notifyTelegram(changed) {
  const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[help-watch] Telegram пропущен — секреты не заданы.');
    return;
  }
  const text =
    `🆘 Помощь (Agent Builder) могла устареть.\n` +
    `Изменилось функций: ${changed.length}\n` +
    changed.map(f => `• ${f}`).join('\n') +
    `\n\nПроверь вкладку «Помощь» и после сверки выполни: npm run help:watch -- --accept`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    });
    const json = await res.json();
    if (!json.ok) console.error('[help-watch] Telegram error:', json.description);
    else console.log('[help-watch] Telegram сигнал отправлен.');
  } catch (e) {
    console.error('[help-watch] Telegram fetch error:', e.message);
  }
}

async function appendBacklog(changed) {
  const file = join(ROOT, 'tasks/backlog.md');
  if (!existsSync(file)) return;
  const stamp = new Date().toISOString().slice(0, 10);
  const block =
    `\n### [help-watch ${stamp}] Проверить вкладку «Помощь» (Agent Builder)\n` +
    `Изменились функциональные файлы билдера — справка могла устареть:\n` +
    changed.map(f => `- \`${f}\``).join('\n') +
    `\nПосле сверки: \`npm run help:watch -- --accept\`.\n`;
  await appendFile(file, block);
  console.log('[help-watch] Напоминание добавлено в tasks/backlog.md');
}

async function main() {
  const hashes = await currentHashes();

  if (isAccept) {
    await saveBaseline(hashes);
    console.log(`[help-watch] База обновлена (${WATCHED.length} файлов) — справка считается сверенной.`);
    return;
  }

  const base = await loadBaseline();
  if (!base) {
    await saveBaseline(hashes);
    console.log('[help-watch] Базы не было — создана первичная. Запусти снова после изменений.');
    return;
  }

  const changed = WATCHED.filter(rel => base.files?.[rel] !== hashes[rel]);
  if (changed.length === 0) {
    console.log(`[help-watch] ✓ Без изменений с ${base.reviewedAt}. Справка актуальна.`);
    return;
  }

  console.log(`[help-watch] ⚠ Изменились функции (${changed.length}) с ${base.reviewedAt}:`);
  changed.forEach(f => console.log('   • ' + f));
  await notifyTelegram(changed);
  await appendBacklog(changed);
}

main().catch(e => { console.error('[help-watch] fatal:', e); /* не валим CI */ });
