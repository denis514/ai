/**
 * useVersionCheck — обнаруживает деплой новой версии.
 *
 * Стратегия: периодически запрашиваем HEAD /index.html и сравниваем
 * ETag (или Last-Modified). Vercel не кеширует index.html и меняет
 * ETag при каждом деплое — это надёжный сигнал.
 *
 * Проверка запускается:
 *   1. При монтировании (сохраняем базовый ETag)
 *   2. При возврате на вкладку (visibilitychange → visible)
 *   3. При получении фокуса (window focus)
 *   4. Каждые CHECK_INTERVAL мс пока вкладка активна
 *
 * Возвращает { hasUpdate, dismiss }
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 минут
const RELOAD_GUARD_KEY = 'atlas:last-auto-reload';

async function fetchEtag() {
  try {
    const res = await fetch('/index.html', {
      method: 'HEAD',
      cache: 'no-store',
    });
    // Используем ETag, иначе Last-Modified, иначе Content-Length как fingerprint
    return (
      res.headers.get('etag') ||
      res.headers.get('last-modified') ||
      res.headers.get('content-length') ||
      null
    );
  } catch {
    return null;
  }
}

export function useVersionCheck() {
  const baseEtag   = useRef(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(async () => {
    const etag = await fetchEtag();
    if (!etag) return; // сеть недоступна — не трогаем
    if (baseEtag.current === null) {
      baseEtag.current = etag; // первый запуск — запоминаем базу
      return;
    }
    if (etag !== baseEtag.current) {
      setHasUpdate(true);
    }
  }, []);

  // При монтировании — сохранить базовый ETag
  useEffect(() => {
    check();
  }, [check]);

  // При возврате на вкладку — проверить
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    const onFocus = () => check();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [check]);

  // Периодическая проверка каждые 5 минут
  useEffect(() => {
    const timer = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(timer);
  }, [check]);

  const dismiss = useCallback(() => setDismissed(true), []);

  const reload = useCallback(() => {
    // Защита от бесконечного цикла: не перезагружаем чаще 1 раза/10 сек
    const last = parseInt(sessionStorage.getItem(RELOAD_GUARD_KEY) || '0', 10);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
    window.location.reload();
  }, []);

  return {
    hasUpdate: hasUpdate && !dismissed,
    dismiss,
    reload,
  };
}
