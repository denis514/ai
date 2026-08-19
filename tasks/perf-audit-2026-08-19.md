# Performance Audit — 2026-08-19

<!-- metrics: {"initialJsRaw":563.33,"initialJsGzip":179.15,"cssEntryGzip":28.6,"cssGzip":50.77,"vendorTotalGzip":67.11,"nodesLocaleMaxGzip":112.05,"tutorialsLocaleMaxGzip":0} -->

## Bundle Status

| Metric | Size (gzip) | Threshold (OK / Warn) | Status | Δ vs prev |
|--------|------------|----------------------|--------|-----------|
| Initial JS | 179.2 KB | 120 / 180 KB | 🟡 Warning | -1.5 KB |
| CSS первой загрузки | 28.6 KB | 25 / 40 KB | 🟡 Warning | unchanged |
| CSS всего (с ленивыми) | 50.8 KB | справочно | — | unchanged |
| Vendor total | 67.1 KB | 130 / 180 KB | ✅ OK | unchanged |
| Nodes (max locale) | 112.0 KB | 130 / 180 KB | ✅ OK | unchanged |
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
| index | js | 563.3 | 179.2 | initial |
| BuilderApp | js | 389.8 | 116.9 | other |
| core | js | 244.6 | 94.5 | nodes-locale |
| core | js | 242.6 | 88.8 | nodes-locale |
| core | js | 240.6 | 112.0 | nodes-locale |
| index-XsjH7k | css | 178.7 | 28.6 | css |
| sys | js | 154.4 | 61.7 | nodes-locale |
| sys | js | 154.4 | 70.0 | nodes-locale |
| sys | js | 153.6 | 58.5 | nodes-locale |
| BuilderApp | css | 142.0 | 19.7 | css |
| vendor-react | js | 141.8 | 45.5 | vendor |
| commerce-WKK87 | js | 87.5 | 30.7 | other |
| commerce | js | 87.3 | 37.8 | nodes-locale |
| commerce | js | 81.6 | 30.3 | nodes-locale |
| vendor-icons | js | 79.3 | 21.6 | vendor |
| titles-CxfNI | js | 46.0 | 15.2 | other |
| titles | js | 44.1 | 13.8 | other |
| titles | js | 43.7 | 17.4 | other |
| WorkflowsModal | js | 29.2 | 7.3 | other |
| AccountPage | js | 25.2 | 5.9 | other |
| prompt-library-BN | js | 21.4 | 8.6 | other |
| prompt-library | js | 20.8 | 10.2 | library |
| prompt-library | js | 20.7 | 8.1 | library |
| StyleGuide | js | 18.1 | 6.4 | other |
| TutorialModal | js | 16.2 | 4.7 | other |
| ProfilePanel | js | 12.2 | 3.6 | other |
| scheduleService | js | 11.3 | 3.3 | other |
| StyleGuide | css | 9.0 | 2.5 | css |
| PromptLibraryModal | js | 7.3 | 2.5 | other |
| AuthModal | js | 5.9 | 2.3 | other |
| CommandPalette | js | 5.2 | 2.1 | other |
| HelpModal | js | 3.2 | 1.2 | other |
| content-en | js | 1.0 | 0.5 | other |
| content-ru-B | js | 1.0 | 0.5 | other |
| content-fi | js | 1.0 | 0.5 | other |
| Skeleton | js | 0.9 | 0.5 | other |
| useSupabaseStats | js | 0.4 | 0.3 | other |
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

- useEffect occurrences (manual review for missing deps): 133

## Action items

🔴 Critical (block merge):
- _None._

🟡 Warning (next sprint):
- Initial JS approaching limit — schedule lazy-load review

🟢 Nice-to-have:
- Run `npx lighthouse <vercel-url>` for runtime metrics (LCP, TBT, CLS)

## References

- Previous audit: `tasks/perf-audit-2026-08-19.md`
- Skill: `skills/performance-auditor/SKILL.md`
