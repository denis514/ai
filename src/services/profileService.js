/**
 * profileService.js — операции с таблицей `profiles` в Supabase.
 *
 * Таблица создаётся вручную в Supabase SQL Editor (SQL приведён в docs/).
 * RLS: пользователь читает и изменяет только свою строку.
 */

import { supabase } from '../lib/supabaseClient.js';

/**
 * Получить профиль текущего пользователя.
 * @param {string} userId - UUID из supabase.auth.user
 * @returns {{ data: object|null, error: string|null }}
 */
export async function getProfile(userId) {
  if (!supabase || !userId) return { data: null, error: 'Not available' };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = строка не найдена (нормально для нового пользователя)
    return { data: null, error: error.message };
  }
  return { data: data || null, error: null };
}

/**
 * Создать профиль после первого входа.
 * Вызывается автоматически из AuthContext при обнаружении нового user без профиля.
 *
 * @param {string} userId
 * @param {string} email
 * @param {string} consentVersion - версия Privacy Policy, например '1.0'
 */
export async function createProfile(userId, email, consentVersion = '1.0') {
  if (!supabase || !userId) return { error: 'Not available' };

  const { error } = await supabase.from('profiles').insert({
    id: userId,
    email,
    display_name: null,       // пользователь задаст позже
    locale: 'en',
    consent_at: new Date().toISOString(),
    consent_version: consentVersion,
  });

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Обновить поля профиля (display_name, locale).
 *
 * @param {string} userId
 * @param {{ display_name?: string, locale?: string }} updates
 */
export async function updateProfile(userId, updates) {
  if (!supabase || !userId) return { error: 'Not available' };

  const allowed = {};
  if (updates.display_name !== undefined) allowed.display_name = updates.display_name;
  if (updates.locale !== undefined) allowed.locale = updates.locale;
  allowed.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('profiles')
    .update(allowed)
    .eq('id', userId);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Удалить учётную запись и все данные пользователя (GDPR, право на забвение).
 *
 * Идёт через серверную функцию `account-delete`: только она может удалить
 * запись из auth.users, а все таблицы проекта каскадом привязаны именно к ней.
 * Удаление строки profiles из браузера (как было раньше) данные не трогало —
 * прогресс, схемы и сама учётка оставались, и повторный вход всё возвращал.
 *
 * После успешного ответа вызывающий код делает signOut — обработчик SIGNED_OUT
 * в AuthContext чистит локальный прогресс.
 *
 * @param {string} userId — только для проверки; сервер берёт id из токена
 * @returns {{ error: string|null }}
 */
export async function deleteProfile(userId) {
  const fnBase = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
    : null;
  if (!supabase || !userId || !fnBase) return { error: 'Not available' };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user?.id !== userId) return { error: 'not_authenticated' };

  try {
    const res = await fetch(`${fnBase}/account-delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) return { error: out.error || `http_${res.status}` };
    return { error: null };
  } catch (e) {
    return { error: e?.message || 'network_error' };
  }
}
