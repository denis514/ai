import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { getProfile, createProfile } from '../services/profileService.js';
import { syncLocalToSupabase } from '../services/syncService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // isNewUser: true если пользователь только что зарегистрировался
  // Используется для показа Welcome онбординга
  const [isNewUser, setIsNewUser] = useState(false);

  // Загрузить профиль; если не существует — создать (новый пользователь).
  // При Google-входе: auto-fill display_name из user_metadata если ещё не задан.
  // GDPR: display_name НЕ заполняется автоматически из Google metadata.
  // Пользователь явно задаёт имя в ProfilePanel (Art. 5(1)(b) — цель обработки,
  // Art. 5(1)(c) — минимизация данных). userMeta принимается но не используется.
  const loadProfile = useCallback(async (userId, email, _userMeta) => {
    const { data } = await getProfile(userId);
    if (data) {
      setProfile(data);
      return false; // не новый пользователь
    } else {
      await createProfile(userId, email);
      const { data: fresh } = await getProfile(userId);
      setProfile(fresh);
      return true; // новый пользователь
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
    setIsNewUser(false);
  }, []);

  // Синк localStorage → Supabase при каждом входе.
  // Idempotent (upsert), поэтому guard не нужен.
  // Гарантирует что офлайн-данные гостя попадут в Supabase после логина.
  const runSync = useCallback(async (userId) => {
    await syncLocalToSupabase(userId);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Восстановить сессию при загрузке
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const isNew = await loadProfile(u.id, u.email, u.user_metadata);
        setIsNewUser(isNew);
        // Sync только для не-новых пользователей при восстановлении сессии
        if (!isNew) runSync(u.id);
      }
      setLoading(false);
    });

    // Слушаем смены auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null;
        setUser(u);

        if (u) {
          const isNew = await loadProfile(u.id, u.email, u.user_metadata);
          // SIGNED_IN (Magic Link или Google OAuth) — показать онбординг если новый
          if (event === 'SIGNED_IN') {
            setIsNewUser(isNew);
            runSync(u.id);
          }
        } else {
          setProfile(null);
          setIsNewUser(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile, runSync]);

  const value = {
    user,
    profile,
    loading,
    isLoggedIn: !!user,
    isNewUser,
    dismissOnboarding: () => setIsNewUser(false),
    signOut: handleSignOut,
    refreshProfile,
    setProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
