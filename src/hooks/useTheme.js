import { useEffect, useState, useCallback } from 'react';

/**
 * useTheme — светлая / тёмная / авто (по системе).
 *
 * mode ∈ 'auto' | 'light' | 'dark' (что выбрал пользователь):
 *  • 'auto'  — следуем системной теме компьютера/телефона (prefers-color-scheme),
 *              в реальном времени реагируем на смену системной темы. ДЕФОЛТ.
 *  • 'light' / 'dark' — явный ручной выбор, побеждает систему.
 *
 * resolved theme (что реально применяется) = mode === 'auto' ? система : mode.
 * Применение: document.documentElement.dataset.theme = 'light' | 'dark'.
 */

const MODE_KEY = 'atlas:theme-mode';   // 'auto' | 'light' | 'dark'
const LEGACY_KEY = 'atlas:theme';      // старый ключ (только 'light'|'dark')

function systemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getInitialMode() {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === 'auto' || saved === 'light' || saved === 'dark') return saved;
    // Миграция старого ключа: был явный выбор — сохраняем его как ручной режим.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === 'light' || legacy === 'dark') {
      localStorage.setItem(MODE_KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
      return legacy;
    }
  } catch { /* noop */ }
  return 'auto';   // по умолчанию — следуем системе
}

function resolveTheme(mode) {
  return mode === 'auto' ? systemTheme() : mode;
}

function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0f0f10' : '#f7f7f5';
  }
}

export function useTheme() {
  const [mode, setMode] = useState(getInitialMode);
  const [theme, setTheme] = useState(() => resolveTheme(getInitialMode()));

  // Применяем resolved-тему при изменении.
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Пересчитываем resolved-тему при смене режима.
  useEffect(() => { setTheme(resolveTheme(mode)); }, [mode]);

  // В режиме 'auto' — следим за системной темой в реальном времени.
  useEffect(() => {
    if (mode !== 'auto' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const setThemeMode = useCallback((m) => {
    if (m !== 'auto' && m !== 'light' && m !== 'dark') return;
    try { localStorage.setItem(MODE_KEY, m); } catch { /* noop */ }
    setMode(m);
  }, []);

  // Переключатель по кругу: авто → светлая → тёмная → авто.
  const cycleMode = useCallback(() => {
    setMode(prev => {
      const next = prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto';
      try { localStorage.setItem(MODE_KEY, next); } catch { /* noop */ }
      return next;
    });
  }, []);

  // Совместимость со старым API (toggle между light/dark, фиксирует ручной режим).
  const toggle = useCallback(() => {
    setMode(() => {
      const next = resolveTheme(mode) === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(MODE_KEY, next); } catch { /* noop */ }
      return next;
    });
  }, [mode]);

  return { theme, mode, toggle, cycleMode, setThemeMode, setExplicit: setThemeMode };
}

// Синхронно применяем тему до первого рендера — без мигания.
applyTheme(resolveTheme(getInitialMode()));
