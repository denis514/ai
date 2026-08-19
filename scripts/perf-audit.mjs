#!/usr/bin/env node
/**
 * performance-auditor companion script.
 *
 * Runs `npm run build`, parses output, scans code for lazy-load opportunities,
 * compares to previous audit if exists, writes report to tasks/perf-audit-<date>.md
 *
 * Usage:  node scripts/perf-audit.mjs
 * Skill:  skills/performance-auditor/SKILL.md
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Thresholds from SKILL.md
const THRESHOLDS = {
  initialJsGzip:    { ok: 120, warn: 180 }, // KB
  initialJsRaw:     { ok: 400, warn: 600 },
  nodesLocaleGzip:  { ok: 130, warn: 180 },
  tutorialsGzip:    { ok: 100, warn: 150 },
  cssGzip:          { ok: 25,  warn: 40  },
  vendorTotalGzip:  { ok: 130, warn: 180 },
};

function status(size, t) {
  if (size <= t.ok) return '✅ OK';
  if (size <= t.warn) return '🟡 Warning';
  return '🔴 Critical';
}

// ─── 1. Build ────────────────────────────────────────────────────────────────
console.log('→ Running vite build...');
let buildOutput;
try {
  buildOutput = execSync('npm run build 2>&1', { cwd: ROOT, encoding: 'utf8' });
} catch (e) {
  console.error('✗ Build failed:', e.stdout?.slice(-500) || e.message);
  process.exit(1);
}

// Parse chunk lines like "dist/assets/nodes-XYZ.js  354.65 kB │ gzip: 160.68 kB"
const CHUNK_RE = /dist\/assets\/(([\w-]+)-[\w]+\.(js|css))\s+([\d.]+)\s+kB\s+│\s+gzip:\s+([\d.]+)\s+kB/g;
const chunks = [];
let m;
while ((m = CHUNK_RE.exec(buildOutput)) !== null) {
  chunks.push({
    file: m[1],          // полное имя файла: index-Be6ZBZ6C.js
    name: m[2],          // имя без хеша: index
    type: m[3],
    rawKB: parseFloat(m[4]),
    gzipKB: parseFloat(m[5]),
  });
}

// Что браузер грузит сразу — берём из самого dist/index.html.
const ENTRY_FILES = new Set(
  (existsSync(join(ROOT, 'dist', 'index.html'))
    ? [...readFileSync(join(ROOT, 'dist', 'index.html'), 'utf8')
        .matchAll(/assets\/([\w-]+\.(?:js|css))/g)].map(x => x[1])
    : [])
);

if (chunks.length === 0) {
  console.error('✗ No chunks parsed from build output. Vite output format may have changed.');
  process.exit(1);
}

// Categorize
const categorize = (c) => {
  if (c.type === 'css') return 'css';
  if (c.name.startsWith('vendor')) return 'vendor';
  // Входной чанк приложения определяем по dist/index.html, а не по имени:
  // чанков с именем index-* может быть несколько (например чанки JSON), и
  // аудит мерил случайный из них. Vendor-чанки отсекли выше — они считаются
  // отдельной строкой, как и раньше.
  if (ENTRY_FILES.has(c.file)) return 'initial';
  // After split-nodes.mjs: nodes.json → core/sys/commerce chunks per locale
  if (['core', 'sys', 'commerce', 'nodes'].includes(c.name)) return 'nodes-locale';
  if (c.name === 'tutorials') return 'tutorials-locale';
  if (c.name === 'content') return 'content';
  if (c.name === 'prompt-library') return 'library';
  return 'other';
};
chunks.forEach(c => c.category = categorize(c));

// Aggregate
const sum = (arr, k) => arr.reduce((s, x) => s + x[k], 0);
const initialJs = chunks.find(c => c.category === 'initial');
const cssChunks = chunks.filter(c => c.category === 'css');
const vendorChunks = chunks.filter(c => c.category === 'vendor');
const nodesChunks = chunks.filter(c => c.category === 'nodes-locale');
const tutChunks = chunks.filter(c => c.category === 'tutorials-locale');

const metrics = {
  initialJsRaw:    initialJs?.rawKB || 0,
  initialJsGzip:   initialJs?.gzipKB || 0,
  cssGzip:         sum(cssChunks, 'gzipKB'),
  vendorTotalGzip: sum(vendorChunks, 'gzipKB'),
  nodesLocaleMaxGzip: Math.max(...nodesChunks.map(c => c.gzipKB), 0),
  tutorialsLocaleMaxGzip: Math.max(...tutChunks.map(c => c.gzipKB), 0),
};

// ─── 2. Previous audit diff ──────────────────────────────────────────────────
const auditDir = resolve(ROOT, 'tasks');
const prevAudits = readdirSync(auditDir)
  .filter(f => /^perf-audit-\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .reverse();
let prevMetrics = null;
if (prevAudits.length > 0) {
  try {
    const prev = readFileSync(resolve(auditDir, prevAudits[0]), 'utf8');
    const meta = prev.match(/<!-- metrics:\s*(\{.+?\})\s*-->/s);
    if (meta) prevMetrics = JSON.parse(meta[1]);
  } catch {}
}
function delta(curr, prev) {
  if (prev == null) return '—';
  const d = curr - prev;
  if (Math.abs(d) < 0.5) return 'unchanged';
  return (d > 0 ? '+' : '') + d.toFixed(1) + ' KB';
}

// ─── 3. Lazy-load opportunities (static scan) ────────────────────────────────
function scanLazyOpps() {
  const finds = [];
  const appJsx = readFileSync(resolve(ROOT, 'src/App.jsx'), 'utf8');
  const heavyImports = ['BuilderApp', 'WorkflowsModal', 'PromptLibraryModal', 'TutorialModal'];
  heavyImports.forEach(name => {
    const re = new RegExp(`^import\\s+${name}\\s+from`, 'm');
    if (re.test(appJsx) && !appJsx.includes(`lazy(() => import`) === false) {
      // Could be eager; check explicitly
      const isLazy = new RegExp(`lazy\\(\\(\\)\\s*=>\\s*import\\([^)]*${name}`).test(appJsx);
      if (!isLazy && re.test(appJsx)) {
        finds.push(`src/App.jsx — \`${name}\` imported eagerly (consider React.lazy)`);
      }
    }
  });

  // Hugeicons direct imports outside Icon.jsx
  try {
    const grep = execSync(`grep -rln "@hugeicons/" src/ --include="*.jsx" --include="*.js" | grep -v "Icon.jsx" || true`,
      { cwd: ROOT, encoding: 'utf8' });
    grep.split('\n').filter(Boolean).forEach(f => {
      finds.push(`${f} — direct @hugeicons/* import (CLAUDE.md §5 violation — use Icon.jsx)`);
    });
  } catch {}

  return finds;
}
const lazyFinds = scanLazyOpps();

// ─── 4. Render bottlenecks (light scan) ──────────────────────────────────────
function scanRenderBottlenecks() {
  const finds = [];
  try {
    const grep = execSync(`grep -rn "useEffect(() =>" src/ --include="*.jsx" --include="*.js" | grep -v "// deps:" || true`,
      { cwd: ROOT, encoding: 'utf8' });
    const lines = grep.split('\n').filter(Boolean);
    // Heuristic: useEffect without deps array is rare bug; we just count them
    finds.push(`useEffect occurrences (manual review for missing deps): ${lines.length}`);
  } catch {}
  return finds;
}
const renderFinds = scanRenderBottlenecks();

// ─── 5. Report ───────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const reportPath = resolve(auditDir, `perf-audit-${today}.md`);

const lines = [];
lines.push(`# Performance Audit — ${today}`);
lines.push('');
lines.push('<!-- metrics: ' + JSON.stringify(metrics) + ' -->');
lines.push('');
lines.push('## Bundle Status');
lines.push('');
lines.push('| Metric | Size (gzip) | Threshold (OK / Warn) | Status | Δ vs prev |');
lines.push('|--------|------------|----------------------|--------|-----------|');
function row(label, curr, t, prev) {
  return `| ${label} | ${curr.toFixed(1)} KB | ${t.ok} / ${t.warn} KB | ${status(curr, t)} | ${delta(curr, prev)} |`;
}
lines.push(row('Initial JS', metrics.initialJsGzip, THRESHOLDS.initialJsGzip, prevMetrics?.initialJsGzip));
lines.push(row('CSS total',  metrics.cssGzip,       THRESHOLDS.cssGzip,       prevMetrics?.cssGzip));
lines.push(row('Vendor total', metrics.vendorTotalGzip, THRESHOLDS.vendorTotalGzip, prevMetrics?.vendorTotalGzip));
lines.push(row('Nodes (max locale)', metrics.nodesLocaleMaxGzip, THRESHOLDS.nodesLocaleGzip, prevMetrics?.nodesLocaleMaxGzip));
lines.push(row('Tutorials (max locale)', metrics.tutorialsLocaleMaxGzip, THRESHOLDS.tutorialsGzip, prevMetrics?.tutorialsLocaleMaxGzip));
lines.push('');

lines.push('## All chunks (raw / gzip)');
lines.push('');
lines.push('| Chunk | Type | Raw KB | Gzip KB | Category |');
lines.push('|-------|------|--------|---------|----------|');
chunks.sort((a, b) => b.rawKB - a.rawKB).forEach(c => {
  lines.push(`| ${c.name} | ${c.type} | ${c.rawKB.toFixed(1)} | ${c.gzipKB.toFixed(1)} | ${c.category} |`);
});
lines.push('');

lines.push('## Top weight offenders');
lines.push('');
const top = [...chunks].sort((a, b) => b.gzipKB - a.gzipKB).slice(0, 5);
top.forEach((c, i) => {
  lines.push(`${i + 1}. **${c.name}** — ${c.gzipKB.toFixed(1)} KB gzip (${c.rawKB.toFixed(1)} KB raw) — _${c.category}_`);
});
lines.push('');

lines.push('## Lazy-load opportunities');
lines.push('');
if (lazyFinds.length === 0) lines.push('_None found._');
else lazyFinds.forEach(f => lines.push(`- ${f}`));
lines.push('');

lines.push('## Render bottlenecks (light scan)');
lines.push('');
renderFinds.forEach(f => lines.push(`- ${f}`));
lines.push('');

lines.push('## Action items');
lines.push('');
const critical = [];
const warning = [];
if (status(metrics.initialJsGzip, THRESHOLDS.initialJsGzip).includes('Critical')) critical.push('Initial JS bundle exceeds critical threshold — investigate eager imports in App.jsx');
if (status(metrics.nodesLocaleMaxGzip, THRESHOLDS.nodesLocaleGzip).includes('Critical')) critical.push('nodes-locale chunk exceeds critical — consider section-level splitting');
if (status(metrics.initialJsGzip, THRESHOLDS.initialJsGzip).includes('Warning')) warning.push('Initial JS approaching limit — schedule lazy-load review');
if (lazyFinds.length > 0) warning.push(`${lazyFinds.length} lazy-load opportunities found above`);

lines.push('🔴 Critical (block merge):');
critical.length === 0 ? lines.push('- _None._') : critical.forEach(x => lines.push(`- ${x}`));
lines.push('');
lines.push('🟡 Warning (next sprint):');
warning.length === 0 ? lines.push('- _None._') : warning.forEach(x => lines.push(`- ${x}`));
lines.push('');
lines.push('🟢 Nice-to-have:');
lines.push('- Run `npx lighthouse <vercel-url>` for runtime metrics (LCP, TBT, CLS)');
lines.push('');

lines.push('## References');
lines.push('');
lines.push(`- Previous audit: ${prevAudits[0] ? `\`tasks/${prevAudits[0]}\`` : '_none_'}`);
lines.push('- Skill: `skills/performance-auditor/SKILL.md`');
lines.push('');

writeFileSync(reportPath, lines.join('\n'), 'utf8');
console.log(`\n✓ Report written: tasks/perf-audit-${today}.md`);
console.log(`  Critical: ${critical.length} | Warning: ${warning.length} | Chunks: ${chunks.length}`);
