/**
 * localData.js — «чьи данные лежат в этом браузере».
 *
 * Модель проекта: браузер — источник правды, облако — зеркало (см. syncService.js).
 * Это работает, пока за браузером один человек. Как только аккаунты меняются
 * (выход, вход другого человека, удаление аккаунта), нужно знать, КОМУ
 * принадлежит то, что накоплено локально — иначе при входе прогресс предыдущего
 * человека сольётся в аккаунт следующего.
 *
 * Поэтому здесь:
 *   • метка владельца  — `atlas:local-owner:v1` = 'guest' | <userId>;
 *   • единый список ключей прогресса, которые зеркалятся в облако;
 *   • очистка этих ключей с оповещением хуков (событие LOCAL_HYDRATED_EVENT).
 *
 * Правила (применяются в AuthContext):
 *   вход,  владелец guest / тот же пользователь → слить с облаком и записать;
 *   вход,  владелец ДРУГОЙ пользователь         → сперва очистить, потом подтянуть;
 *   выход по кнопке                             → очистить, владелец = guest;
 *   сессия оборвалась сама (истекла, другая вкладка) → НЕ чистить: в браузере
 *   могут быть правки, не дошедшие до облака; они сольются при следующем входе.
 *
 * Схемы конструктора (`atlas:builder:workflows:v1`) сюда НЕ входят: их пишет
 * только гость и в облако они пока не переносятся, поэтому очищать их при
 * выходе нельзя — это единственная копия.
 */

const OWNER_KEY = 'atlas:local-owner:v1';
export const GUEST_OWNER = 'guest';

/**
 * Ключи, которые принадлежат человеку, а не устройству. Курсы/темы/закладки
 * зеркалятся в облако; журнал активности у вошедшего ведётся в облаке отдельно
 * (useSupabaseStats), имя гостя — личное. Всё это после выхода чужое.
 */
export const PROGRESS_KEYS = [
  'claude-mindmap.tutorial-progress.v1',
  'claude-mindmap:node-progress:v1',
  'claude-mindmap:bookmarks:v1',
  'claude-mindmap:activity-log:v1',
  'claude-mindmap:user-identity:v1',
];

/** Черновик конструктора — страховка открытого холста; после выхода он чужой. */
export const BUILDER_DRAFT_KEYS = [
  'atlas:builder:draft',
  'atlas:builder:resume-after-auth',
];

/** То же событие, по которому хуки перечитывают localStorage после слияния. */
export const LOCAL_HYDRATED_EVENT = 'atlas:local-hydrated';

export function getLocalOwner() {
  try { return localStorage.getItem(OWNER_KEY) || GUEST_OWNER; } catch { return GUEST_OWNER; }
}

export function setLocalOwner(owner) {
  try { localStorage.setItem(OWNER_KEY, owner || GUEST_OWNER); } catch { /* приватный режим */ }
}

/** Принадлежат ли локальные данные другому (не этому) пользователю. */
export function isForeignOwner(userId) {
  const owner = getLocalOwner();
  return owner !== GUEST_OWNER && owner !== userId;
}

function notifyHooks() {
  try { window.dispatchEvent(new Event(LOCAL_HYDRATED_EVENT)); } catch { /* SSR */ }
}

/**
 * Стереть локальный прогресс (и черновик конструктора) и оповестить хуки.
 * Настройки устройства (язык, тема, уровень, согласие на cookies) не трогаем.
 * `keepBuilderDraft` — при входе: черновик, который гость понёс на вход,
 * должен дожить до восстановления в конструкторе.
 */
export function clearLocalProgress({ owner = GUEST_OWNER, keepBuilderDraft = false } = {}) {
  const keys = keepBuilderDraft ? PROGRESS_KEYS : [...PROGRESS_KEYS, ...BUILDER_DRAFT_KEYS];
  for (const key of keys) {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  }
  setLocalOwner(owner);
  notifyHooks();
}
