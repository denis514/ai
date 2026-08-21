import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Прогресс пользователя по узлам mindmap.
 *
 * Состояния:
 *   null       — нетронуто
 *   'viewed'   — отмечено как «просмотрено / понятно»
 *   'review'   — отмечено как «нужно вернуться»
 *
 * Хранится в localStorage под ключом 'claude-mindmap:node-progress:v1'.
 *
 * API:
 *   const { getStatus, setStatus, toggleNext, clear, counts, total } = useNodeProgress();
 *   setStatus('cc-skills', 'viewed')
 *   toggleNext('cc-skills') — циклически переключает null → viewed → review → null
 */

const STORAGE_KEY = 'claude-mindmap:node-progress:v1';

const NEXT_STATE = {
  null:    'viewed',
  viewed:  'review',
  review:  null
};

function load() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function save(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota / private mode */ }
}

export function useNodeProgress() {
  const [state, setState] = useState(load);

  // Sync между вкладками + перечитывание после слияния с облаком
  // ('storage' в своей вкладке не срабатывает, см. syncService.js).
  useEffect(() => {
    const reread = () => setState(load());
    const onStorage = (e) => { if (e.key === STORAGE_KEY) reread(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('atlas:local-hydrated', reread);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('atlas:local-hydrated', reread);
    };
  }, []);

  const getStatus = useCallback(
    (id) => state[id] || null,
    [state]
  );

  const setStatus = useCallback((id, status) => {
    setState(prev => {
      const cur = prev[id] || null;
      if (cur === status) return prev;
      const next = { ...prev };
      if (status === null || status === undefined) {
        delete next[id];
      } else {
        next[id] = status;
      }
      save(next);
      return next;
    });
  }, []);

  const toggleNext = useCallback((id) => {
    setState(prev => {
      const cur = prev[id] || null;
      const nextStatus = NEXT_STATE[String(cur)] ?? 'viewed';
      const next = { ...prev };
      if (nextStatus === null) delete next[id];
      else next[id] = nextStatus;
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setState({});
    save({});
  }, []);

  // Аггрегаты. useMemo — на counts подписан синк в облако (App.jsx); новый
  // объект на каждый рендер заставлял бы его ходить в сеть без изменений.
  const values = Object.values(state);
  const counts = useMemo(() => ({
    viewed: values.filter(v => v === 'viewed').length,
    review: values.filter(v => v === 'review').length
  }), [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = values.length;

  // Списки id по статусу — нужны для «нажми на цифру → подсветить ноды».
  const idsBy = useCallback((status) => {
    return Object.entries(state)
      .filter(([, v]) => v === status)
      .map(([id]) => id);
  }, [state]);

  return { getStatus, setStatus, toggleNext, clear, counts, total, idsBy, state };
}
