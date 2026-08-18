# Performance Audit — 2026-08-18

<!-- metrics: {"initialJsRaw":615.36,"initialJsGzip":185.81,"cssGzip":50.760000000000005,"vendorTotalGzip":67.11,"nodesLocaleMaxGzip":112.05,"tutorialsLocaleMaxGzip":0} -->

## Bundle Status

| Metric | Size (gzip) | Threshold (OK / Warn) | Status | Δ vs prev |
|--------|------------|----------------------|--------|-----------|
| Initial JS | 185.8 KB | 120 / 180 KB | 🔴 Critical | +47.6 KB |
| CSS total | 50.8 KB | 25 / 40 KB | 🔴 Critical | +12.3 KB |
| Vendor total | 67.1 KB | 130 / 180 KB | ✅ OK | -53.5 KB |
| Nodes (max locale) | 112.0 KB | 130 / 180 KB | ✅ OK | +7.0 KB |
| Tutorials (max locale) | 0.0 KB | 100 / 150 KB | ✅ OK | unchanged |

## All chunks (raw / gzip)

| Chunk | Type | Raw KB | Gzip KB | Category |
|-------|------|--------|---------|----------|
| everyone | js | 908.1 | 307.1 | other |
| everyone | js | 888.6 | 286.9 | other |
| everyone | js | 871.0 | 357.2 | other |
| developers | js | 739.2 | 253.4 | other |
| developers | js | 720.9 | 235.7 | other |
| developers | js | 716.5 | 295.8 | other |
| business | js | 666.5 | 223.5 | other |
| business | js | 650.0 | 264.6 | other |
| business | js | 643.6 | 205.2 | other |
| index | js | 615.4 | 185.8 | initial |
| BuilderApp-D4 | js | 380.4 | 114.8 | other |
| core | js | 244.6 | 94.5 | nodes-locale |
| core | js | 242.6 | 88.8 | nodes-locale |
| core | js | 240.6 | 112.0 | nodes-locale |
| index | css | 178.7 | 28.6 | css |
| sys | js | 154.4 | 61.7 | nodes-locale |
| sys | js | 154.4 | 70.0 | nodes-locale |
| sys | js | 153.6 | 58.5 | nodes-locale |
| BuilderApp | css | 141.9 | 19.7 | css |
| vendor-react | js | 141.8 | 45.5 | vendor |
| commerce-WKK87 | js | 87.5 | 30.7 | other |
| commerce | js | 87.3 | 37.8 | nodes-locale |
| commerce | js | 81.6 | 30.3 | nodes-locale |
| vendor-icons | js | 79.3 | 21.6 | vendor |
| WorkflowsModal | js | 28.9 | 7.2 | other |
| prompt-library-BN | js | 21.4 | 8.6 | other |
| prompt-library | js | 20.8 | 10.2 | library |
| prompt-library | js | 20.7 | 8.1 | library |
| StyleGuide | js | 17.9 | 6.3 | other |
| TutorialModal | js | 15.8 | 4.6 | other |
| StyleGuide | css | 9.0 | 2.5 | css |
| PromptLibraryModal- | js | 7.3 | 2.5 | other |
| content-en | js | 0.8 | 0.4 | other |
| content-ru | js | 0.8 | 0.4 | other |
| content-fi | js | 0.8 | 0.4 | other |
| vendor-supabase | js | 0.0 | 0.0 | vendor |

## Top weight offenders

1. **everyone** — 357.2 KB gzip (871.0 KB raw) — _other_
2. **everyone** — 307.1 KB gzip (908.1 KB raw) — _other_
3. **developers** — 295.8 KB gzip (716.5 KB raw) — _other_
4. **everyone** — 286.9 KB gzip (888.6 KB raw) — _other_
5. **business** — 264.6 KB gzip (650.0 KB raw) — _other_

## Lazy-load opportunities

_None found._

## Render bottlenecks (light scan)

- useEffect occurrences (manual review for missing deps): 132

## Action items

🔴 Critical (block merge):
- Initial JS bundle exceeds critical threshold — investigate eager imports in App.jsx

🟡 Warning (next sprint):
- _None._

🟢 Nice-to-have:
- Run `npx lighthouse <vercel-url>` for runtime metrics (LCP, TBT, CLS)

## References

- Previous audit: `tasks/perf-audit-2026-06-04.md`
- Skill: `skills/performance-auditor/SKILL.md`
