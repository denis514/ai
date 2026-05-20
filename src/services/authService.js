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

/** Сохранить текущий хэш перед OAuth-редиректом или отправкой Magic Link. */
function saveReturnRoute() {
  const hash = window.location.hash;
  // Сохраняем только если есть реальный маршрут (не просто '#' или '#/ru')
  if (hash && hash.replace(/^#\/?([a-z]{2}\/)?/, '').length > 0) {
    sessionStorage.setItem(RETURN_ROUTE_KEY, hash);
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
