import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { getProfile, createProfile } from '../services/profileService.js';
import {
  syncLocalToSupabase, pullRemoteToLocal, resetHydration, isHydrated,
} from '../services/syncService.js';
import {
  setLocalOwner, isForeignOwner, clearLocalProgress, GUEST_OWNER,
} from '../services/localData.js';

const AuthContext = createContext(null);

// Есть ли у гостя сохранённые схемы конструктора (без импорта модуля билдера).
function hasGuestWorkflows() {
  try {
    const raw = localStorage.getItem('atlas:builder:workflows:v1');
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) && list.some(w => w && !w.isArchived);
  } catch { return false; }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  // Слияние с облаком (и переезд схем гостя) для текущего пользователя
  // завершено. Конструктор ждёт этот флаг, прежде чем восстанавливать
  // черновик после входа — иначе схема легла бы в аккаунт дважды.
  const [syncReady, setSyncReady] = useState(false);

  // Ref для отслеживания последнего события — нужен чтобы отличить
  // первый вход (SIGNED_IN) от восстановления сессии (INITIAL_SESSION/TOKEN_REFRESHED).
  // Влияет на runSync и isNewUser — они нужны только при реальном входе.
  const lastEvent = useRef(null);

  // Кто сейчас вошёл — для проверок после ожидания сети (см. runSync) и для
  // отзыва права на запись при выходе, каким бы путём он ни случился.
  const currentUserId = useRef(null);

  // Выход, который нажал сам человек (в отличие от истёкшей сессии). Только в
  // этом случае чистим браузер: при невольном разрыве сессии в нём могут лежать
  // правки, не дошедшие до облака, и стирать их молча нельзя.
  const explicitSignOut = useRef(false);

  // Что сделать ПЕРЕД выходом (например, конструктор досохраняет холст).
  const beforeSignOut = useRef(new Set());
  const registerBeforeSignOut = useCallback((fn) => {
    beforeSignOut.current.add(fn);
    return () => beforeSignOut.current.delete(fn);
  }, []);

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

  // Порядок: досохранить всё, что ещё не в облаке → разорвать сессию.
  // Очистка браузера и сброс user/profile — в обработчике SIGNED_OUT ниже.
  // scope 'local' — после удаления аккаунта: серверу уже нечего завершать.
  const handleSignOut = useCallback(async ({ scope = 'global' } = {}) => {
    if (!supabase) return;
    const uid = currentUserId.current;
    explicitSignOut.current = true;
    try {
      // После удаления аккаунта (scope 'local') досохранять уже некуда.
      if (scope !== 'local') {
        for (const fn of beforeSignOut.current) {
          try { await fn(); } catch (e) { console.error('[auth] before-signout hook failed', e); }
        }
        if (uid && isHydrated(uid)) await syncLocalToSupabase(uid);
      }
      const { error } = await supabase.auth.signOut({ scope });
      if (error) {
        // Сервер не ответил — сессию локально всё равно закрываем, иначе
        // человек остаётся «вошедшим» с чужими для следующего данными.
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (e) {
      console.error('[auth] sign-out failed', e);
    } finally {
      explicitSignOut.current = false; // иначе следующий невольный разрыв сессии стёр бы данные
    }
  }, []);

  // ─── Синк localStorage → Supabase ─────────────────────────────────────────

  // Порядок обязателен: сначала забрать облако и слить с браузером, только
  // потом писать. Если сделать наоборот, браузер без данных (новое устройство)
  // затрёт то, что накоплено на старом. См. комментарий в syncService.js.
  //
  // Владелец локальных данных (localData.js): если в браузере лежит прогресс
  // ДРУГОГО пользователя — его нельзя сливать в этот аккаунт. Сперва чистим,
  // и только потом подтягиваем облако. После pull владелец — текущий пользователь.
  //
  // Пока ждём сеть, человек может выйти — тогда ничего не пишем (isStale) и не
  // ставим владельца. Владелец ставится только после УСПЕШНОГО pull: иначе
  // браузер помечался бы как «данные в облаке», хотя облако их не получило,
  // и следующий выход стёр бы их безвозвратно.
  const runSync = useCallback(async (userId, { push }) => {
    const isStale = () => currentUserId.current !== userId;
    let doPush = push;
    const foreign = isForeignOwner(userId);
    if (foreign) {
      clearLocalProgress({ owner: userId, keepBuilderDraft: true });
      doPush = false; // сливать нечего — в браузере теперь пусто
    }
    try {
      await pullRemoteToLocal(userId, { isStale });
      if (isStale() || !isHydrated(userId)) return;
      setLocalOwner(userId);
      if (doPush) {
        const { errors } = await syncLocalToSupabase(userId);
        if (errors.length) console.error('[auth] push after sign-in incomplete', errors);
      }
      // Схемы, собранные гостем, переезжают в аккаунт. Делаем при любом
      // входе, не только «свежем»: локально их пишет только гость, а после
      // редиректа (magic link) событие может прийти как восстановление сессии.
      // Модуль конструктора грузим только если есть что переносить.
      if (!foreign && hasGuestWorkflows()) {
        const { migrateLocalToCloud } = await import('../builder/services/workflowStorage.js');
        if (!isStale()) await migrateLocalToCloud(userId);
      }
    } catch (e) {
      console.error('[auth] sync failed', e);
    } finally {
      if (!isStale()) setSyncReady(true);
    }
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
        const prevUserId = currentUserId.current;
        currentUserId.current = u?.id ?? null;

        // Синхронные обновления состояния — ТОЛЬКО здесь
        setUser(u);
        if (u?.id !== prevUserId) setSyncReady(false);

        if (!u) {
          setProfile(null);
          setIsNewUser(false);
        }

        if (event === 'SIGNED_OUT') {
          // Право писать в облако отзываем всегда и первым делом: опустевший
          // браузер не должен затереть аккаунт, из которого вышли (это же
          // ловит выход из соседней вкладки — там storage-события уже идут).
          resetHydration(prevUserId);
          // Чистим браузер только при выходе по кнопке: прогресс досохранён, и
          // оставлять его следующему человеку за компьютером нельзя. При
          // истёкшей сессии данные остаются — в них могут быть правки, не
          // дошедшие до облака; они сольются при следующем входе того же человека.
          if (explicitSignOut.current) clearLocalProgress({ owner: GUEST_OWNER });
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
    // Профиль мог не загрузиться (сеть, RLS) — слияние всё равно должно
    // пройти, иначе syncReady навсегда false и конструктор не восстановит черновик.
    loadProfile(user.id, user.email).catch(() => false).then((isNew) => {
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
    syncReady,
    dismissOnboarding: () => setIsNewUser(false),
    signOut: handleSignOut,
    registerBeforeSignOut,
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
