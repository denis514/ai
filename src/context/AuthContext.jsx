import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { getProfile, createProfile } from '../services/profileService.js';
import { syncLocalToSupabase, pullRemoteToLocal } from '../services/syncService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Ref для отслеживания последнего события — нужен чтобы отличить
  // первый вход (SIGNED_IN) от восстановления сессии (INITIAL_SESSION/TOKEN_REFRESHED).
  // Влияет на runSync и isNewUser — они нужны только при реальном входе.
  const lastEvent = useRef(null);

  // ─── Загрузка / создание профиля ──────────────────────────────────────────

  const loadProfile = useCallback(async (userId, email) => {
    const { data } = await getProfile(userId);
    if (data) {
      setProfile(data);
      return false; // не новый пользователь
    }
    // Новый пользователь — создаём профиль
    await createProfile(userId, email);
    const { data: fresh } = await getProfile(userId);
    setProfile(fresh);
    return true;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await getProfile(user.id);
    if (data) setProfile(data);
  }, [user]);

  // ─── Signout ──────────────────────────────────────────────────────────────

  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // setUser / setProfile / setIsNewUser будут сброшены через SIGNED_OUT в onAuthStateChange
  }, []);

  // ─── Синк localStorage → Supabase ─────────────────────────────────────────

  // Порядок обязателен: сначала забрать облако и слить с браузером, только
  // потом писать. Если сделать наоборот, браузер без данных (новое устройство)
  // затрёт то, что накоплено на старом. См. комментарий в syncService.js.
  const runSync = useCallback(async (userId, { push }) => {
    await pullRemoteToLocal(userId);
    if (push) await syncLocalToSupabase(userId);
  }, []);

  // ─── Основной auth-эффект ──────────────────────────────────────────────────
  //
  // Правило Supabase v2:
  //   • Используем ТОЛЬКО onAuthStateChange — он синхронно стреляет INITIAL_SESSION
  //     при монтировании (даже если сессия уже есть в localStorage).
  //   • НЕ вызываем getSession() отдельно — это создаёт race condition, при которой
  //     getSession() может вернуть null после того как onAuthStateChange уже установил user.
  //   • Коллбэк onAuthStateChange должен быть СИНХРОННЫМ — только setUser / setLoading.
  //     Async-операции (loadProfile, runSync) идут в отдельный useEffect.
  //
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        lastEvent.current = event;
        const u = session?.user ?? null;

        // Синхронные обновления состояния — ТОЛЬКО здесь
        setUser(u);

        if (!u) {
          setProfile(null);
          setIsNewUser(false);
        }

        // loading снимается после первого подтверждённого состояния
        // (INITIAL_SESSION = восстановление из localStorage; SIGNED_IN = свежий вход;
        //  SIGNED_OUT = явный выход; TOKEN_REFRESHED = тихое обновление токена)
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Async-операции при смене пользователя ────────────────────────────────
  //
  // Отдельный эффект — зависит от user?.id.
  // Запускается только когда user действительно изменился.
  //
  useEffect(() => {
    if (!user) return;

    const event = lastEvent.current;

    // loadProfile всегда при наличии пользователя
    loadProfile(user.id, user.email).then((isNew) => {
      // isNewUser и runSync — только при реальном входе (SIGNED_IN),
      // а не при тихом восстановлении сессии (INITIAL_SESSION / TOKEN_REFRESHED)
      if (event === 'SIGNED_IN') {
        setIsNewUser(isNew);
        // Свежий вход: слить облако с накопленным гостем и записать результат.
        runSync(user.id, { push: true });
      } else {
        // Восстановление сессии (перезапуск вкладки, другое устройство):
        // подтянуть облако в браузер. Без этого человек видел бы пустую карту,
        // а первая же правка стёрла бы его данные в облаке.
        runSync(user.id, { push: false });
      }
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Context value ────────────────────────────────────────────────────────

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
