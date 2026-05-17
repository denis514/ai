/**
 * Реестр новых и обновлённых узлов.
 * Ключ: id узла.
 * date: дата изменения — используется как уникальный ключ в localStorage.
 *       Когда меняешь контент узла — обнови дату, и лейбл снова появится у всех.
 * type: 'new' | 'updated'
 *
 * Чтобы добавить новый узел или отметить обновление:
 *   1. Добавь/обнови запись ниже с текущей датой.
 *   2. Деплой — лейбл появится у всех пользователей.
 */
export const WHATS_NEW = {
  'pl-api':          { date: '2026-05-17', type: 'new' },
  'pr-4d':           { date: '2026-05-17', type: 'new' },
  'pl-cowork':       { date: '2026-05-17', type: 'new' }, // also has tutorial now
  'pl-cowork':       { date: '2026-05-17', type: 'new' },
  'pl-integrations': { date: '2026-05-17', type: 'new' },
  'cap-limitations': { date: '2026-05-17', type: 'new' },
  'pl-web-setup': { date: '2026-05-15', type: 'new' },
  'pl-desktop':   { date: '2026-05-15', type: 'new' },
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
