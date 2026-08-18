/**
 * docs-watcher.mjs — «сторож официальной документации Claude».
 *
 * Что делает:
 *   1. Скачивает набор официальных страниц документации (в формате .md — он
 *      стабильнее HTML для диффов) + индекс llms.txt (чтобы ловить новые/
 *      удалённые страницы).
 *   2. Считает sha256 каждой страницы и сравнивает с сохранённым «слепком»
 *      в docs/docs-watch/state.json.
 *   3. При изменениях:
 *        - перезаписывает снапшот в docs/docs-watch/snapshots/<slug>.md
 *        - дописывает дифф + черновик предложений по узлам Atlas в tasks/docs-watch-archive.md
 *        - шлёт короткий сигнал в Telegram (если заданы секреты)
 *   4. Обновляет state.json.
 *
 * Первый запуск (нет state.json) = создание базовой линии: снимает все
 * снапшоты молча, без уведомлений.
 *
 * Запуск:
 *   node scripts/docs-watcher.mjs            # обычная проверка
 *   node scripts/docs-watcher.mjs --baseline # только пересоздать базу, без уведомлений
 *
 * Переменные окружения (GitHub Secrets), все опциональны:
 *   TELEGRAM_TOKEN   — токен бота
 *   TELEGRAM_CHAT_ID — чат/канал для сигнала
 *   Если не заданы — Telegram-шаг тихо пропускается (CI не падает).
 */

import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Конфигурация: за чем следим ─────────────────────────────────────────────
// label — человеко-понятное имя; atlasHint — какие узлы Atlas трогать при правке.
const WATCH = [
  {
    slug: 'desktop',
    url: 'https://code.claude.com/docs/en/desktop.md',
    label: 'Desktop app (вкладка Code)',
    atlasHint: 'pl-desktop, pl-code-mode, apps-setup',
  },
  {
    slug: 'desktop-quickstart',
    url: 'https://code.claude.com/docs/en/desktop-quickstart.md',
    label: 'Desktop quickstart',
    atlasHint: 'apps-setup, pl-app-modes',
  },
  {
    slug: 'desktop-scheduled-tasks',
    url: 'https://code.claude.com/docs/en/desktop-scheduled-tasks.md',
    label: 'Desktop scheduled tasks',
    atlasHint: 'pl-cowork, автоматизация',
  },
  {
    slug: 'platforms',
    url: 'https://code.claude.com/docs/en/platforms.md',
    label: 'Platforms and integrations',
    atlasHint: 'pl-platforms, pl-compare',
  },
  {
    slug: 'llms-index',
    url: 'https://code.claude.com/docs/llms.txt',
    label: 'Индекс всех страниц документации (llms.txt)',
    atlasHint: 'новые/удалённые темы в экосистеме',
  },
];

const STATE_DIR = join(ROOT, 'docs', 'docs-watch');
const SNAP_DIR = join(STATE_DIR, 'snapshots');
const STATE_FILE = join(STATE_DIR, 'state.json');
// Машинный поток идёт в отдельный архив, чтобы бэклог оставался человеческим.
const BACKLOG = join(ROOT, 'tasks', 'docs-watch-archive.md');

const MAX_DIFF_LINES_TG = 0;       // в Telegram дифф не шлём (только сводку)
const MAX_DIFF_LINES_BACKLOG = 250; // в архиве — кап на дифф одной страницы

const isBaseline = process.argv.includes('--baseline');
const today = new Date().toISOString().slice(0, 10);

// ─── Утилиты ─────────────────────────────────────────────────────────────────
function sha256(s) {
  return createHash('sha256').update(s).digest('hex');
}

// Нормализация: убираем хвостовые пробелы в строках и пустые строки в конце.
function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '\n');
}

// Построчный дифф через LCS. Возвращает массив строк вида "+ ..." / "- ...".
function lineDiff(oldLines, newLines) {
  const n = oldLines.length;
  const m = newLines.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = oldLines[i] === newLines[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (oldLines[i] === newLines[j]) { i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push('- ' + oldLines[i]); i++; }
    else { out.push('+ ' + newLines[j]); j++; }
  }
  while (i < n) { out.push('- ' + oldLines[i]); i++; }
  while (j < m) { out.push('+ ' + newLines[j]); j++; }
  return out;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': '105-Atlas-docs-watcher/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function loadState() {
  try {
    return JSON.parse(await readFile(STATE_FILE, 'utf8'));
  } catch {
    return { pages: {} };
  }
}

async function loadSnapshot(slug) {
  try {
    return await readFile(join(SNAP_DIR, `${slug}.md`), 'utf8');
  } catch {
    return null;
  }
}

// ─── Telegram ────────────────────────────────────────────────────────────────
async function notifyTelegram(changes) {
  const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[docs-watcher] Telegram skipped — secrets not set.');
    return;
  }
  const lines = [];
  lines.push('📄 <b>Документация Claude изменилась</b>');
  lines.push('');
  for (const c of changes) {
    lines.push(`• <b>${c.label}</b> — ${c.added}+ / ${c.removed}− строк`);
  }
  lines.push('');
  lines.push('Черновик правок и дифф — в <code>tasks/docs-watch-archive.md</code>.');
  lines.push('Скажи Claude: «обнови Atlas под документацию» — он разнесёт изменения по узлам.');
  const text = lines.join('\n');

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const json = await res.json();
  if (!json.ok) {
    console.error('[docs-watcher] Telegram error:', json.description);
  } else {
    console.log('[docs-watcher] Telegram signal sent.');
  }
}

