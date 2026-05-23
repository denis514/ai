# 105 Atlas

Карта знаний, обучение и шаблоны для Claude — экосистема в одном интерактивном приложении.
Чистый React + SVG, без сторонних библиотек для mindmap.

## Что внутри

- **11 разделов**: Основы, Projects, Artifacts, Skills, Claude Code, MCP, Custom Instructions, Промпт-инжиниринг, Сценарии, Идеи агентов, Готовые промпты.
- Для каждого узла — **что это / зачем / когда / как влияет / пример / ошибки**.
- **10 готовых промптов** в нижней панели — копируйте и адаптируйте.
- **Поиск, фильтр по категориям, подсветка совпадений**.
- **Zoom, pan, fit-to-screen, reset, expand-all, collapse-all**.
- **Pinch-zoom и touch-drag** на mobile.

## Стек

- React 18 + Vite (без TypeScript для простоты запуска)
- Чистый CSS (без CSS-in-JS)
- HTML-узлы поверх SVG-линий — оба слоя в одном transform-контейнере

## Структура

```
claude-mindmap/
├── package.json
├── vite.config.js
├── index.html
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── data/
    │   ├── mindmapData.js     # все ветки и тексты
    │   └── prompts.js         # 10 готовых промптов
    ├── hooks/
    │   ├── useMindmapLayout.js   # расчёт позиций узлов и линий
    │   └── usePanZoom.js         # pan / zoom / pinch / wheel
    └── components/
        ├── Mindmap.jsx
        ├── MindmapNode.jsx
        ├── Toolbar.jsx
        ├── DetailPanel.jsx
        ├── PromptsSection.jsx
        └── Tooltip.jsx
```

## Запуск локально

```bash
cd "Claude mindmap"
npm install
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173).

## Сборка

```bash
npm run build
npm run preview
```

## Управление

| Действие | Desktop | Mobile |
|---|---|---|
| Pan (перемещение) | drag мышью | drag одним пальцем |
| Zoom | колесо мыши, кнопки `+ −` | pinch двумя пальцами, кнопки `+ −` |
| Раскрыть / свернуть ветку | клик по `+ −` на узле | tap по `+ −` |
| Открыть детали | клик по узлу | tap по узлу |
| Поиск | поле сверху | поле сверху |
| Фильтр по категории | чипы под поиском | чипы |
| Reset / Fit | кнопки в тулбаре | кнопки в тулбаре |

## Кастомизация контента

Все тексты — в `src/data/mindmapData.js`. Структура одинаковая для всех узлов: `id`, `title`, `icon`, `category`, `details: { what, why, when, impact, example, mistakes }`, `children`. Добавляйте свои ветки и подразделы — layout пересчитается автоматически.

Готовые промпты — в `src/data/prompts.js`.

## Заметки по реализации

- **Layout**: радиальный mindmap-стиль — root в центре, 6 веток справа, 5 слева. Высота поддерева считается по числу видимых листьев.
- **Линии**: SVG-кривые Безье `M ... C ...`, толщина уменьшается по глубине.
- **Узлы**: HTML-элементы (для текста, кнопок, бейджей) поверх SVG в общем transform-контейнере — масштабируются вместе.
- **Pan / zoom**: один state `{ x, y, k }`, применяется через `transform: translate() scale()`. Зум привязан к точке курсора.
- **Поиск**: ищет по заголовкам и всем полям `details`. Совпавшие — подсвечиваются и пульсируют, остальные — тускнеют. Предки совпадений авто-раскрываются.
