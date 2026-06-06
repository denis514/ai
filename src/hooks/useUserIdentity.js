import { useCallback, useEffect, useState } from 'react';

/**
 * useUserIdentity — простая идентификация пользователя на стороне браузера.
 *
 * Браузер не отдаёт имя пользователя / профиля веб-страницам (приватность),
 * поэтому имя вводится один раз в UI и хранится в localStorage.
 *
 * Цвет аватара — детерминированный hash от имени → стабильный HSL.
 * Одно и то же имя всегда даёт один и тот же цвет.
 */

const STORAGE_KEY = 'claude-mindmap:user-identity:v1';

function load() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function save(identity) {
  if (typeof window === 'undefined') return;
  try {
    if (identity) localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Цвет аватара. Раньше генерился из имени детерминированным хэшем — поэтому
 * у разных пользователей был разный. Теперь — единый брендовый акцент Atlas
 * (#c2603f, терракота), один на всех авторизованных. Это часть бренд-системы.
 */
export function colorFromName(name) {
  if (!name) return '#94a3b8'; // slate-400 — fallback для не-залогиненных
  return '#c2603f';            // Atlas accent — единый для всех залогиненных
}

/** Первая буква имени, заглавная. Безопасно для unicode. */
export function initialFromName(name) {
  if (!name) return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  // Берём первый «графический» символ (для emoji / составных букв)
  const first = [...trimmed][0];
  return first.toUpperCase();
}

export function useUserIdentity() {
  const [identity, setIdentityState] = useState(load);

  // Sync между вкладками
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setIdentityState(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setName = useCallback((rawName) => {
    const name = (rawName || '').trim();
    if (!name) return;
    const next = { name, updatedAt: Date.now() };
    setIdentityState(next);
    save(next);
  }, []);

  const clear = useCallback(() => {
    setIdentityState(null);
    save(null);
  }, []);

  const name = identity?.name || null;
  return {
    name,
    initial: initialFromName(name),
    color: colorFromName(name),
    isSet: !!name,
    setName,
    clear
  };
}