// ─── архив сторожей (tasks/docs-watch-archive.md) ────────────────────────────
async function appendBacklog(changes) {
  const blocks = [];
  blocks.push(`\n## 📄 docs-watch: документация изменилась — ${today}\n`);
  blocks.push('> Авто-сигнал от `scripts/docs-watcher.mjs`. Реакция: «сигнал + черновик правок».');
  blocks.push('> Прогон: прочитать дифф ниже → разнести по узлам Atlas → `node scripts/sync-whats-new.mjs`.\n');
  for (const c of changes) {
    blocks.push(`### ${c.label}`);
    blocks.push(`- Источник: ${c.url}`);
    blocks.push(`- Изменения: **${c.added}** добавлено, **${c.removed}** удалено`);
    blocks.push(`- Затронутые узлы Atlas (черновик): \`${c.atlasHint}\``);
    blocks.push('');
    let diff = c.diff;
    let truncated = false;
    if (diff.length > MAX_DIFF_LINES_BACKLOG) {
      diff = diff.slice(0, MAX_DIFF_LINES_BACKLOG);
      truncated = true;
    }
    blocks.push('```diff');
    blocks.push(...diff);
    if (truncated) {
      blocks.push(`... (дифф обрезан до ${MAX_DIFF_LINES_BACKLOG} строк; полный текст — в docs/docs-watch/snapshots/${c.slug}.md)`);
    }
    blocks.push('```');
    blocks.push('');
  }
  const addition = blocks.join('\n');
  let prev = '';
  if (existsSync(BACKLOG)) prev = await readFile(BACKLOG, 'utf8');
  await writeFile(BACKLOG, prev + addition, 'utf8');
  console.log('[docs-watcher] tasks/docs-watch-archive.md updated.');
}

// ─── Главный проход ──────────────────────────────────────────────────────────
async function main() {
  await mkdir(SNAP_DIR, { recursive: true });
  const state = await loadState();
  const firstRun = Object.keys(state.pages).length === 0;
  const changes = [];
  const failures = [];

  for (const page of WATCH) {
    let text;
    try {
      text = normalize(await fetchText(page.url));
    } catch (err) {
      failures.push(`${page.slug}: ${err.message}`);
      console.error(`[docs-watcher] FETCH FAIL ${page.slug}: ${err.message}`);
      continue;
    }
    const hash = sha256(text);
    const prevHash = state.pages[page.slug]?.hash;

    if (prevHash === hash) {
      state.pages[page.slug].lastChecked = today;
      continue;
    }

    // Изменилось (или новая страница). Считаем дифф если был старый снапшот.
    const oldSnap = await loadSnapshot(page.slug);
    if (oldSnap && !firstRun && !isBaseline) {
      const diff = lineDiff(normalize(oldSnap).split('\n'), text.split('\n'));
      const added = diff.filter((l) => l.startsWith('+ ')).length;
      const removed = diff.filter((l) => l.startsWith('- ')).length;
      changes.push({ ...page, diff, added, removed });
    }

    await writeFile(join(SNAP_DIR, `${page.slug}.md`), text, 'utf8');
    state.pages[page.slug] = { hash, lastChanged: today, lastChecked: today, url: page.url };
  }

  state.lastRun = today;
  if (failures.length) state.lastFailures = failures;
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');

  if (firstRun || isBaseline) {
    console.log(`[docs-watcher] Baseline создан (${WATCH.length - failures.length} страниц). Уведомления не отправлены.`);
    if (failures.length) console.log(`[docs-watcher] Не удалось скачать: ${failures.join('; ')}`);
    return;
  }

  if (changes.length === 0) {
    console.log('[docs-watcher] Изменений нет.');
    if (failures.length) console.log(`[docs-watcher] Внимание, не скачалось: ${failures.join('; ')}`);
    return;
  }

  console.log(`[docs-watcher] Изменилось страниц: ${changes.length}`);
  await appendBacklog(changes);
  await notifyTelegram(changes);
}

main().catch((err) => {
  console.error('[docs-watcher] Fatal:', err.message);
  process.exit(1);
});
