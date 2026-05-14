import { useState, useCallback } from 'react';
import { WHATS_NEW } from '../data/whatsNew.js';

const LS_KEY = 'ca_seen_new';

function loadSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveSeen(set) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
}

/**
 * Возвращает:
 *   isNew(id)      — показывать ли лейбл на узле
 *   markSeen(id)   — вызвать когда узел открыт → лейбл исчезнет навсегда
 *                    (до следующего обновления даты в whatsNew.js)
 *   newType(id)    — 'new' | 'updated' | null
 */
export function useWhatsNew() {
  const [seen, setSeen] = useState(loadSeen);

  const isNew = useCallback((id) => {
    const entry = WHATS_NEW[id];
    if (!entry) return false;
    return !seen.has(`${id}:${entry.date}`);
  }, [seen]);

  const newType = useCallback((id) => {
    if (!isNew(id)) return null;
    return WHATS_NEW[id]?.type ?? 'new';
  }, [isNew]);

  const markSeen = useCallback((id) => {
    const entry = WHATS_NEW[id];
    if (!entry) return;
    const key = `${id}:${entry.date}`;
    setSeen(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      saveSeen(next);
      return next;
    });
  }, []);

  return { isNew, newType, markSeen };
}
