/**
 * clean-text-lint — следит, чтобы UI-тексты были «человеческими», без машинных
 * символов. См. docs/plain-language-ui.md.
 *
 * Проверяет строковые значения в поддереве `builder.*` файлов
 * src/locales/{ru,en,fi}/ui.json:
 *   • Стрелки → ← ↔ ⇒ ⟶ — ОШИБКА (в прозе их быть не должно).
 *   • Тире — / – — предупреждение со счётчиком (стремимся к нулю в UI).
 *
 * Запуск: node scripts/clean-text-lint.mjs  (npm run lint:text)
 * Выход 1, если найдены стрелки (чтобы можно было встроить в проверки).
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['ru', 'en', 'fi'];
const ARROWS = /[→←↔⇒⟶⟵]/;
const DASH = /[—–]/g;

let arrowHits = 0;
let dashCount = 0;

function walk(node, path, onString) {
  if (typeof node === 'string') { onString(node, path); return; }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) walk(node[k], path ? `${path}.${k}` : k, onString);
  }
}

for (const loc of LOCALES) {
  const file = join(ROOT, `src/locales/${loc}/ui.json`);
  let json;
  try { json = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  const builder = json.builder;
  if (!builder) continue;

  walk(builder, 'builder', (str, path) => {
    if (ARROWS.test(str)) {
      arrowHits++;
      console.log(`  [ARROW] ${loc} ${path}: ${str.slice(0, 80)}`);
    }
    const d = (str.match(DASH) || []).length;
    if (d) dashCount += d;
  });
}

console.log('');
if (arrowHits === 0) console.log('✓ lint:text — стрелок в builder.* нет.');
else console.log(`✗ lint:text — стрелок в builder.*: ${arrowHits}. Перепиши словами (см. docs/plain-language-ui.md).`);
console.log(`  тире «—/–» в builder.*: ${dashCount} (стремимся к 0 в UI-текстах).`);

process.exit(arrowHits > 0 ? 1 : 0);
