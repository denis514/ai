import { useCallback, useEffect, useState } from 'react';

/**
 * useLevelFilter — глобальный уровень пользователя.
 *
 * Значения: 'beginner' | 'intermediate' | 'expert'
 *
 * Применяется:
 *   - на mindmap: ветки с minLevel выше текущего по умолчанию **свёрнуты**
 *     (видны заголовки, скрыты дети — мягкий режим, можно развернуть вручную)
 *   - в WorkflowsModal / PromptLibraryModal: фильтр уровня по умолчанию
 *
 * Default: 'expert' — backward compatibility, существующий пользователь
 * видит всё как раньше. Чтобы получить «новичковый» вид — нужно выбрать вручную.
 *
 * Хранится в localStorage.
 */

const STORAGE_KEY = 'claude-mindmap:user-level:v1';
const ALLOWED = new Set(['beginner', 'intermediate', 'expert']);
const DEFAULT_LEVEL = 'expert';

// Иерархия уровней для сравнения «достаточно ли уровня пользователя для X».
export const LEVEL_RANK = {
  beginner:     0,
  intermediate: 1,
  advanced:     2,   // synonym для expert на стороне контента (узлы)
  expert:       2
};

function load() {
  if (typeof window === 'undefined') return DEFAULT_LEVEL;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return ALLOWED.has(v) ? v : DEFAULT_LEVEL;
  } catch {
    return DEFAULT_LEVEL;
  }
}

function save(level) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, level);
  } catch { /* quota */ }
}

export function useLevelFilter() {
  const [level, setLevelState] = useState(load);

  // Sync между вкладками
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setLevelState(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLevel = useCallback((next) => {
    if (!ALLOWED.has(next)) return;
    setLevelState(next);
    save(next);
  }, []);

  /**
   * Достаточен ли текущий уровень пользователя, чтобы видеть контент
   * с указанным minLevel.
   * `intermediate >= beginner` ✓, `beginner >= intermediate` ✗.
   */
  const canShow = useCallback((minLevel) => {
    if (!minLevel) return true; // нет требования — всегда показываем
    const need = LEVEL_RANK[minLevel];
    const have = LEVEL_RANK[level];
    if (need == null || have == null) return true;
    return have >= need;
  }, [level]);

  return { level, setLevel, canShow };
}
