# UX Interaction Rubric — 40+ пунктов

> Используется агентом `ux-interaction-tester`. Каждый пункт —
> отдельная проверка. Группируется по 6 категориям.

---

## N. Navigation (forward flow)

### N1. Triggers
- [ ] Каждый кликабельный элемент имеет визуальный affordance
      (hover, cursor:pointer, focus-ring)
- [ ] Триггеры одинакового действия выглядят одинаково везде
- [ ] Нет «invisible» click-targets без подсказки

### N2. Mouse + keyboard parity
- [ ] Tab проходит по логическому порядку
- [ ] Enter активирует кнопки и primary action
- [ ] Space активирует кнопки / checkboxes
- [ ] Cmd+K / Ctrl+K — command palette если есть

### N3. Routing
- [ ] Hash сохраняет открытое модальное окно
- [ ] Refresh страницы → восстанавливает то же состояние
- [ ] Deep-link к любой модалке работает
- [ ] Locale-prefix в hash работает корректно

---

## B. Back-flow (главный приоритет)

### B1. Базовое закрытие
- [ ] ESC закрывает текущее модальное окно
- [ ] Клик-вне-окна закрывает (где это уместно — НЕ для forms с ввoдом)
- [ ] Visible «×» кнопка в правом верхнем углу
- [ ] Visible «Назад» кнопка где есть step-by-step flow

### B2. Стек модалов
- [ ] При A→B возможен возврат в A (не сразу на root)
- [ ] При A→B→C возврат назад по стеку, не сразу в root
- [ ] При закрытии C не уносит A и B
- [ ] Breadcrumb показывает текущий уровень стека

### B3. State preservation
- [ ] Выбранный фильтр / scroll position / форма-ввод
      сохраняются при back
- [ ] Tab внутри модала запоминается при back
- [ ] При forward→back→forward — тот же state как был

### B4. Browser navigation
- [ ] Browser back-button работает (через hash-роутинг)
- [ ] Browser forward работает
- [ ] Refresh не теряет «где я был»

### B5. MinimizedPill / similar shortcuts
- [ ] При cross-link клике из модала остаётся способ вернуться
- [ ] Пилюля видна и кликабельна
- [ ] State полностью восстанавливается при разворачивании

---

## F. Focus management

### F1. Open
- [ ] При открытии модала focus уходит на первый interactive
      element внутри (close, primary action, или поле ввода)
- [ ] Aria-modal="true" на overlay

### F2. Trap
- [ ] Tab не уходит за пределы открытого модала
- [ ] Shift+Tab корректно идёт назад

### F3. Close
- [ ] При закрытии focus возвращается на trigger
- [ ] При закрытии через ESC — focus на trigger
- [ ] При закрытии через клик-вне — focus на trigger или body

### F4. Stack
- [ ] При открытии модала-поверх focus переходит в новый
- [ ] При закрытии верхнего модала focus возвращается в нижний

---

## Fb. Feedback

### Fb1. Loading
- [ ] Async-операции > 200ms показывают spinner
- [ ] Кнопки disable во время операции
- [ ] Skeleton state при ожидании контента

### Fb2. Success/Error
- [ ] После успешного действия — visible confirmation
- [ ] При ошибке — explicit error message в контексте
- [ ] Errors не пропадают сами через 1сек

### Fb3. Disabled states
- [ ] Disabled-кнопка имеет tooltip с причиной
- [ ] Disabled-form-fields не выглядят как enabled

### Fb4. Hover/active states
- [ ] Hover отличается от idle
- [ ] Active (mousedown) отличается от hover
- [ ] Disabled отличается от idle и hover

---

## D. Discoverability

### D1. Главные функции
- [ ] Search / поиск доступен из любого экрана
- [ ] Главная навигация видна (не скрыта в гамбургере на desktop)
- [ ] Профиль / settings достижимы за 1 клик

### D2. Onboarding
- [ ] Первая визита показывает intro / tour
- [ ] Empty states предлагают next action
- [ ] Tooltips для не-очевидных иконок

### D3. Hidden features
- [ ] Keyboard shortcuts задокументированы (Cmd+K hint)
- [ ] Advanced actions помечены как «Power user»
- [ ] Не-очевидные click-targets имеют hint при hover

### D4. Состояние пользователя
- [ ] Видно «я залогинен / не залогинен»
- [ ] Видно «у меня есть прогресс / нет»
- [ ] Видно «я в локали X»

---

## E. Errors & recovery

### E1. Destructive actions
- [ ] Confirmation dialog для удаления
- [ ] Confirmation dialog для сброса прогресса
- [ ] Confirmation dialog для logout (опционально)

### E2. Undo
- [ ] Случайные удаления имеют Undo (5-10 секунд)
- [ ] Snackbar/toast с undo если applicable

### E3. Network
- [ ] Offline-режим показывает уведомление
- [ ] При reconnect автоматически syncs
- [ ] Forms сохраняют ввод при network error

### E4. Form recovery
- [ ] При validation error — поля сохраняют ввод
- [ ] Errors показаны рядом с проблемным полем
- [ ] Form draft в localStorage если applicable

---

## Финальный score

| Категория | Вес | Score 0-3 |
|-----------|-----|-----------|
| N. Navigation | ×2 | 0/1/2/3 |
| B. Back-flow | ×3 | 0/1/2/3 |
| F. Focus | ×2 | 0/1/2/3 |
| Fb. Feedback | ×2 | 0/1/2/3 |
| D. Discoverability | ×1 | 0/1/2/3 |
| E. Errors | ×2 | 0/1/2/3 |

Max = 36. «Production-ready UX» если score ≥ 30 И нет P0.
