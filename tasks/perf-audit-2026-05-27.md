# Performance Audit — 2026-05-27

<!-- metrics: {"initialJsRaw":392.97,"initialJsGzip":111.98,"cssGzip":30.89,"vendorTotalGzip":117.83,"nodesLocaleMaxGzip":102.02,"tutorialsLocaleMaxGzip":138.41} -->

## Bundle Status

| Metric | Size (gzip) | Threshold (OK / Warn) | Status | Δ vs prev |
|--------|------------|----------------------|--------|-----------|
| Initial JS | 112.0 KB | 120 / 180 KB | ✅ OK | — |
| CSS total | 30.9 KB | 25 / 40 KB | 🟡 Warning | — |
| Vendor total | 117.8 KB | 130 / 180 KB | ✅ OK | — |
| Nodes (max locale) | 102.0 KB | 130 / 180 KB | ✅ OK | — |
| Tutorials (max locale) | 138.4 KB | 100 / 150 KB | 🟡 Warning | — |

## All chunks (raw / gzip)

| Chunk | Type | Raw KB | Gzip KB | Category |
|-------|------|--------|---------|----------|
| index | js | 393.0 | 112.0 | initial |
| tutorials | js | 322.9 | 119.2 | tutorials-locale |
| tutorials | js | 315.1 | 111.2 | tutorials-locale |
| tutorials | js | 311.8 | 138.4 | tutorials-locale |
| core | js | 222.2 | 86.2 | nodes-locale |
| core | js | 220.9 | 81.1 | nodes-locale |
| core | js | 219.8 | 102.0 | nodes-locale |
| vendor-supabase | js | 207.1 | 53.5 | vendor |
| BuilderApp | js | 187.4 | 58.9 | other |
| index | css | 159.6 | 24.9 | css |
| sys | js | 152.6 | 69.3 | nodes-locale |
| sys | js | 152.0 | 58.1 | nodes-locale |
| sys | js | 150.7 | 60.9 | nodes-locale |
| vendor-react | js | 141.8 | 45.5 | vendor |
| commerce | js | 86.0 | 37.2 | nodes-locale |
| commerce | js | 85.7 | 30.4 | nodes-locale |
| commerce | js | 79.5 | 29.8 | nodes-locale |
| vendor-icons | js | 68.3 | 18.9 | vendor |
| BuilderApp | css | 38.6 | 6.0 | css |
| prompt-library-BN | js | 21.4 | 8.6 | other |
| prompt-library | js | 20.8 | 10.2 | library |
| prompt-library | js | 20.7 | 8.1 | library |
| content-en | js | 0.5 | 0.3 | other |
| content-ru | js | 0.5 | 0.3 | other |
| content-fi | js | 0.5 | 0.3 | other |

## Top weight offenders

1. **tutorials** — 138.4 KB gzip (311.8 KB raw) — _tutorials-locale_
2. **tutorials** — 119.2 KB gzip (322.9 KB raw) — _tutorials-locale_
3. **index** — 112.0 KB gzip (393.0 KB raw) — _initial_
4. **tutorials** — 111.2 KB gzip (315.1 KB raw) — _tutorials-locale_
5. **core** — 102.0 KB gzip (219.8 KB raw) — _nodes-locale_

## Lazy-load opportunities

- src/App.jsx — `WorkflowsModal` imported eagerly (consider React.lazy)
- src/App.jsx — `PromptLibraryModal` imported eagerly (consider React.lazy)
- src/App.jsx — `TutorialModal` imported eagerly (consider React.lazy)

## Render bottlenecks (light scan)

- useEffect occurrences (manual review for missing deps): 95

## Action items

🔴 Critical (block merge):
- _None._

🟡 Warning (next sprint):
- 3 lazy-load opportunities found above

🟢 Nice-to-have:
- Run `npx lighthouse <vercel-url>` for runtime metrics (LCP, TBT, CLS)

## References

- Previous audit: _none_
- Skill: `skills/performance-auditor/SKILL.md`
