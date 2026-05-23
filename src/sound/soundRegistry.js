/**
 * Реестр звуковых эффектов.
 *
 * Ключи в dot.case. Каждый ключ → объект с url и множителем громкости.
 * При добавлении новой записи:
 *   1) положить mp3 в public/sounds/
 *   2) обновить public/sounds/README.md (источник, лицензия)
 *   3) обновить docs/sound-design.md § 2 (таблица)
 *
 * Файлы — короткие sci-fi из mixkit.co (≤ 400 мс, ≤ 30 KB).
 */

export const SOUND_REGISTRY = {
  'node.expand':       { url: '/sounds/node-expand.mp3',       gain: 1.0 },
  'node.collapse':     { url: '/sounds/node-collapse.mp3',     gain: 0.8 },
  'modal.open':        { url: '/sounds/modal-open.mp3',        gain: 0.9 },
  'modal.close':       { url: '/sounds/modal-close.mp3',       gain: 0.7 },
  'ui.hover':          { url: '/sounds/ui-hover.mp3',          gain: 0.4 },
  'ui.click':          { url: '/sounds/ui-click.mp3',          gain: 0.8 },
  'progress.step':     { url: '/sounds/progress-step.mp3',     gain: 1.0 },
  'progress.complete': { url: '/sounds/progress-complete.mp3', gain: 1.0 },
  'toast.show':        { url: '/sounds/toast-show.mp3',        gain: 0.6 }
};

export const SOUND_KEYS = Object.keys(SOUND_REGISTRY);
