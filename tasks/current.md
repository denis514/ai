# Current Tasks

Активная работа. До 5 задач одновременно.
**Правило:** каждая задача завершается только после build ✅ + визуальной проверки ✅.

---

## 🚀 Access Strategy — Active Sprint (2026-05-17)

Новая стратегия: **Open Ecosystem with Gated Depth**.
Карта открыта для всех. Регистрация = прогресс + синхронизация. Премиум = AI-глубина.

### Phase 1 — Открыть карту, убрать пароль ✅ ЗАВЕРШЁН (2026-05-17)
| status | task | тест | дата |
|--------|------|------|------|
| ✅ done | **Убрать PasswordGate** — перевести в dev-only или удалить. MainMap открыт без пароля. ProfileFab показывает «Войти» для guest. | build ✅ · сайт открывается без пароля ✅ · Auth работает ✅ | 2026-05-17 |
| open | **Guest lock: example field** — в Node Detail panel поле `example` для guest = blur + иконка замка + CTA «Войди, чтобы видеть примеры». Для logged-in — как сейчас. | build ✅ · guest видит blur ✅ · logged-in видит пример ✅ | 2026-05-17 |
| open | **Tutorial gate: шаги 2+** — для guest при открытии шага 2+ показывать registration overlay поверх контента шага. CTA «Бесплатный аккаунт — полный доступ». | build ✅ · guest видит overlay на шаге 2 ✅ · logged-in проходит все шаги ✅ | 2026-05-17 |
| open | **Prompt Library gate: лимит 15** — для guest открыты первые 15 промптов, остальные размыты с счётчиком и CTA. | build ✅ · guest видит 15 + blur на остальных ✅ | 2026-05-17 |

### Phase 2 — Guest vs Registered UX ✅ ЗАВЕРШЁН (2026-05-17)
| status | task | тест | дата |
|--------|------|------|------|
| ✅ done | **Welcome онбординг** — экран выбора уровня после первого логина. isNewUser флаг в AuthContext, WelcomeOnboarding.jsx с 3 уровнями и анимацией | build ✅ · 157 modules ✅ · onboarding в бандле ✅ | 2026-05-17 |
| ✅ done | **LocalStorage → Supabase sync** — syncService.js мигрирует tutorials/nodes/bookmarks при первом входе. Идемпотентен (markSyncDone). | build ✅ · syncService в бандле ✅ | 2026-05-17 |
| ✅ done | **SEO meta tags** — index.html: title, description, keywords, OG, Twitter Card, canonical. lang=en | SEO meta ✅ · canonical ✅ | 2026-05-17 |

### Phase 3 — Retention
| status | task | тест | дата |
|--------|------|------|------|
| ✅ done | **Account page** — профиль, email, имя, язык, GDPR-экспорт, удаление аккаунта (EN/RU/FI) | build ✅ · 158 modules · i18n ✅ | 2026-05-17 |
| open | Улучшенный Profile: streak, достижения на базе Supabase | — | — |
| open | Progress sync across devices: читать прогресс из Supabase | — | — |

### Phase 4 — Premium foundation (будущее)
| status | task | дата |
|--------|------|------|
| open | Pricing page / premium CTA | — |
| open | Stripe / Lemon Squeezy интеграция | — |
| open | Personal Scenarios для premium | — |

---

## Остальные открытые задачи

| status | task | skill | дата |
|--------|------|-------|------|
| open | **i18n Phase 5** — перевести узлы/туториалы/промпты/paths RU→EN и RU→FI | `translate-to-finnish` | 2026-05-17 |
| open | **Аудит устаревших узлов** — `cap-computer`, `b-knowledge`, `pl-platforms` | `content-gap-auditor` | 2026-05-17 |
| open | **Audience tracks в CoursesModal** — фильтр For Everyone / Business / Developers | `react-knowledge-ui` | 2026-05-17 |
| open | **Learning Paths: For Business + For Educators** | `ai-pedagogy-architect` | 2026-05-17 |

---

## Сделано ✅
- Password gate (SHA-256) + Mastercard spinner
- Cookie consent + GA4
- Atlas rebrand
- What's New badge system + archive modal
- Узлы: pl-web-setup, pl-desktop, pl-cowork, pl-integrations, cap-limitations, pr-4d, pl-api, 9× cc-grp-*
- Tutorial routing bug fix
- Tutorials: claude-setup, claude-cowork, ai-limitations, api-basics (EN/RU/FI)
- i18n Phase 1–4 + 18 EN tutorials переведены
- Supabase Auth Phase 1: Magic Link + GDPR + profiles + RLS
- Privacy Policy EN/RU/FI
- vercel.json routing fix

## Правила работы
- Каждая задача: build ✅ → preview/test ✅ → commit → push
- Обновлять этот файл после каждого завершения
- Не начинать следующую задачу без теста предыдущей
