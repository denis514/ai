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
 * Удалить все данные пользователя (GDPR right to erasure).
 * Каскадное удаление через ON DELETE CASCADE в SQL.
 * После вызова — выход из аккаунта.
 *
 * @param {string} userId
 */
export async function deleteProfile(userId) {
  if (!supabase || !userId) return { error: 'Not available' };

  // Удаляем профиль — каскад подчистит learning_progress, favorites и др.
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) return { error: error.message };
  return { error: null };
}
