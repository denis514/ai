/**
 * notify-telegram.mjs — отправляет результат QA в Telegram.
 *
 * Использование (GitHub Actions):
 *   node scripts/notify-telegram.mjs
 *
 * Переменные окружения (GitHub Secrets):
 *   TELEGRAM_TOKEN    — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID  — ID чата / канала куда слать
 *   QA_STATUS         — success | failure | cancelled
 *   QA_STEP           — build-lint | smoke-test
 *   COMMIT_SHA        — полный SHA коммита
 *   COMMIT_MSG        — сообщение коммита
 *
 * Как создать бота:
 *   1. Напиши @BotFather в Telegram → /newbot
 *   2. Получи токен → добавь в GitHub Secrets как TELEGRAM_TOKEN
 *   3. Добавь бота в чат или канал
 *   4. Напиши боту любое сообщение, затем открой:
 *      https://api.telegram.org/bot<TOKEN>/getUpdates
 *      Найди "chat":{"id":...} — это и есть TELEGRAM_CHAT_ID
 */

const {
  TELEGRAM_TOKEN,
  TELEGRAM_CHAT_ID,
  QA_STATUS   = 'unknown',
  QA_STEP     = 'qa',
  COMMIT_SHA  = '',
  COMMIT_MSG  = '',
} = process.env;

// Если секреты не настроены — выходим без ошибки (не ломаем CI)
if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.log('[notify-telegram] Skipped — TELEGRAM_TOKEN or TELEGRAM_CHAT_ID not set.');
  process.exit(0);
}

const REPO_URL  = 'https://github.com/denis514/ai';
const SITE_URL  = 'https://105-atlas.vercel.app';
const shortSha  = COMMIT_SHA.slice(0, 7);
const shortMsg  = COMMIT_MSG.split('\n')[0].slice(0, 72);

// ─── Иконки статуса ──────────────────────────────────────────────────────────
const statusIcon = {
  success:   '✅',
  failure:   '❌',
  cancelled: '⚠️',
}[QA_STATUS] ?? '❓';

// ─── Описание шага ───────────────────────────────────────────────────────────
const stepLabel = {
  'build-lint':  'Build + Lint',
  'smoke-test':  'Smoke Tests',
}[QA_STEP] ?? QA_STEP;

// ─── Результат теста из JSON (если есть) ─────────────────────────────────────
async function readTestResults() {
  try {
    const { readFile } = await import('fs/promises');
    const raw = await readFile('test-results/results.json', 'utf8');
    const data = JSON.parse(raw);
    const total  = data.stats?.expected ?? 0;
    const passed = data.stats?.expected - (data.stats?.unexpected ?? 0);
    return { total, passed };
  } catch {
    return null;
  }
}

// ─── Формируем сообщение ─────────────────────────────────────────────────────
async function buildMessage() {
  const lines = [];

  // Заголовок
  lines.push(`${statusIcon} <b>105 Atlas QA — ${QA_STATUS.toUpperCase()}</b>`);
  lines.push('');

  // Коммит
  lines.push(`📝 <code>${shortMsg}</code>`);
  lines.push(`🔗 <a href="${REPO_URL}/commit/${COMMIT_SHA}">${shortSha}</a>`);
  lines.push('');

  // Шаг
  if (QA_STATUS === 'success') {
    lines.push(`${statusIcon} ${stepLabel} — прошло`);

    // Детали тестов если есть
    if (QA_STEP === 'smoke-test') {
      const results = await readTestResults();
      if (results) {
        lines.push(`🧪 Smoke: ${results.passed}/${results.total} тестов`);
      }
    }
  } else {
    lines.push(`${statusIcon} ${stepLabel} — <b>упало</b>`);
    lines.push('');
    lines.push('⚡ Проверь Actions:');
    lines.push(`<a href="${REPO_URL}/actions">${REPO_URL}/actions</a>`);
  }

  lines.push('');
  lines.push(`🌐 <a href="${SITE_URL}">${SITE_URL}</a>`);

  return lines.join('\n');
}

// ─── Отправка ─────────────────────────────────────────────────────────────────
async function send() {
  const text = await buildMessage();

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    }
  );

  const json = await res.json();

  if (!json.ok) {
    console.error('[notify-telegram] Telegram API error:', json.description);
    process.exit(1);
  }

  console.log(`[notify-telegram] Sent: ${QA_STATUS} (${QA_STEP}) → chat ${TELEGRAM_CHAT_ID}`);
}

send().catch(err => {
  console.error('[notify-telegram] Failed:', err.message);
  process.exit(1);
});
