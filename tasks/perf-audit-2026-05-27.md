# Performance Audit — 2026-05-27

<!-- metrics: {"initialJsRaw":391.79,"initialJsGzip":111.8,"cssGzip":30.89,"vendorTotalGzip":117.83,"nodesLocaleMaxGzip":205.54,"tutorialsLocaleMaxGzip":138.41} -->

## Bundle Status

| Metric | Size (gzip) | Threshold (OK / Warn) | Status | Δ vs prev |
|--------|------------|----------------------|--------|-----------|
| Initial JS | 111.8 KB | 120 / 180 KB | ✅ OK | — |
| CSS total | 30.9 KB | 25 / 40 KB | 🟡 Warning | — |
| Vendor total | 117.8 KB | 130 / 180 KB | ✅ OK | — |
| Nodes (max locale) | 205.5 KB | 130 / 180 KB | 🔴 Critical | — |
| Tutorials (max locale) | 138.4 KB | 100 / 150 KB | 🟡 Warning | — |

## All chunks (raw / gzip)

| Chunk | Type | Raw KB | Gzip KB | Category |
|-------|------|--------|---------|----------|
| nodes | js | 458.6 | 166.8 | nodes-locale |
| nodes | js | 458.4 | 205.5 | nodes-locale |
| nodes | js | 452.4 | 174.1 | nodes-locale |
| index | js | 391.8 | 111.8 | initial |
| tutorials | js | 322.9 | 119.2 | tutorials-locale |
| tutorials | js | 315.1 | 111.2 | tutorials-locale |
| tutorials | js | 311.8 | 138.4 | tutorials-locale |
| vendor-supabase | js | 207.1 | 53.5 | vendor |
| BuilderApp | js | 187.4 | 58.9 | other |
| index | css | 159.6 | 24.9 | css |
| vendor-react | js | 141.8 | 45.5 | vendor |
| vendor-icons | js | 68.3 | 18.9 | vendor |
| BuilderApp | css | 38.6 | 6.0 | css |
| content-fi | js | 21.5 | 8.6 | other |
| content-ru-DLpuy1 | js | 20.8 | 10.3 | other |
| content-en-BoN | js | 20.8 | 8.2 | other |

## Top weight offenders

1. **nodes** — 205.5 KB gzip (458.4 KB raw) — _nodes-locale_
2. **nodes** — 174.1 KB gzip (452.4 KB raw) — _nodes-locale_
3. **nodes** — 166.8 KB gzip (458.6 KB raw) — _nodes-locale_
4. **tutorials** — 138.4 KB gzip (311.8 KB raw) — _tutorials-locale_
5. **tutorials** — 119.2 KB gzip (322.9 KB raw) — _tutorials-locale_

## Lazy-load opportunities

- src/App.jsx — `WorkflowsModal` imported eagerly (consider React.lazy)
- src/App.jsx — `PromptLibraryModal` imported eagerly (consider React.lazy)
- src/App.jsx — `TutorialModal` imported eagerly (consider React.lazy)

## Render bottlenecks (light scan)

- useEffect occurrences (manual review for missing deps): 95

## Action items

🔴 Critical (block merge):
- nodes-locale chunk exceeds critical — consider section-level splitting

🟡 Warning (next sprint):
- 3 lazy-load opportunities found above

🟢 Nice-to-have:
- Run `npx lighthouse <vercel-url>` for runtime metrics (LCP, TBT, CLS)

## References

- Previous audit: _none_
- Skill: `skills/performance-auditor/SKILL.md`
