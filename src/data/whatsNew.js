/**
 * Реестр обновлений: узлы карты и учебные материалы (туториалы).
 *
 * Поля:
 *   date — дата изменения (уникальный ключ в localStorage).
 *          При обновлении контента — меняй дату, лейбл снова появится у всех.
 *   type — 'new' | 'updated'
 *   kind — 'node' (по умолчанию) | 'tutorial'
 *          'node'     → клик открывает узел на карте
 *          'tutorial' → клик открывает туториал в CoursesModal
 *
 * Чтобы добавить запись:
 *   1. Для нового узла:     'node-id':     { date: 'YYYY-MM-DD', type: 'new' }
 *   2. Для нового курса:    'tutorial-key': { date: 'YYYY-MM-DD', type: 'new', kind: 'tutorial' }
 *   3. Деплой — обновление появится у всех пользователей.
 */
export const WHATS_NEW = {
  // ─── Новые курсы (туториалы) ────────────────────────────────────────────────
  'claude-for-business': { date: '2026-05-19', type: 'new', kind: 'tutorial' },
  'ai-fluency':          { date: '2026-05-19', type: 'new', kind: 'tutorial' },

  // ─── Узлы карты ─────────────────────────────────────────────────────────────
  'pl-api':          { date: '2026-05-17', type: 'new' },
  'pr-4d':           { date: '2026-05-17', type: 'new' },
  'pl-cowork':       { date: '2026-05-17', type: 'new' },
  'pl-integrations': { date: '2026-05-17', type: 'new' },
  'cap-limitations': { date: '2026-05-17', type: 'new' },
  'pl-web-setup':    { date: '2026-05-15', type: 'new' },
  'pl-desktop':      { date: '2026-05-15', type: 'new' },
  'cc-grp-session':      { date: '2026-05-15', type: 'new' },
  'cc-grp-context':      { date: '2026-05-15', type: 'new' },
  'cc-grp-model':        { date: '2026-05-15', type: 'new' },
  'cc-grp-ui':           { date: '2026-05-15', type: 'new' },
  'cc-grp-config':       { date: '2026-05-15', type: 'new' },
  'cc-grp-integrations': { date: '2026-05-15', type: 'new' },
  'cc-grp-automation':   { date: '2026-05-15', type: 'new' },
  'cc-grp-quality':      { date: '2026-05-15', type: 'new' },
  'cc-grp-help':         { date: '2026-05-15', type: 'new' },
  'cap-thinking': { date: '2026-05-14', type: 'new'     },
  'ag-managed':   { date: '2026-05-14', type: 'new'     },
  'b-models':     { date: '2026-05-14', type: 'updated' },
};
