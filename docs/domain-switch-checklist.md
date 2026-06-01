# Чек-лист смены домена (SEO)

> Когда подключаешь свой домен вместо `105-atlas.vercel.app`.
> Динамические теги (canonical / og:url / hreflang на страницах) **подстроятся
> сами** — они берут домен из адреса страницы (`useDocumentMeta.js`). Менять
> нужно только статические файлы ниже.

## 1. Поменять адрес в 3 статических местах
Замени `https://105-atlas.vercel.app` на новый домен в:
- `index.html` — `<link rel="canonical">` и `og:url` (и `og:image`, когда добавишь картинку).
- `public/sitemap.xml` — все `<loc>`.
- `public/robots.txt` — строка `Sitemap:`.

(Быстрый поиск: `grep -rn "105-atlas.vercel.app" index.html public/`.)

## 2. Настроить домен на Vercel
Project → Settings → Domains → добавить домен, привязать DNS.

## 3. 301-редирект со старого адреса
Чтобы «вес» страниц перешёл на новый домен. На Vercel: оставить старый
`*.vercel.app` и настроить redirect, либо домен-алиас с永 редиректом на основной.

## 4. Google Search Console
- Подтвердить новый домен.
- Если старый уже индексировался — инструмент **«Change of address»** (смена адреса).
- Подать `sitemap.xml` нового домена.

## 5. Обновить ссылки в проде
- Email/OAuth redirect в Supabase (Auth → URL Configuration) — добавить новый домен в Allowed Redirect URLs.

---
_Динамическая часть (canonical/og/hreflang на каждой странице) изменений не
требует — `useDocumentMeta.js` использует `window.location.origin`._
