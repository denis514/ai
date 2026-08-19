import { useCallback, useEffect, useState } from 'react';

/**
 * Bookmarks — единый хук для «звёздочек» на узлах и шаблонах.
 *
 * Ключ — составной, чтобы не путать id узла mindmap и id шаблона:
 *   'node:cc-skills', 'prompt:start-role-task', 'tutorial:basics'
 *
 * Хранится в localStorage под ключом 'claude-mindmap:bookmarks:v1'.
 * API:
 *   const { bookmarks, isBookmarked, toggle, add, remove, clear, count } = useBookmarks();
 *   isBookmarked('node', 'cc-skills') → boolean
 *   toggle('node', 'cc-skills')
 *   bookmarks — Map<key, { type, id, addedAt }>
 */

const STORAGE_KEY = 'claude-mindmap:bookmarks:v1';

function makeKey(type, id) {
  return `${type}:${id}`;
}

function loadFromStorage() {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Map();
    const map = new Map();
    for (const entry of arr) {
      if (entry && entry.type && entry.id) {
        map.set(makeKey(entry.type, entry.id), entry);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

function saveToStorage(map) {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(map.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(loadFromStorage);

  // Синхронизация между вкладками + перечитывание после слияния с облаком
  // ('storage' в своей вкладке не срабатывает, см. syncService.js).
  useEffect(() => {
    const reread = () => setBookmarks(loadFromStorage());
    const onStorage = (e) => { if (e.key === STORAGE_KEY) reread(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('atlas:local-hydrated', reread);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('atlas:local-hydrated', reread);
    };
  }, []);

  const isBookmarked = useCallback(
    (type, id) => bookmarks.has(makeKey(type, id)),
    [bookmarks]
  );

  const add = useCallback((type, id) => {
    setBookmarks(prev => {
      const k = makeKey(type, id);
      if (prev.has(k)) return prev;
      const next = new Map(prev);
      next.set(k, { type, id, addedAt: Date.now() });
      saveToStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((type, id) => {
    setBookmarks(prev => {
      const k = makeKey(type, id);
      if (!prev.has(k)) return prev;
      const next = new Map(prev);
      next.delete(k);
      saveToStorage(next);
      return next;
    });
  }, []);

  const toggle = useCallback((type, id) => {
    setBookmarks(prev => {
      const k = makeKey(type, id);
      const next = new Map(prev);
      if (next.has(k)) next.delete(k);
      else next.set(k, { type, id, addedAt: Date.now() });
      saveToStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setBookmarks(new Map());
    saveToStorage(new Map());
  }, []);

  return {
    bookmarks,
    isBookmarked,
    toggle,
    add,
    remove,
    clear,
    count: bookmarks.size
  };
}
