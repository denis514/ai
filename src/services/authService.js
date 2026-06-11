/**
 * authService.js — обёртка над Supabase Auth.
 *
 * Используется только внутри AuthContext и AuthModal.
 * Остальные компоненты работают через useAuth() хук из AuthContext.
 */

import { supabase } from '../lib/supabaseClient.js';

/**
 * Отправить Magic Link на email.
 * Пользователь получит письмо → кликнет ссылку → вернётся на сайт авторизованным.
 *
 * @param {string} email
 * @param {boolean} consentGiven - пользователь поставил галочку согласия
 * @returns {{ error: string|null }}
 */
// Ключ в sessionStorage для восстановления маршрута после авторизации.
// sessionStorage живёт в рамках одной вкладки/сессии браузера.
const RETURN_ROUTE_KEY = 'atlas:post-auth-route';

/** Сохранить текущий ПУТЬ перед OAuth-редиректом или отправкой Magic Link.
 *  path-routing (ADR-0008): храним pathname (+search), а не hash —
 *  хеш теперь занят токеном Supabase (#access_token=…). */
function saveReturnRoute() {
  const path = window.location.pathname + window.location.search;
  // Сохраняем только реальный маршрут (не корень '/' и не просто '/ru').
  const stripped = path.replace(/^\/([a-z]{2})(?=\/|$)/i, '');
  if (stripped.replace(/^\//, '').length > 0) {
    sessionStorage.setItem(RETURN_ROUTE_KEY, path);
  }
}

export async function sendMagicLink(email, consentGiven) {
  if (!supabase) return { error: 'Supabase not configured' };
  if (!email || !email.includes('@')) return { error: 'Invalid email' };
  if (!consentGiven) return { error: 'Consent required' };

  // Сохраняем маршрут: после клика по Magic Link пользователь вернётся
  // в ту же точку, где инициировал вход.
  saveReturnRoute();

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      // После клика по ссылке редирект вернётся на текущий origin.
      // Supabase detectSessionInUrl:true подхватит токен из URL.
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Войти через Google OAuth.
 * Supabase выполнит редирект на Google, после авторизации вернёт пользователя
 * обратно на сайт. onAuthStateChange в AuthContext поймает SIGNED_IN автоматически.
 *
 * @returns {{ error: string|null }}
 */
export async function signInWithGoogle() {
  if (!supabase) return { error: 'Supabase not configured' };

  // Сохраняем маршрут: после Google OAuth редиректа страница перезагружается
  // на origin + '/' и хэш теряется. sessionStorage сохраняется между редиректами
  // в рамках одной вкладки.
  saveReturnRoute();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/',
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account', // всегда показывать выбор аккаунта Google
      },
    },
  });
  return { error: error?.message || null };
}

/**
 * Получить URL Google OAuth БЕЗ редиректа (skipBrowserRedirect).
 * Используется для входа во всплывающем окне: основное окно само открывает
 * попап и ведёт его на этот URL. redirectTo помечен флагом попапа.
 *
 * @param {string} redirectTo
 * @returns {{ error: string|null, url: string|null }}
 */
export async function getGoogleOAuthUrl(redirectTo) {
  if (!supabase) return { error: 'Supabase not configured', url: null };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      skipBrowserRedirect: true,
      redirectTo,
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    },
  });
  if (error) return { error: error.message, url: null };
  return { error: null, url: data?.url || null };
}

/**
 * Войти через Apple OAuth (Sign in with Apple).
 * Тот же механизм, что и Google: Supabase редиректит на Apple и обратно;
 * onAuthStateChange ловит SIGNED_IN. Требует включённого провайдера Apple в
 * Supabase (Client ID + сгенерированный Secret) — см. docs/auth-apple-setup.md.
 *
 * @returns {{ error: string|null }}
 */
export async function signInWithApple() {
  if (!supabase) return { error: 'Supabase not configured' };
  saveReturnRoute();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: window.location.origin + '/',
    },
  });
  return { error: error?.message || null };
}

/**
 * Выход из аккаунта.
 */
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Получить текущую сессию синхронно (из кэша).
 * Используется при инициализации AuthContext.
 */
export async function getSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
