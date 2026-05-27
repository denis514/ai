# 05 — Risks + Do-Not-Touch List

> Что может пойти не так. Что нельзя ломать. Контрмеры.

---

## Section A — Что **нельзя** трогать в текущем Atlas

### 🚨 Critical: routing infrastructure

**Файл:** `src/hooks/useHashRoute.js`

**Правило:** только **добавляем** новый top-level type `'builder'`. Не модифицируем
существующую логику parseHash, formatHash, useHashRoute hook.

**Что делать:** в `App.jsx` добавляем `if (route?.type === 'builder')` ветку **до**
существующих routes. Не переписываем существующие.

**Если нарушим:** ломаем все Atlas deep-links (bookmarks, shared URLs, OAuth redirects).

---

### 🚨 Critical: контент данные

**Файлы:** `src/data/mindmapData.js`, `src/data/tutorials.js`, `src/data/prompts.js`,
все `src/locales/*/nodes.json`, `tutorials.json`, `prompts.json`.

**Правило:** Read-only из Builder. Никогда не модифицируем из Builder code.

**Что делать:** Builder читает Atlas data для inline education + deep-links. Сохраняет
Builder-specific data в **своём namespace** (`builder_*` таблицы Supabase,
`atlas:builder:*` localStorage keys).

**Если нарушим:** контент Atlas повреждается, sync-whats-new сломается, перевод
рассинхронится, RU/EN/FI разойдутся.

---

### 🚨 Critical: существующие компоненты

**Папка:** `src/components/*` (37 файлов)

**Правило:** не модифицируем существующие. Не reuse внутри Builder.

**Что делать:** Builder делает свои analogous components в `src/builder/components/`.
Допускается shared infra (Icon, Skeleton, Toast/Confirm containers) — они уже
глобально mounted в App.jsx.

**Если нарушим:** изменение one component для Builder ломает Atlas UI, regression risk.

---

### 🚨 Critical: Supabase existing tables

**Таблицы:** `profiles`, `bookmarks`, `tutorial_progress`, `node_progress`, etc.

**Правило:** Read-only из Builder (через `user_id`). Не добавляем columns. Не FK
из новых таблиц в эти кроме `user_id`.

**Что делать:** Builder создаёт `builder_*` namespace tables. Isolation.

**Если нарушим:** Atlas auth flow + sync sertify сломаются, GDPR delete cascade
скажется на Builder data unexpectedly.

---

### 🚨 Critical: main bundle size

**Файл:** `vite.config.js`, anything importing React Flow.

**Правило:** React Flow и Builder code загружаются через `React.lazy()`. Никогда
не imported в top-level App.jsx eagerly.

**Что делать:**
```jsx
const BuilderApp = React.lazy(() => import('./builder/BuilderApp.jsx'));
// Use в <Suspense fallback={<LoadingScreen/>}>
```

**Если нарушим:** main bundle размер растёт с 104 KB gzip до 250+ KB. Atlas first
paint deteriorates для всех пользователей (включая тех кто Builder не использует).

---

### 🚨 Critical: i18n namespace

**Файлы:** `src/locales/{ru,en,fi}/ui.json`

**Правило:** Builder UI strings live под `builder.*` namespace. Не переименовываем
существующие keys. Не модифицируем `intro.*`, `nav.*`, `courses.*`, etc.

**Что делать:** добавляем новые keys только. `builder.canvas.empty`, `builder.run.start`,
`builder.template.uxAudit.title`, etc.

**Если нарушим:** Atlas UI breaks в одной локали (or all), depending on which keys
deleted/renamed.

---

### 🚠 Important (warning, не critical): CSS

**Файлы:** `src/App.css`, `src/index.css`

**Правило:** Builder CSS живёт в `src/builder/BuilderApp.css` под `.builder-app`
parent selector. Не модифицируем глобальные CSS vars без validation.

**Что делать:**
```css
.builder-app { /* scoped styles */ }
.builder-app .agent-node { /* nested */ }
```

**Если нарушим:** global selectors leak — Atlas Mindmap node стили могут получить
Builder колоры или layout.

---

### 🚠 Important: Auth flow

**Файл:** `src/context/AuthContext.jsx`

**Правило:** Read-only из Builder. Не модифицируем authentication logic.

**Что делать:** Builder using `useAuth()` для `{ user, session }`. Не добавляем
Builder-specific auth state в context.

**Если нарушим:** Atlas users могут logout случайно, Supabase session sync ломается.

