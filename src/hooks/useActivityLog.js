import { useCallback, useEffect, useState } from 'react';

/**
 * useActivityLog — отслеживает «дни использования» Atlas.
 *
 * При каждой загрузке приложения записывает сегодняшнюю дату (YYYY-MM-DD)
 * в Set дней использования. На основе этого вычисляется streak —
 * число последовательных дней, заканчивающихся сегодня.
 *
 * Хранение: localStorage `claude-mindmap:activity-log:v1` = JSON array of dates.
 */

const STORAGE_KEY = 'claude-mindmap:activity-log:v1';
const MAX_DAYS_KEPT = 365; // не храним больше года

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function load() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(dates) {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = dates.slice(-MAX_DAYS_KEPT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* quota */ }
}

function computeStreak(sortedDates) {
  if (!sortedDates.length) return 0;
  const today = todayKey();
  if (!sortedDates.includes(today)) return 0;

  let streak = 0;
  let cursor = new Date(today);
  while (true) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    if (sortedDates.includes(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function useActivityLog() {
  const [dates, setDates] = useState(load);

  // На mount записываем сегодня (если ещё нет)
  useEffect(() => {
    setDates((prev) => {
      const today = todayKey();
      if (prev.includes(today)) return prev;
      const next = [...prev, today].sort();
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setDates([]);
    save([]);
  }, []);

  const streak = computeStreak(dates);
  const totalDays = dates.length;

  return { dates, streak, totalDays, clear };
}
