#!/usr/bin/env node
/**
 * ux-audit-review.mjs
 *
 * Готовит АГЕНДУ для периодического UX-аудита (раз в 2 недели). Не делает сам
 * аудит — собирает контекст и каркас, который затем заполняет Claude по скиллу
 * `skills/ux-audit/` (находки + топ-5 предложений).
 *
 * Что делает:
 *   1. Собирает изменённые UI-файлы за последние ~14 дней (.css/.jsx) — где
 *      смотреть в первую очередь.
 *   2. Пишет docs/ux-audit/ux-audit-{YYYY-MM-DD}.md: скоуп, чек-лист эвристик,
 *      пустые секции находок и приоритетов, связь с прошлым аудитом.
 *
 * Usage:
 *   node scripts/ux-audit-review.mjs
 *   node scripts/ux-audit-review.mjs --dry-run
 *
 * Cron: .github/workflows/ux-audit.yml (раз в 2 недели).
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'docs', 'ux-audit');
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const today = new Date().toISOString().slice(0, 10);

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8' }).trim(); } catch { return ''; }
}

// UI-файлы, изменённые за ~14 дней.
const changed = sh('git log --since="14 days ago" --name-only --pretty=format: -- "src/**/*.jsx" "src/**/*.css" "src/builder/**"')
  .split('\n').map(s => s.trim()).filter(Boolean);
const uniqueChanged = [...new Set(changed)].filter(f => /\.(jsx|css)$/.test(f)).sort();

// Прошлый аудит — для журнала преемственности.
let prev = null;
if (existsSync(OUT_DIR)) {
  const files = readdirSync(OUT_DIR).filter(f => /^ux-audit-\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
  prev = files.length ? files[files.length - 1] : null;
}

const doc = `# UX-аудит ${today}

> Агенда сгенерирована автоматически. Заполняется по скиллу \`skills/ux-audit/\`
> (эвристики + опыт продукта + поток + доступность → топ-5 предложений).

## Скоуп
- [ ] Весь продукт  /  [ ] Конкретная зона: _______
- Темы: светлая + тёмная · экраны: десктоп + мобайл (390×844)

## Где смотреть в первую очередь (изменено за ~14 дней)
${uniqueChanged.length ? uniqueChanged.map(f => `- \`${f}\``).join('\n') : '- (нет UI-изменений за период — провести общий аудит ключевых задач)'}

## Ключевые задачи пользователя (пройти как пользователь)
1. Первый визит → понятно ли, что это и что делать дальше.
2. Найти узел/тему → открыть → дойти до сути.
3. Обучение: начать маршрут/туториал → дойти до результата.
4. Builder: собрать схему → запустить → получить результат → поделиться.

## Чек-лист эвристик (heuristic-evaluator)
- [ ] Видимость статуса  - [ ] Язык пользователя  - [ ] Контроль/свобода
- [ ] Единообразие  - [ ] Предотвращение ошибок  - [ ] Узнавание, не память
- [ ] Гибкость  - [ ] Минимализм  - [ ] Помощь при ошибках  - [ ] Документация

## Находки (заполнить)
<!-- [сегмент] экран — проблема — почему мешает — severity high|med|low -->

## Топ-5 предложений (impact × effort)
| # | Предложение | Impact | Effort | Эффект |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |
| 5 |  |  |  |  |

## Журнал преемственности
Прошлый аудит: ${prev ? `\`docs/ux-audit/${prev}\`` : '— (первый аудит)'}
- Что из прошлых предложений внедрено: _______
- Что осталось/перенесено: _______
`;

// ── Предохранители от лавины пустых агенд ──────────────────────────────────
// 1) Каденция: только 1-й и 3-й понедельник месяца (числа 1-7 и 15-21).
//    Cron в GitHub Actions выражает это ненадёжно, поэтому решаем здесь.
// 2) Прошлая агенда не заполнена — новую не создаём, иначе они копятся
//    десятками и настоящие находки в них теряются.
// Оба предохранителя снимаются флагом --force.
const dayOfMonth = new Date().getDate();
const inCadence = (dayOfMonth >= 1 && dayOfMonth <= 7) || (dayOfMonth >= 15 && dayOfMonth <= 21);
const prevUnfilled = prev && /^\|\s*1\s*\|\s*\|\s*\|\s*\|\s*\|\s*$/m.test(
  readFileSync(join(OUT_DIR, prev), 'utf8')
);

if (!DRY && !FORCE && !inCadence) {
  console.log(`UX-audit: пропуск — не 1-й и не 3-й понедельник месяца (сегодня ${dayOfMonth}-е). Обойти: --force`);
  process.exit(0);
}
if (!DRY && !FORCE && prevUnfilled) {
  console.log(`UX-audit: пропуск — прошлая агенда docs/ux-audit/${prev} ещё не заполнена. Заполни её или запусти с --force`);
  process.exit(0);
}

if (DRY) {
  console.log(doc);
} else {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const file = join(OUT_DIR, `ux-audit-${today}.md`);
  writeFileSync(file, doc);
  console.log(`UX-audit agenda → docs/ux-audit/ux-audit-${today}.md (UI-файлов: ${uniqueChanged.length})`);
}
