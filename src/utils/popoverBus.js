/**
 * popoverBus — «в шапке открыт только один попап».
 *
 * Каждый попап шапки (тема, язык, меню Atlas, плашка профиля) при открытии
 * объявляет себя; остальные слышат объявление и закрываются. Без общего
 * состояния и без пробрасывания пропсов через все поверхности.
 */

const EVT = 'atlas:popover-open';

/** Объявить «я открылся» (закрывает всех остальных). */
export function announcePopover(id) {
  try { window.dispatchEvent(new CustomEvent(EVT, { detail: { id } })); } catch { /* SSR */ }
}

/** Подписаться: закрыться, когда открылся кто-то другой. Возвращает отписку. */
export function onOtherPopover(id, close) {
  const handler = (e) => { if (e.detail?.id !== id) close(); };
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}
