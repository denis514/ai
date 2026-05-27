# Performance Audit — 2026-05-27

<!-- metrics: {"initialJsRaw":348.35,"initialJsGzip":102.31,"cssGzip":30.89,"vendorTotalGzip":117.83,"nodesLocaleMaxGzip":102.02,"tutorialsLocaleMaxGzip":0} -->

## Bundle Status

| Metric | Size (gzip) | Threshold (OK / Warn) | Status | Δ vs prev |
|--------|------------|----------------------|--------|-----------|
| Initial JS | 102.3 KB | 120 / 180 KB | ✅ OK | — |
| CSS total | 30.9 KB | 25 / 40 KB | 🟡 Warning | — |
| Vendor total | 117.8 KB | 130 / 180 KB | ✅ OK | — |
| Nodes (max locale) | 102.0 KB | 130 / 180 KB | ✅ OK | — |
| Tutorials (max locale) | 0.0 KB | 100 / 150 KB | ✅ OK | — |

## All chunks (raw / gzip)

| Chunk | Type | Raw KB | Gzip KB | Category |
|-------|------|--------|---------|----------|
| index | js | 348.4 | 102.3 | initial |
| core | js | 222.2 | 86.2 | nodes-locale |
| core | js | 220.9 | 81.1 | nodes-locale |
| core | js | 219.8 | 102.0 | nodes-locale |
| vendor-supabase | js | 207.1 | 53.5 | vendor |
| BuilderApp | js | 187.4 | 58.9 | other |
| index | css | 159.6 | 24.9 | css |
| sys | js | 152.6 | 69.3 | nodes-locale |
| sys | js | 152.0 | 58.1 | nodes-locale |
| sys | js | 150.7 | 60.9 | nodes-locale |
| everyone | js | 144.1 | 52.5 | other |
| vendor-react | js | 141.8 | 45.5 | vendor |
| everyone | js | 140.3 | 48.9 | other |
| everyone | js | 138.6 | 61.2 | other |
| developers | js | 134.9 | 50.9 | other |
| developers | js | 133.0 | 48.2 | other |
| developers | js | 130.3 | 58.3 | other |
| commerce | js | 86.0 | 37.2 | nodes-locale |
| commerce | js | 85.7 | 30.4 | nodes-locale |
| commerce | js | 79.5 | 29.8 | nodes-locale |
| vendor-icons | js | 68.3 | 18.9 | vendor |
| business | js | 44.0 | 17.2 | other |
| business | js | 43.0 | 20.5 | other |
| business | js | 41.9 | 15.8 | other |
| BuilderApp | css | 38.6 | 6.0 | css |
| WorkflowsModal | js | 25.5 | 6.4 | other |
| prompt-library-BN | js | 21.4 | 8.6 | other |
| prompt-library | js | 20.8 | 10.2 | library |
| prompt-library | js | 20.7 | 8.1 | library |
| TutorialModal | js | 14.4 | 4.3 | other |
| PromptLibraryModal-DSgn | js | 7.3 | 2.5 | other |
| content-en | js | 0.8 | 0.5 | other |
| content-ru | js | 0.8 | 0.5 | other |
| content-fi | js | 0.8 | 0.5 | other |

## Top weight offenders

1. **index** — 102.3 KB gzip (348.4 KB raw) — _initial_
2. **core** — 102.0 KB gzip (219.8 KB raw) — _nodes-locale_
3. **core** — 86.2 KB gzip (222.2 KB raw) — _nodes-locale_
4. **core** — 81.1 KB gzip (220.9 KB raw) — _nodes-locale_
5. **sys** — 69.3 KB gzip (152.6 KB raw) — _nodes-locale_

## Lazy-load opportunities

_None found._

## Render bottlenecks (light scan)

- useEffect occurrences (manual review for missing deps): 96

## Action items

🔴 Critical (block merge):
- _None._

🟡 Warning (next sprint):
- _None._

🟢 Nice-to-have:
- Run `npx lighthouse <vercel-url>` for runtime metrics (LCP, TBT, CLS)

## References

- Previous audit: _none_
- Skill: `skills/performance-auditor/SKILL.md`
