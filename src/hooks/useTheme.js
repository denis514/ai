import { useEffect, useState, useCallback } from 'react';

/**
 * useTheme — управление светлой/тёмной темой.
 *
 * Логика приоритета:
 *  1. localStorage `atlas:theme` если есть (явный выбор пользователя)
 *  2. prefers-color-scheme: dark если в системе включена тёмная
 *  3. light по умолчанию
 *
 * Применение: document.documentElement.dataset.theme = 'light' | 'dark'
 * CSS подхватывает через :root[data-theme="dark"] { ... }
 */

const STORAGE_KEY = 'atlas:theme';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  // System preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
    // Update theme-color meta для мобильных браузеров
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0f0f10' : '#f7f7f5';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // Применяем тему при изменении
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Слушаем изменение системной темы (если пользователь не сделал явный выбор)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      try {
        // Только если нет явного выбора
        if (!localStorage.getItem(STORAGE_KEY)) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {}
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const setExplicit = useCallback((t) => {
    if (t === 'dark' || t === 'light') {
      try { localStorage.setItem(STORAGE_KEY, t); } catch {}
      setTheme(t);
    }
  }, []);

  return { theme, toggle, setExplicit };
}

// Apply initial theme synchronously to avoid flash on load
applyTheme(getInitialTheme());
