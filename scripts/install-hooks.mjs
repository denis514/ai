#!/usr/bin/env node
/**
 * Install git pre-commit hook (no husky dependency).
 *
 * Hook runs `npm run lint:all` only when staged files touch content
 * (locales/, mindmapData.js, tutorials.js, prompts.js, promptLibrary.js).
 *
 * Run once after clone:  node scripts/install-hooks.mjs
 * Skip with:             git commit --no-verify  (NOT for normal use)
 */

import { writeFileSync, chmodSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Find .git/hooks (respects worktrees and submodules).
let hooksDir;
try {
  hooksDir = execSync('git rev-parse --git-path hooks', { cwd: ROOT, encoding: 'utf8' }).trim();
  if (!hooksDir.startsWith('/')) hooksDir = resolve(ROOT, hooksDir);
} catch {
  console.error('✗ not a git repo, aborting');
  process.exit(1);
}

const hookPath = resolve(hooksDir, 'pre-commit');

const hookBody = `#!/usr/bin/env sh
# 105 Atlas pre-commit — auto-installed by scripts/install-hooks.mjs
# Bypass (rare): git commit --no-verify

# Only run lint when content files changed.
staged=$(git diff --cached --name-only --diff-filter=ACMR)
if echo "$staged" | grep -qE '^(src/locales/|src/data/(mindmapData|tutorials|prompts|promptLibrary|learningPaths)\\.js)'; then
  echo "→ pre-commit: linting content (staged changes touched data layer)…"
  npm run --silent lint:all || {
    echo ""
    echo "✗ Lint failed. Fix above issues, then re-stage and commit."
    echo "  (Override with: git commit --no-verify — NOT recommended.)"
    exit 1
  }
fi

exit 0
`;

if (existsSync(hookPath)) {
  const existing = readFileSync(hookPath, 'utf8');
  if (existing === hookBody) {
    console.log(`· pre-commit hook already up-to-date at ${hookPath}`);
    process.exit(0);
  }
  console.log(`! overwriting existing pre-commit at ${hookPath}`);
}

writeFileSync(hookPath, hookBody, 'utf8');
chmodSync(hookPath, 0o755);
console.log(`✓ pre-commit hook installed: ${hookPath}`);
console.log(`  triggers on staged changes in src/locales/ or src/data/{mindmapData,tutorials,prompts,promptLibrary,learningPaths}.js`);
