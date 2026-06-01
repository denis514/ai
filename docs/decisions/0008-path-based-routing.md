# ADR-0008 — Переход с hash-routing на path-routing (SEO)

Дата: 2026-06-01. Статус: принято, в реализации.

## Контекст
Маршрутизация была на хеше: `#/<lang>/<type>/<id>`. Для Google всё после `#`
не индексируется — весь сайт = одна страница `https://105-atlas.vercel.app/`.
200+ узлов, туториалы, 3 локали и Builder невидимы в поиске. SEO-аудит назвал
это главной проблемой.

## Решение
Перейти на **History API path-routing**: `/<lang>/<type>/<id>`
(например `/ru/node/cap-tools`, `/en/tutorial/ai-fluency`, `/ru/builder`).
Сервер уже готов: `vercel.json` SPA-rewrite отдаёт `index.html` на любой путь.

## Ключевые решения
1. **Имя файла/экспортов сохраняем** (`useHashRoute`, `parseHash`) — чтобы не
   трогать импорты в App.jsx и др. Меняется только реализация (pathname вместо hash).
2. **Обратная совместимость:** старые ссылки `#/<lang>/<type>/<id>` при загрузке
   автоматически переписываются (`replaceState`) на новый путь. Существующие
   расшаренные ссылки не ломаются.
3. **OAuth:** Supabase кладёт токен во фрагмент `#access_token=…` (НЕ `#/...`).
   Раз наш роутер читает pathname, хеш свободен для Supabase — конфликт уходит.
   `authService` хранит/восстанавливает маршрут из `pathname`, не из hash.
4. **Локаль** читается/пишется в первый сегмент пути (LocaleContext).
5. **Внутренняя синхронизация:** вместо `dispatchEvent(HashChangeEvent)` —
   кастомное событие `atlas:routechange` + `popstate`.
6. **vercel.json:** в negative-lookahead добавить `robots.txt|sitemap.xml`,
   чтобы они отдавались как файлы, а не index.html.
7. **Бонус-SEO:** динамический `document.title` + meta description по
   маршруту/локали (отдельный маленький хук).

## Затронутые файлы
`src/hooks/useHashRoute.js` (ядро), `src/i18n/LocaleContext.jsx`,
`src/services/authService.js`, `src/App.jsx`, `src/components/ErrorBoundary.jsx`,
`src/components/AccountPage.jsx`, `src/builder/BuilderApp.jsx`,
`src/builder/components/education/AtlasNodePreview.jsx`, `src/i18n/useTutorial.js`,
`vercel.json`, `index.html` (динамические мета — через хук).

## Риски и митигейшн
- OAuth-редирект — тестировать вход Google/magic-link.
- Deep-link на узел напрямую — тестировать (Vercel rewrite уже есть).
- Старые `#/` ссылки — авто-миграция при загрузке.
- Откат: вернуть прежний useHashRoute (в git).
