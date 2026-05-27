# technical-risk-auditor

> Skill для проверки что новая интеграция не ломает текущий Atlas.

---

## Назначение

Audit любой proposed code change против do-not-touch list и regression risks.
Specialized в Atlas codebase awareness.

**Когда вызывать:**
- Перед merging новой feature
- При предложении изменения shared infrastructure
- «Ломает ли это existing Atlas users?»
- «Что нужно протестировать?»
- При planning архитектурных decisions

---

## Context

1. **`docs/agent-builder/05-risks.md`** — Section A: do-not-touch list (read first)
2. **`docs/architecture.md`** — architectural decisions
3. **Codebase structure** (Atlas):
   - `src/App.jsx` — main routing
   - `src/components/` — 37 components (не modify)
   - `src/hooks/` — 18 hooks (read-only из Builder)
   - `src/data/` — content data (read-only из Builder)
   - `src/locales/` — i18n (только namespace extension)
   - `src/context/` — global state (read-only)
4. **Build constraints:**
   - Bundle: 104 KB gzip main + lazy chunks
   - React.lazy() для Builder
   - No new build tooling

---

## Process для audit

### Step 1 — Identify scope

Что предлагается?
- New file? — relatively safe
- Modify existing file? — risk depends on file
- Add new dependency (npm package)? — bundle/security risk
- Schema change? — data integrity risk

### Step 2 — Check against do-not-touch list

Per file:

| File pattern | Allow modify? |
|--------------|---------------|
| `src/App.jsx` | ⚠️ ONE-LINE ADD only (Builder route) |
| `src/hooks/useHashRoute.js` | 🚨 NO (only extend internally via type param) |
| `src/data/*.js` | 🚨 NO (read-only) |
| `src/locales/*/nodes.json` | 🚨 NO |
| `src/locales/*/ui.json` | ⚠️ ADD `builder.*` keys only |
| `src/components/*` | 🚨 NO |
| `src/hooks/*` | 🚨 NO (read-only) |
| `src/context/*` | 🚨 NO |
| `src/i18n/*` | 🚨 NO |
| `src/builder/*` | ✅ FULL FREEDOM (new namespace) |
| `docs/*` | ✅ ADD ONLY |
| `skills/*` | ✅ ADD ONLY |

**If proposed change touches 🚨 file:** STOP, refactor to не trogать.

### Step 3 — Bundle size impact

Run mental estimate:
- New dependency size? (npm package check on `bundlephobia.com`)
- Lazy loaded? (verify `React.lazy()` used)
- Tree-shake-able?

**Rule:** main bundle (index.js) НЕ должен расти от Builder code. Acceptable lazy chunks.

### Step 4 — Identify regression risks

Checklist:

- [ ] Routing: existing `#/`, `#/locale/node/*`, etc. всё ещё работают?
- [ ] Hash navigation: back/forward buttons?
- [ ] Locale switching: ru→en→fi во всём UI?
- [ ] Theme switching: dark↔light применяется?
- [ ] Auth: sign-in / sign-out / session refresh?
- [ ] Bookmarks: still save/load?
- [ ] Mindmap: pan/zoom не affected?
- [ ] Tutorials: progress tracking?
- [ ] Search (Cmd+K): finds everything?
- [ ] Mobile FAB: not broken?

### Step 5 — Suggest test cases

For each regression risk, formulate test:

```
Test: "Existing Atlas user opens app after Builder added"
Steps:
  1. Open http://atlas.example/ (no #)
  2. Verify: IntroModal shows (если first visit)
  3. Verify: Mindmap renders
  4. Verify: No console errors
  5. Open #/ru/node/agents
  6. Verify: DetailPanel opens correctly
  7. Open Cmd+K, search "agent"
  8. Verify: results include both Atlas and Builder items
Expected: zero behavior change for existing Atlas usage
```

### Step 6 — Security review

Если change includes:
- Backend code? → review для injection vulnerabilities
- API key handling? → encryption check
- User input? → sanitization check
- File upload? → MIME validation
- External URL fetch? → SSRF protection

### Step 7 — Dependency security audit

Если new npm package:
- `npm audit` clean?
- License compatible (MIT/Apache/BSD OK; GPL — careful)
- Maintained (last release < 12 months)
- Bundle size acceptable
- No known CVEs

### Step 8 — Rollback strategy

If change breaks production, how to revert?

- Git revert single commit (preferable)
- Feature flag toggle (для big changes)
- Database migration reversible (если schema change)
- Cache invalidation needed?

### Step 9 — Pre-merge checklist

```
- [ ] Build passes (`npm run build`)
- [ ] No console errors на load
- [ ] No console warnings (new)
- [ ] Bundle size delta acceptable
- [ ] Lighthouse score не deteriorated
- [ ] Existing tests still pass (если есть)
- [ ] Mobile screen рендерится без break
- [ ] Theme switching works
- [ ] Locale switching works
- [ ] Auth flow works
- [ ] Documentation updated
- [ ] Migration notes (если schema change)
```

---

## Risk severity matrix

| Risk type | Severity | Examples |
|-----------|----------|----------|
| 🚨 **Critical** | Blocks production / breaks existing users | Routing change, removed component, dependency conflict |
| ⚠️ **High** | Significant degradation для some users | Bundle size +20%+, new browser requirements |
| 🚠 **Medium** | Possible UX regression | New CSS conflicts, animation jank |
| 💡 **Low** | Minor inconvenience | Slight visual difference, new console log |
| ✅ **Negligible** | No real impact | Add new file, add new doc |

---

## Templates

### Template: «Audit this feature change»

```
## Feature: [name]
**Description:** [1-2 sentence]

### Files modified:
- `path/to/file.jsx` (✅/⚠️/🚨)
- ...

### Do-not-touch list violations:
- [ ] None / [list specific]

### Bundle size impact:
- Main bundle: +X KB gzip / no change / lazy loaded
- Lazy chunk: +Y KB gzip

### Regression risks:
- Routing: [analysis]
- Locale: [analysis]
- Theme: [analysis]
- Auth: [analysis]

### Tests required:
1. [test 1]
2. [test 2]

### Security review:
- User input: [yes/no/sanitized]
- API keys: [N/A or encrypted check]
- External fetches: [N/A or SSRF check]

### Dependencies:
- [new dep] @ X.Y.Z — license: MIT — bundle: Z KB — last release: [date]

### Rollback plan:
[strategy]

### Severity:
🚨 / ⚠️ / 🚠 / 💡 / ✅

### Recommendation:
APPROVE / NEEDS CHANGES / REJECT
```

---

## Что НЕ делаем в этом skill

- ❌ Не design features — это `product-strategist`
- ❌ Не write code — это implementation
- ❌ Не decide pricing — это `monetization-architect`
- ❌ Не fix bugs — это implementation

**Focus: prevention of regressions перед они happen.**

---

_Skill created: 2026-05-24._
