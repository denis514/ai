#!/usr/bin/env node
/**
 * weekly-strategy-review.mjs
 *
 * Еженедельный сбор бизнес-сигналов проекта в один markdown-документ
 * для review founder'ом. Запускается вручную или по cron (Monday 09:00 UTC).
 *
 * Что делает:
 *   1. Собирает git activity за последние 7 дней (velocity)
 *   2. Парсит tasks/current.md (open/in-progress count)
 *   3. Читает docs/business-strategy/05-metrics.md (KPI targets)
 *   4. Если есть Stripe credentials в env — fetch MRR delta (TODO)
 *   5. Если есть Plausible/Mixpanel — fetch traffic (TODO)
 *   6. Записывает `tasks/weekly-strategy-{YYYY-MM-DD}.md` со structure:
 *      - Состояние vs targets
 *      - Что произошло за неделю
 *      - Open questions для founder
 *      - Top 3 priorities на следующую неделю (placeholder, founder fills)
 *
 * Usage:
 *   node scripts/weekly-strategy-review.mjs
 *   node scripts/weekly-strategy-review.mjs --dry-run  # печать в stdout без файла
 *
 * Cron вариант (если запустим GitHub Action):
 *   .github/workflows/weekly-strategy-review.yml
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const ISO_TODAY = new Date().toISOString().slice(0, 10);
const DRY = process.argv.includes('--dry-run');

// ─── Helpers ────────────────────────────────────────────────────────────────

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (e) {
    return `(git error: ${e.message})`;
  }
}

function readSafe(path) {
  try {
    return readFileSync(join(ROOT, path), 'utf8');
  } catch {
    return null;
  }
}

// ─── Section: Git velocity ──────────────────────────────────────────────────

function gitVelocity() {
  const log = git('log --since="7 days ago" --pretty=format:"%h %ad %s" --date=short --no-merges');
  const commitCount = log ? log.split('\n').length : 0;
  const filesChanged = git('log --since="7 days ago" --name-only --pretty=format: --no-merges | sort -u | grep -v "^$" | wc -l').trim();
  const insertions = git('log --since="7 days ago" --pretty=tformat: --numstat --no-merges | awk \'{ s += $1 } END { print s+0 }\'').trim();
  const deletions = git('log --since="7 days ago" --pretty=tformat: --numstat --no-merges | awk \'{ s += $2 } END { print s+0 }\'').trim();

  return {
    commitCount,
    filesChanged: parseInt(filesChanged, 10) || 0,
    insertions: parseInt(insertions, 10) || 0,
    deletions: parseInt(deletions, 10) || 0,
    log: log || '(no commits)'
  };
}

// ─── Section: Tasks state ───────────────────────────────────────────────────

function tasksSnapshot() {
  const content = readSafe('tasks/current.md');
  if (!content) return { open: 0, total: 0, openList: [] };

  // Простая эвристика: считаем рядом «open» / «in-progress» pending tasks
  const openMatches = (content.match(/^\|.*\|\s*open\s*\|/gim) || []);
  const inProgressMatches = (content.match(/^\|.*\|\s*in[-_ ]progress\s*\|/gim) || []);

  // Берём первые 5 строк с "open" для preview
  const previewLines = openMatches.slice(0, 5).map(l => l.split('|').map(s => s.trim()).filter(Boolean).slice(0, 2).join(' — '));

  return {
    open: openMatches.length,
    inProgress: inProgressMatches.length,
    total: openMatches.length + inProgressMatches.length,
    previewLines
  };
}

// ─── Section: Strategy doc anchors ──────────────────────────────────────────

function strategyAnchors() {
  const docs = [
    'docs/business-strategy/01-revenue-model.md',
    'docs/business-strategy/04-monetization-roadmap.md',
    'docs/business-strategy/05-metrics.md',
    'docs/business-strategy/07-decisions.md'
  ];
  return docs.map(d => ({ path: d, exists: existsSync(join(ROOT, d)) }));
}

// ─── Section: Content state ─────────────────────────────────────────────────

function contentSnapshot() {
  try {
    const hashes = JSON.parse(readSafe('src/data/nodeHashes.json') || '{}');
    const nodeCount = Object.keys(hashes.nodes || {}).length;
    const tutorialCount = Object.keys(hashes.tutorials || {}).length;
    return { nodeCount, tutorialCount };
  } catch {
    return { nodeCount: '?', tutorialCount: '?' };
  }
}

// ─── Section: Recent decisions ──────────────────────────────────────────────

function recentDecisions() {
  const content = readSafe('docs/business-strategy/07-decisions.md');
  if (!content) return [];

  // Парсим даты YYYY-MM-DD за последние 30 дней
  const matches = content.match(/^## (\d{4}-\d{2}-\d{2}) — (.+)$/gm) || [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  return matches
    .map(m => {
      const [, date, title] = m.match(/^## (\d{4}-\d{2}-\d{2}) — (.+)$/) || [];
      return { date, title };
    })
    .filter(d => d.date && new Date(d.date) >= cutoff);
}

// ─── Generate report ────────────────────────────────────────────────────────

function buildReport() {
  const git = gitVelocity();
  const tasks = tasksSnapshot();
  const anchors = strategyAnchors();
  const content = contentSnapshot();
  const decisions = recentDecisions();

  return `# Weekly Strategy Review — ${ISO_TODAY}

> Auto-generated by \`scripts/weekly-strategy-review.mjs\`.
> Edit only **§ Founder review** section below. Other sections will be overwritten next week.

---

## 1. State snapshot

### Content
- **Nodes**: ${content.nodeCount}
- **Tutorials**: ${content.tutorialCount}

### Git velocity (last 7 days)
- **Commits**: ${git.commitCount}
- **Files changed**: ${git.filesChanged}
- **Lines added/removed**: +${git.insertions} / -${git.deletions}

### Tasks
- **Open**: ${tasks.open}
- **In progress**: ${tasks.inProgress}
- **Total active**: ${tasks.total}

### Open task previews
${tasks.previewLines && tasks.previewLines.length ? tasks.previewLines.map(l => `- ${l}`).join('\n') : '_(no open tasks parsed from current.md)_'}

### Strategy docs availability
${anchors.map(a => `- ${a.exists ? '✅' : '❌'} \`${a.path}\``).join('\n')}

---

## 2. Recent decisions (last 30 days)

${decisions.length ? decisions.map(d => `- **${d.date}**: ${d.title}`).join('\n') : '_(no recent decision log entries)_'}

---

## 3. Git activity preview

\`\`\`
${git.log.split('\n').slice(0, 15).join('\n')}
${git.log.split('\n').length > 15 ? `... (${git.log.split('\n').length - 15} more commits)` : ''}
\`\`\`

---

## 4. Specialist agent contributions

> Запусти каждого специалиста через Agent tool с задачей: «вклад в weekly review за неделю».
> Затем вставь summary сюда.

### 🚀 growth-strategist
_Pending — run via Agent tool_

### 💰 monetization-architect
_Pending — run via Agent tool_

### 🎯 product-strategist
_Pending — run via Agent tool_

### 🔭 competitive-intelligence
_Pending — run via Agent tool_

---

## 5. KPI vs targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| MRR | $X | _TBD — connect Stripe_ | ⚠️ |
| New paid signups / week | 5 (Day 60-90) | _TBD_ | ⚠️ |
| Free signups / week | 50 (Day 90) | _TBD — connect analytics_ | ⚠️ |
| Activation rate | >60% | _TBD_ | ⚠️ |
| Trial → paid | 25% | _TBD_ | ⚠️ |
| Churn (monthly) | <5% Pro / <3% Team | _TBD_ | ⚠️ |

---

## 6. § Founder review (manual fill)

### Что произошло хорошее за неделю
- ...

### Что не получилось / blockers
- ...

### Top 3 priorities на следующую неделю
1. ...
2. ...
3. ...

### Open questions требующие decision
- ...

### Risk watch
- ...

---

_Generated: ${new Date().toISOString()} | Next auto-run: ${(() => {
  const next = new Date();
  next.setDate(next.getDate() + 7);
  return next.toISOString().slice(0, 10);
})()}_
`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

const report = buildReport();
const outPath = `tasks/weekly-strategy-${ISO_TODAY}.md`;

if (DRY) {
  console.log(report);
  console.log(`\n[dry-run] would have written ${outPath}`);
} else {
  writeFileSync(join(ROOT, outPath), report, 'utf8');
  console.log(`✅ weekly-strategy: ${outPath} (${report.length} bytes)`);
  console.log(`   Next steps:`);
  console.log(`   1. Open ${outPath}`);
  console.log(`   2. Run specialist agents (§ 4)`);
  console.log(`   3. Fill § 6 Founder review`);
  console.log(`   4. Commit alongside relevant task updates`);
}
