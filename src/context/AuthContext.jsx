import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { getProfile, createProfile } from '../services/profileService.js';

const AuthContext = createContext(null);

/**
 * AuthProvider — оборачивает всё приложение.
 * Предоставляет:
 *   user     — объект Supabase Auth User (или null)
 *   profile  — строка из таблицы profiles (или null)
 *   loading  — true пока идёт проверка сессии при загрузке
 *   signOut  — функция выхода
 *   refreshProfile — перечитать профиль из БД
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузить/создать профиль для userId
  const loadProfile = useCallback(async (userId, email) => {
    const { data } = await getProfile(userId);
    if (data) {
      setProfile(data);
    } else {
      // Новый пользователь — создаём запись
      await createProfile(userId, email);
      const { data: fresh } = await getProfile(userId);
      setProfile(fresh);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await getProfile(user.id);
    if (data) setProfile(data);
  }, [user]);

  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    if (!supabase) {
      // Supabase не сконфигурирован — работаем в offline режиме
      setLoading(false);
      return;
    }

    // Восстановить сессию при загрузке страницы
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadProfile(u.id, u.email).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Слушаем смены состояния авторизации (логин через Magic Link, выход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await loadProfile(u.id, u.email);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const value = {
    user,           // supabase User object | null
    profile,        // наш profiles row | null
    loading,        // true пока сессия восстанавливается
    isLoggedIn: !!user,
    signOut: handleSignOut,
    refreshProfile,
    setProfile,     // для локальных оптимистичных обновлений
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — хук для любого компонента.
 * Возвращает { user, profile, loading, isLoggedIn, signOut, refreshProfile }
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
