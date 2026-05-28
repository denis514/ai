import React, { useMemo, useState } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import ToolboxItem from './ToolboxItem.jsx';

/**
 * NodePalette — левая палитра узлов (Фаза 2).
 *
 *  • Сетка квадратных плиток (drag на холст + клик = добавить в центр).
 *  • Поиск по названию/описанию/роли/id (в текущей локали).
 *  • Группировка по категориям; пустые группы при поиске скрываются.
 *
 * Совместимость связей берёт на себя движок connectionRules при соединении —
 * палитра отвечает только за «что можно добавить» и поиск.
 *
 * Props:
 *  • groups       — TOOLBOX_GROUPS
 *  • defs         — NODE_DEFS
 *  • onShow/onHide — управление tooltip (как у старого toolbox)
 *  • onAdd(defId) — клик по плитке: добавить узел в центр холста
 */
export default function NodePalette({ groups, defs, onShow, onHide, onAdd }) {
  const t = useT();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  // Индекс поиска: для каждого defId — строка из имени/описания/роли/id.
  const matches = useMemo(() => {
    if (!q) return null;
    const hit = new Set();
    for (const [defId, def] of Object.entries(defs)) {
      const haystack = [
        t(def.labelKey) || '',
        t(def.descKey) || '',
        def.role || '',
        def.kind || '',
        defId,
      ].join(' ').toLowerCase();
      if (haystack.includes(q)) hit.add(defId);
    }
    return hit;
  }, [q, defs, t]);

  const visibleGroups = groups
    .map(group => ({
      ...group,
      items: group.items.filter(id => defs[id] && (!matches || matches.has(id))),
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="builder-palette">
      <div className="builder-palette__search">
        <Icon name="search" size={14} strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('builder.palette.search') || 'Поиск узла…'}
          aria-label={t('builder.palette.search') || 'Поиск узла'}
        />
        {query && (
          <button
            type="button"
            className="builder-palette__clear"
            onClick={() => setQuery('')}
            aria-label={t('common.clear') || 'Очистить'}
            title={t('common.clear') || 'Очистить'}
          >
            <Icon name="close" size={12} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="builder-palette__body">
        {visibleGroups.length === 0 && (
          <div className="builder-palette__empty">
            {t('builder.palette.noResults') || 'Ничего не найдено'}
          </div>
        )}
        {visibleGroups.map(group => (
          <div key={group.id} className="builder-palette__group">
            <div className="builder-palette__group-label">
              {t(group.labelKey) || group.id}
            </div>
            <div className="builder-palette__grid">
              {group.items.map(defId => (
                <ToolboxItem
                  key={defId}
                  defId={defId}
                  def={defs[defId]}
                  onShow={onShow}
                  onHide={onHide}
                  onAdd={onAdd}
                  variant="tile"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="builder-palette__hint">
        {t('builder.palette.hint') || 'Перетащите на холст или нажмите, чтобы добавить'}
      </div>
    </div>
  );
}
