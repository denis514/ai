/**
 * oauthPopup.js — вход через OAuth (Google) во ВСПЛЫВАЮЩЕМ окне поверх Atlas,
 * без полной перезагрузки основной страницы.
 *
 * Как это работает:
 *  1. Основное окно открывает попап и ведёт его на URL Google OAuth.
 *  2. Google после входа редиректит попап обратно на наш origin с
 *     `?atlas_oauth_popup=1`. Supabase (detectSessionInUrl) кладёт сессию в
 *     localStorage. Сессия в localStorage синхронизируется между окнами одного
 *     origin → основное окно ловит SIGNED_IN через onAuthStateChange.
 *  3. Попап сообщает основному окну (postMessage) и закрывается сам.
 *
 * Запасной путь: если попап заблокирован — обычный полноэкранный редирект.
 */

const POPUP_FLAG = 'atlas_oauth_popup';
export const OAUTH_DONE_MESSAGE = 'atlas:oauth-done';

/** Мы сейчас внутри попап-окна, которое вернулось с OAuth-редиректа? */
export function isOAuthPopup() {
  try {
    return (
      typeof window !== 'undefined' &&
      window.opener &&
      window.opener !== window &&
      new URLSearchParams(window.location.search).get(POPUP_FLAG) === '1'
    );
  } catch {
    return false;
  }
}

/** redirectTo для OAuth: тот же origin + флаг попапа. */
export function popupRedirectTo() {
  return window.location.origin + `/?${POPUP_FLAG}=1`;
}

/**
 * Внутри попапа: дождаться, пока Supabase обработает токен из URL, сообщить
 * основному окну и закрыться. Полное приложение в попапе НЕ монтируется.
 */
export function finishOAuthPopup(supabase) {
  const notifyAndClose = () => {
    try { window.opener?.postMessage(OAUTH_DONE_MESSAGE, window.location.origin); } catch { /* COOP */ }
    try { window.close(); } catch { /* noop */ }
  };

  if (!supabase) { notifyAndClose(); return; }

  supabase.auth.getSession().then(({ data }) => {
    if (data?.session) { notifyAndClose(); return; }
    // Токен ещё обрабатывается — ждём событие, плюс страховочный таймаут.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        try { sub?.subscription?.unsubscribe(); } catch { /* noop */ }
        notifyAndClose();
      }
    });
    setTimeout(notifyAndClose, 3000);
  }).catch(notifyAndClose);
}

/* ─── Google Calendar OAuth в попапе ──────────────────────────────────────
 * Колбэк builder-gcal-callback редиректит попап на `${origin}/?gcal=connected`
 * (или ?gcal=error). Здесь это окно ловится, сообщает основному окну статус и
 * закрывается — основная страница не перезагружается. */
export const GCAL_DONE_MESSAGE = 'atlas:gcal-done';

/** Это попап, вернувшийся с подключения Google Calendar? */
export function isGcalPopup() {
  try {
    return (
      typeof window !== 'undefined' &&
      window.opener &&
      window.opener !== window &&
      new URLSearchParams(window.location.search).has('gcal')
    );
  } catch {
    return false;
  }
}

/** Внутри gcal-попапа: сообщить основному окну статус и закрыться. */
export function finishGcalPopup() {
  const status = new URLSearchParams(window.location.search).get('gcal') || 'connected';
  try { window.opener?.postMessage({ type: GCAL_DONE_MESSAGE, status }, window.location.origin); } catch { /* COOP */ }
  try { window.close(); } catch { /* noop */ }
}

/**
 * Открыть центрированное попап-окно СИНХРОННО (в обработчике клика — иначе
 * блокировщик попапов его зарежет). Возвращает window или null.
 */
export function openCenteredPopup(w = 480, h = 640) {
  const left = Math.max(0, (window.screenX || 0) + ((window.outerWidth || w) - w) / 2);
  const top = Math.max(0, (window.screenY || 0) + ((window.outerHeight || h) - h) / 2);
  const features = `popup,width=${w},height=${h},left=${Math.round(left)},top=${Math.round(top)}`;
  try { return window.open('about:blank', 'atlas-oauth', features); }
  catch { return null; }
}
