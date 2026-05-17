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
export async function sendMagicLink(email, consentGiven) {
  if (!supabase) return { error: 'Supabase not configured' };
  if (!email || !email.includes('@')) return { error: 'Invalid email' };
  if (!consentGiven) return { error: 'Consent required' };

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
