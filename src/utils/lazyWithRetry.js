import { lazy } from 'react';

/**
 * lazyWithRetry — ленивый импорт, переживающий «протухший chunk» после деплоя.
 *
 * Проблема: после нового деплоя index.html на устройстве может ссылаться на
 * старые имена chunk-файлов (с другим хешем). Динамический import() такого
 * chunk падает с 404 → <Suspense> висит пустым экраном, и пользователю
 * приходится вручную жать «обновить» (особенно заметно на мобильном).
 *
 * Решение: при первой ошибке загрузки форсим ОДИН полный reload, чтобы
 * подтянулся свежий index.html с правильными хешами. Флаг в sessionStorage
 * гарантирует, что мы не зациклимся, если сборка действительно сломана.
 *
 * @param {() => Promise<any>} factory — () => import('./X.jsx')
 * @param {string} key — стабильное имя для флага (имя компонента)
 */
export function lazyWithRetry(factory, key) {
  return lazy(async () => {
    const flag = `lazyRetry:${key}`;
    try {
      const mod = await factory();
      sessionStorage.removeItem(flag);
      return mod;
    } catch (err) {
      // Первый сбой после деплоя — один раз перезагружаем страницу.
      if (typeof window !== 'undefined' && !sessionStorage.getItem(flag)) {
        sessionStorage.setItem(flag, '1');
        window.location.reload();
        // Возвращаем «вечный» промис, пока страница перезагружается,
        // чтобы Suspense не показал ошибку до reload.
        return new Promise(() => {});
      }
      throw err;
    }
  });
}
