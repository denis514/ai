# Performance Audit — 2026-06-04

<!-- metrics: {"initialJsRaw":468.7,"initialJsGzip":138.24,"cssGzip":38.42,"vendorTotalGzip":120.56,"nodesLocaleMaxGzip":105.04,"tutorialsLocaleMaxGzip":0} -->

## Bundle Status

| Metric | Size (gzip) | Threshold (OK / Warn) | Status | Δ vs prev |
|--------|------------|----------------------|--------|-----------|
| Initial JS | 138.2 KB | 120 / 180 KB | 🟡 Warning | +35.9 KB |
| CSS total | 38.4 KB | 25 / 40 KB | 🟡 Warning | +8.8 KB |
| Vendor total | 120.6 KB | 130 / 180 KB | ✅ OK | +2.7 KB |
| Nodes (max locale) | 105.0 KB | 130 / 180 KB | ✅ OK | +3.0 KB |
| Tutorials (max locale) | 0.0 KB | 100 / 150 KB | ✅ OK | unchanged |

## All chunks (raw / gzip)

| Chunk | Type | Raw KB | Gzip KB | Category |
|-------|------|--------|---------|----------|
| business | js | 664.3 | 223.7 | other |
| business | js | 644.1 | 262.9 | other |
| business | js | 642.0 | 205.4 | other |
| developers | js | 630.6 | 217.6 | other |
| developers | js | 616.3 | 202.6 | other |
| everyone | js | 616.1 | 211.0 | other |
| everyone | js | 603.4 | 197.1 | other |
| everyone | js | 590.2 | 245.5 | other |
| index | js | 468.7 | 138.2 | initial |
| BuilderApp-BZvc | js | 351.4 | 109.2 | other |
| core-BGDUqD | js | 228.4 | 88.7 | other |
| core-D | js | 227.1 | 83.5 | other |
| core | js | 225.8 | 105.0 | nodes-locale |
| vendor-supabase | js | 207.1 | 53.5 | vendor |
| index | css | 154.7 | 24.4 | css |
| sys | js | 153.8 | 69.9 | nodes-locale |
| sys | js | 153.0 | 58.5 | nodes-locale |
| sys-4lBxPu | js | 151.8 | 61.4 | other |
| vendor-react | js | 141.8 | 45.5 | vendor |
| BuilderApp | css | 101.9 | 14.0 | css |
| commerce | js | 86.0 | 37.2 | nodes-locale |
| commerce | js | 85.7 | 30.4 | nodes-locale |
| commerce | js | 79.5 | 29.8 | nodes-locale |
| vendor-icons | js | 79.3 | 21.6 | vendor |
| WorkflowsModal | js | 28.9 | 7.2 | other |
| prompt-library-BN | js | 21.4 | 8.6 | other |
| prompt-library | js | 20.8 | 10.2 | library |
| prompt-library | js | 20.7 | 8.1 | library |
| TutorialModal | js | 15.8 | 4.6 | other |
| PromptLibraryModal | js | 7.3 | 2.5 | other |
| content-en | js | 0.8 | 0.5 | other |
| content-ru | js | 0.8 | 0.5 | other |
| content-fi-DxPL-w | js | 0.8 | 0.5 | other |

## Top weight offenders

1. **business** — 262.9 KB gzip (644.1 KB raw) — _other_
2. **everyone** — 245.5 KB gzip (590.2 KB raw) — _other_
3. **business** — 223.7 KB gzip (664.3 KB raw) — _other_
4. **developers** — 217.6 KB gzip (630.6 KB raw) — _other_
5. **everyone** — 211.0 KB gzip (616.1 KB raw) — _other_

## Lazy-load opportunities

_None found._

## Render bottlenecks (light scan)

- useEffect occurrences (manual review for missing deps): 124

## Action items

🔴 Critical (block merge):
- _None._

🟡 Warning (next sprint):
- Initial JS approaching limit — schedule lazy-load review

🟢 Nice-to-have:
- Run `npx lighthouse <vercel-url>` for runtime metrics (LCP, TBT, CLS)

## References

- Previous audit: `tasks/perf-audit-2026-05-27.md`
- Skill: `skills/performance-auditor/SKILL.md`
