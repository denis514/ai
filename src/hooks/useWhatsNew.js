import { useState, useCallback } from 'react';
import { WHATS_NEW } from '../data/whatsNew.js';

const LS_KEY      = 'ca_seen_new';
const VISITED_KEY = 'ca_first_visited';

/**
 * Сколько дней материал считается новым.
 *
 * Раньше срока не было вообще: метка висела, пока человек не откроет материал.
 * Из-за этого июньский контент в августе всё ещё показывался как новинка тем,
 * кто до него не дошёл. Панель «Обновления» и виджет в кабинете при этом резали
 * список по своим 60 дням — три разных правила в трёх местах.
 *
 * Теперь правило одно и живёт здесь.
 */
export const WHATS_NEW_TTL_DAYS = 30;

/** Свежая ли запись: не старше срока жизни метки. */
export function isFresh(dateStr) {
  if (!dateStr) return false;
  const ts = new Date(dateStr).getTime();
  if (!Number.isFinite(ts)) return false;
  const ageDays = (Date.now() - ts) / 86400000;
  return ageDays <= WHATS_NEW_TTL_DAYS;
}

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
    if (!isFresh(entry.date)) return false;   // метка гаснет сама через срок
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