---

### 🚠 Important: Theme + Locale contexts

**Files:** `src/hooks/useTheme.js`, `src/i18n/LocaleContext.jsx`

**Правило:** Read-only. Builder использует, не модифицирует.

**Что делать:** Builder respects current theme + locale. UI strings localized
through `useT()`.

**Если нарушим:** theme toggle / language switch не работает в одной из halves
(Atlas or Builder).

---

## Section B — Технические риски Builder

### Risk B-1: React Flow performance с 50+ nodes

**Likelihood:** Low (React Flow handles 100s of nodes OK)
**Impact:** Medium (laggy UX)
**Mitigation:**
- Throttle status updates (max 10/sec)
- Use `React.memo` на custom node components
- Disable animations при executions > 20 nodes

### Risk B-2: localStorage quota (MVP)

**Likelihood:** Low (5MB stop достаточно для 5 workflows)
**Impact:** Medium (save fails)
**Mitigation:**
- Limit MVP до 5 saved workflows
- Show storage usage в settings
- Warn at 80% capacity

### Risk B-3: Bundle size growth

**Likelihood:** Medium (React Flow + Builder code ~200 KB gzip)
**Impact:** Low (lazy loaded, не affects main bundle)
**Mitigation:**
- React.lazy verify не imports eagerly
- Code splitting per Builder page
- Tree shaking React Flow imports

### Risk B-4: Auth flow conflicts

**Likelihood:** Low
**Impact:** High (users logged out unexpectedly)
**Mitigation:**
- Test sign-in / sign-out scenarios в Builder
- Test session refresh между Atlas → Builder navigation
- Use same Supabase client instance

### Risk B-5: Routing edge cases

**Likelihood:** Medium (hash routing has corner cases)
**Impact:** Medium (broken deep-links)
**Mitigation:**
- Test `#/builder`, `#/ru/builder`, `#/builder/wf/abc-123`
- Test back-button navigation
- Test refresh on deep-link

---

## Section C — Business risks

### Risk C-1: Builder steals attention from Atlas Pro launch

**Likelihood:** High
**Impact:** Medium (delays Atlas monetization)
**Mitigation:**
- Atlas Pro Phase 1 (validation interviews) и Builder MVP Week 1-2 могут идти параллельно
- Atlas Pro Phase 2 (Stripe build) и Builder Week 3-4 — параллельно
- НЕ переключаемся всеми ресурсами на Builder
- Builder MVP — 30 days, Atlas Phase 3 launch — Week 4-5. Совпадают.

**Decision:** Builder MVP идёт **параллельно** Atlas Pro Phases. Не sequential.

### Risk C-2: User confusion «two products in one»

**Likelihood:** High
**Impact:** High (negative first impression)
**Mitigation:**
- Clear branding: «Atlas / Builder» split в header
- IntroModal не упоминает Builder для new users (MVP)
- Builder только promoted to existing Atlas users initially
- В Builder header: «← Back to Atlas» link обязателен

### Risk C-3: Builder cannibalizes Atlas Pro

**Likelihood:** Medium
**Impact:** Medium (people pay Builder Pro, не Atlas Pro)
**Mitigation:**
- Phase 4: bundle Atlas Pro + Builder Free = $29/mo (more value)
- Atlas Pro alone $29/mo, Builder Pro alone $49/mo, Both $59/mo (bundled save)
- Cross-promote: Builder Pro page mentions «Atlas Pro deepens your knowledge»

### Risk C-4: Real API costs blow up при abuse

**Likelihood:** High (free users hammer API)
**Impact:** High (founder bankrupt)
**Mitigation:**
- Token limits enforced backend (not frontend trust)
- Rate limiting per IP + user
- Alerts при unusual spending
- Free tier: 10k tokens/mo hard limit (≈ $0.01-0.03 cost per user)

### Risk C-5: Security incident

**Likelihood:** Medium (any web product)
**Impact:** Critical (user trust + legal liability)
**Mitigation:**
- Encrypt API keys в Vault (never plaintext)
- Audit logs всех access
- Penetration testing рекомендуется pre-launch
- GDPR compliance: delete cascade, export

### Risk C-6: AI provider deprecates feature

**Likelihood:** High (continuous evolution)
**Impact:** Low-Medium
**Mitigation:**
- Deprecate-watch на Builder Tool definitions
- Mock mode позволяет users continue даже если provider down
- Multiple providers (Claude + OpenAI) для redundancy

---

## Section D — Strategic risks

