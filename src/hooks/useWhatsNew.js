import { useState, useCallback } from 'react';
import { WHATS_NEW } from '../data/whatsNew.js';

const LS_KEY      = 'ca_seen_new';
const VISITED_KEY = 'ca_first_visited';

function saveSeen(set) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...set])); } catch {}
}

/**
 * При самом первом визите (VISITED_KEY ещё не существует) —
 * «засеваем» все текущие записи как уже просмотренные.
 *
 * Логика:
 *   • Новый пользователь → видит чистую карту без значков.
 *     Badges появятся только для контента, опубликованного ПОСЛЕ его первого визита.
 *   • Вернувшийся пользователь (VISITED_KEY уже есть) → поведение прежнее:
 *     видит только то, что ещё не открывал через markSeen.
 */
function initFirstVisit() {
  try {
    if (localStorage.getItem(VISITED_KEY) !== null) return;
    localStorage.setItem(VISITED_KEY, new Date().toISOString().slice(0, 10));
    const allKeys = Object.entries(WHATS_NEW)
      .map(([id, entry]) => `${id}:${entry.date}`);
    saveSeen(new Set(allKeys));
  } catch {}
}

// Инициализируем при загрузке модуля (до рендера)
initFirstVisit();

function loadSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  } catch {
    return new Set();
  }
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

  // Множество id узлов, которые сейчас помечены как новые/обновлённые
  const newIds = Object.keys(WHATS_NEW).filter(id => isNew(id));

  return { isNew, newType, markSeen, newIds };
}
