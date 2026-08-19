/**
 * signInNudge.js — когда предлагать войти.
 *
 * Правила, из которых всё вытекает:
 *   • Предложение, а не стена. Ничего не перекрывает, само исчезает.
 *   • Только в момент, когда человеку УЖЕ есть что терять: прошёл курс,
 *     набрал закладки. До этого вход ему нечего не даёт, и просить нечестно.
 *   • Каждый повод — один раз за всё время. Второй показ того же — навязчивость.
 *   • Не чаще одного предложения за сеанс страницы.
 *   • Гостю. Вошедшему — никогда.
 *
 * Что именно обещаем — важно: не «зарегистрируйтесь», а «прогресс закрепится за
 * вами и подтянется на других устройствах». Это ровно то, что делает
 * syncService после входа (сначала слияние с облаком, потом запись).
 */

const KEY = 'atlas:signin-nudge:v1';

// Один показ на сеанс страницы: даже если человек за один заход и курс прошёл,
// и закладок набрал — дёргаем его один раз.
let shownThisSession = false;

function readSeen() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function markSeen(reason) {
  try {
    const seen = readSeen();
    seen[reason] = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(seen));
  } catch { /* приватный режим — просто не запомним */ }
}

/** Показывали ли уже этот повод. */
export function wasNudged(reason) {
  return !!readSeen()[reason];
}

/**
 * Показать предложение войти, если момент подходящий.
 *
 * @param {'course'|'bookmarks'} reason  повод
 * @param {object} deps
 * @param {boolean} deps.isLoggedIn
 * @param {(opts:object)=>void} deps.toast   очередь уведомлений (useToast)
 * @param {(key:string)=>string} deps.t      переводчик
 * @param {()=>void} deps.onSignIn           открыть окно входа
 * @returns {boolean} показали ли
 */
export function nudgeSignIn(reason, { isLoggedIn, toast, t, onSignIn }) {
  if (isLoggedIn || shownThisSession || wasNudged(reason)) return false;
  if (typeof toast !== 'function' || typeof onSignIn !== 'function') return false;

  shownThisSession = true;
  markSeen(reason);

  toast({
    message: t(`nudge.${reason}`),
    variant: 'info',
    duration: 12000,          // решение требует времени: дольше обычного тоста
    action: { label: t('auth.signIn'), onClick: onSignIn },
  });
  return true;
}

/** Только для тестов: забыть, что показывали в этом сеансе. */
export function resetSessionNudge() {
  shownThisSession = false;
}