### Risk D-1: «Just another low-code platform»

**Likelihood:** High (market crowded — n8n, Zapier, Make)
**Impact:** Medium (positioning issue)
**Mitigation:**
- Builder pitched как **education-first + Atlas integration**, не «yet another no-code»
- Atlas → Builder integration = unique differentiator
- Visual learning + execution в одной системе = not n8n's pitch

### Risk D-2: Builder requires too much expertise для Atlas users

**Likelihood:** Medium (Atlas users разные levels)
**Impact:** Medium (low conversion Atlas → Builder)
**Mitigation:**
- 4 ready-to-use templates на старте (не «build from scratch»)
- Inline education tooltips
- «Learn first» onboarding option
- Defer advanced features (custom nodes, MCP) до Phase B-3

### Risk D-3: Atlas brand dilution

**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Brand unity: «Atlas» главное, «Builder» — sub-product
- URL: `atlas.example.com/builder` not `builder.example.com`
- Visual identity shared (logo, colors, typography)

### Risk D-4: User Adoption gap

**Likelihood:** High (early-product reality)
**Impact:** Low (it's MVP, expected)
**Mitigation:**
- Don't обещать Beta features в MVP demo
- Collect feedback aggressively first 30 days
- Pivot template selection based on demand

### Risk D-5: Founder bandwidth exhaustion

**Likelihood:** High (3 simultaneous tracks: Atlas content, Atlas Pro launch, Builder)
**Impact:** Critical (burnout)
**Mitigation:**
- One contractor hire для Builder MVP (если budget allows)
- Strict prioritization: Atlas Pro launch (revenue) > Builder MVP (validation) > everything else
- Drop scope ruthlessly if needed (defer 4 templates to 2)

---

## Section E — Compliance risks

### GDPR

**Risk:** User data в Builder workflows (prompts, outputs) могут содержать PII
**Mitigation:**
- Privacy policy update: «Builder workflows may include AI-generated content»
- Cookie consent extends to Builder usage
- Delete cascade на user removal: drops workflows + executions
- Export всех Builder data via GDPR export endpoint

### Anthropic Terms of Service

**Risk:** Builder enables users делать API calls против Anthropic ToS
**Mitigation:**
- Terms of Service страница update: «Users responsible for their API key compliance»
- Block known abuse patterns (e.g., generating CSAM, sanctions evasion) в backend
- Comply с rate limits Anthropic API

### Data Processing Agreements

**Risk:** Enterprise customers требуют DPA
**Mitigation:**
- Phase B-3+ — templates DPA готов
- В Beta — refuse enterprise contracts если требуют DPA before infrastructure готова

---

## Section F — Operational risks

### Risk F-1: Supabase downtime

**Likelihood:** Low (99.9% uptime SLA)
**Impact:** High (Builder unusable если save fails)
**Mitigation:**
- Local fallback: continue работать local-only если backend down
- Status page для Builder users
- Graceful degradation: «Saving offline, will sync when back online»

### Risk F-2: Email delivery (auth + invites)

**Likelihood:** Medium
**Impact:** Medium (auth fails)
**Mitigation:**
- Resend / SendGrid с domain authentication
- Plaintext + HTML versions
- Spam compliance (CAN-SPAM, GDPR)

### Risk F-3: Stripe webhook reliability

**Likelihood:** Low (Stripe handles)
**Impact:** High (subscriptions out-of-sync)
**Mitigation:**
- Idempotency keys на webhook handlers
- Retry logic
- Daily reconciliation job: compare Stripe vs Supabase subscriptions

---

## Summary Decision Matrix

| Что | Status | Decision |
|-----|--------|----------|
| Touch routing? | 🚨 NO | Add new type only |
| Touch Atlas data files? | 🚨 NO | Read-only from Builder |
| Reuse Atlas components? | 🚨 NO | Build analogous in Builder |
| Use shared Auth? | ✅ YES | Read-only via context |
| Use shared Theme? | ✅ YES | Inherit automatically |
| Use shared Toast? | ✅ YES | Global infrastructure |
| Modify main bundle? | 🚠 BE CAREFUL | Lazy load Builder |
| Run real APIs in MVP? | 🚨 NO | Mock only |
| Persist data in MVP? | 🚨 NO | localStorage |
| Compete with n8n? | 🚠 NO | Position differently |
| Replace Atlas? | 🚨 NO | Complement Atlas |

---

_Reviewed: 2026-05-24. Re-review at each phase milestone._
