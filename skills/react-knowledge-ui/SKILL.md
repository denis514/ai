---
name: react-knowledge-ui
description: Работает с React/Vite слоем проекта — компоненты Mindmap, DetailPanel, Toolbar, hooks usePanZoom / useMindmapLayout, стили в App.css. Используется только если задача реально про UI; во всех контентных задачах — НЕ применяется.
type: skill
category: frontend
triggers:
  - "поправь компонент"
  - "добавь UI элемент"
  - "стиль / класс / css"
  - "перформанс рендера"
  - "мобильная версия"
inputs:
  - что именно меняется в UI
  - ссылка на файл / компонент
outputs:
  - правка в `src/components/` или `src/hooks/` или `App.css`
  - подтверждение, что layout / pan-zoom не сломан
---

# react-knowledge-ui

## Назначение
Локальный эксперт по UI-слою. Защищает текущую архитектуру от размытия:
React 18 + Vite + чистый CSS, без TS / Tailwind / state-менеджеров.

## Зона ответственности
- `src/App.jsx`, `src/main.jsx`
- `src/components/*.jsx` (Mindmap, MindmapNode, Toolbar, DetailPanel, ...)
- `src/hooks/*.js` (usePanZoom, useMindmapLayout, useTutorialProgress)
- `src/App.css`, `src/index.css`

## Что НЕ трогаем
- `src/data/*` — это домен `mindmap-expander` / `content-structurer`.
- `package.json`, `vite.config.js`, `index.html` — без отдельной задачи.

## Workflow
1. **Прочитай файл целиком** перед правкой — компоненты компактны.
2. **Минимальная правка.** Никаких рефакторингов «попутно».
3. **Mobile-first проверка.** Если меняется layout — проверь touch / pinch.
4. **Стили локально.** Новые классы — в `App.css`, не в inline-стилях.
5. **Без новых зависимостей.** Любая `npm install` требует отдельного решения.
6. **После правки** — упомяни команду `npm run build` для проверки.

## Rules
- Функциональные компоненты, hooks-first.
- Не вводить глобальный store. Состояние — локально или в существующих hooks.
- Не вводить TypeScript / styled-components / Tailwind.
- Не править данные mindmap — только UI.

## Output format
- diff / edited file
- 1-2 строки: «что проверить вручную» (например, «pinch-zoom на мобиле»).
