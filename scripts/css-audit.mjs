#!/usr/bin/env node
/**
 * CSS audit — finds CSS classes in src/App.css that aren't referenced
 * anywhere in src/**.{jsx,js,html}. Conservative — flags only static
 * usage; dynamic class names (template literals) won't be matched.
 *
 * Output: tasks/css-audit-<date>.md with categorized findings.
 *
 * Usage:  node scripts/css-audit.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// 1. Extract class names from CSS files
const cssFiles = ['src/App.css', 'src/index.css', 'src/builder/BuilderApp.css'];
const cssClasses = new Set();
for (const f of cssFiles) {
  try {
    const txt = readFileSync(resolve(ROOT, f), 'utf8');
    const matches = txt.match(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g) || [];
    matches.forEach(m => cssClasses.add(m.slice(1))); // strip leading dot
  } catch {}
}

// 2. Collect all source files (jsx, js, html, except dist + node_modules)
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
      out.push(...walk(p));
    } else {
      const ext = extname(name);
      if (['.jsx', '.js', '.html', '.css'].includes(ext)) out.push(p);
    }
  }
  return out;
}
const sourceFiles = walk(resolve(ROOT, 'src')).concat([resolve(ROOT, 'index.html')]);

// 3. Build single concatenated source blob (for fast regex testing)
const allSource = sourceFiles.map(f => readFileSync(f, 'utf8')).join('\n');

// 4. For each class, check references
const used = new Set();
const unused = new Set();

// Build a JS-source-only blob (exclude CSS to avoid matching selector definitions).
const jsSource = sourceFiles
  .filter(f => /\.(jsx|js|html)$/.test(f))
  .map(f => readFileSync(f, 'utf8'))
  .join('\n');

for (const cls of cssClasses) {
  // CSS class name regex: [A-Za-z0-9_-]+
  // A class is REFERENCED in JS if it appears surrounded by chars NOT in that set.
  // Covers: "cls", 'cls', `cls`, ` cls`, `${...}cls`, `cls${...}` (template literals).
  const re = new RegExp(`(^|[^A-Za-z0-9_-])${escape(cls)}([^A-Za-z0-9_-]|$)`);
  if (re.test(jsSource)) {
    used.add(cls);
  } else {
    unused.add(cls);
  }
}
function escape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// 5. Categorize unused by prefix (likely component bucket)
const buckets = {};
for (const cls of unused) {
  const prefix = cls.split(/[-_]/)[0];
  (buckets[prefix] ??= []).push(cls);
}
const sortedBuckets = Object.entries(buckets).sort((a, b) => b[1].length - a[1].length);

// 6. Build report
const today = new Date().toISOString().slice(0, 10);
const reportPath = resolve(ROOT, `tasks/css-audit-${today}.md`);

const lines = [];
lines.push(`# CSS Audit — ${today}`);
lines.push('');
lines.push('## Summary');
lines.push(`- CSS classes total: **${cssClasses.size}**`);
lines.push(`- Used (matched in src/): **${used.size}**`);
lines.push(`- **Unused candidates: ${unused.size}** (≈${((unused.size/cssClasses.size)*100).toFixed(0)}%)`);
lines.push('');
lines.push('> ⚠️ False positives possible: dynamic class names (`className={\\`prefix-${variant}\\`}`) won\'t match. Manual verification required before deletion.');
lines.push('');

lines.push('## Top 20 unused by bucket (prefix-grouped)');
lines.push('');
lines.push('| Bucket | Count | Sample classes |');
lines.push('|--------|-------|----------------|');
for (const [bucket, classes] of sortedBuckets.slice(0, 20)) {
  const sample = classes.slice(0, 4).map(c => `\`${c}\``).join(', ');
  const more = classes.length > 4 ? ` _(+${classes.length - 4} more)_` : '';
  lines.push(`| \`${bucket}\` | ${classes.length} | ${sample}${more} |`);
}
lines.push('');

lines.push('## Full list of unused candidates');
lines.push('');
lines.push('<details><summary>Click to expand</summary>');
lines.push('');
lines.push('```');
for (const [bucket, classes] of sortedBuckets) {
  lines.push(`# ${bucket} (${classes.length})`);
  classes.forEach(c => lines.push(c));
  lines.push('');
}
lines.push('```');
lines.push('');
lines.push('</details>');
lines.push('');

lines.push('## Recommended action');
lines.push('');
if (unused.size > 100) {
  lines.push(`🔴 **High noise level.** Audit by bucket — start with top-5 prefixes.`);
} else if (unused.size > 30) {
  lines.push(`🟡 **Moderate cleanup opportunity.** Each bucket worth checking.`);
} else {
  lines.push(`🟢 **Low noise — CSS is reasonably clean.**`);
}
lines.push('');
lines.push('### How to verify a class is truly unused:');
lines.push('```bash');
lines.push('# Static usage check (most cases):');
lines.push('grep -rn "<class-name>" src/ --include="*.jsx" --include="*.js"');
lines.push('');
lines.push('# Dynamic template-literal check (look for prefix):');
lines.push('grep -rn "<prefix>-" src/ --include="*.jsx"');
lines.push('```');
lines.push('');

lines.push('## References');
lines.push('- App.css size: 9037 lines, ~30 KB gzip');
lines.push(`- Skill: \`skills/performance-auditor/SKILL.md\` (related — perf-audit flagged CSS warning)`);

writeFileSync(reportPath, lines.join('\n'), 'utf8');
console.log(`✓ Report: tasks/css-audit-${today}.md`);
console.log(`  Total classes: ${cssClasses.size}`);
console.log(`  Used: ${used.size}`);
console.log(`  Unused candidates: ${unused.size}`);
console.log(`  Top buckets: ${sortedBuckets.slice(0, 5).map(([b, c]) => `${b}(${c.length})`).join(', ')}`);
