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
  // ✅ Доступные ассеты (WAV)
  'node.expand':       { url: '/sounds/node-expand.wav',       gain: 1.0 },
  'node.collapse':     { url: '/sounds/node-expand.wav',       gain: 0.6 }, // fallback: тот же файл тише, пока нет своего
  'ui.hover':          { url: '/sounds/ui-hover.wav',          gain: 0.4 },
  'ui.click':          { url: '/sounds/ui-click.wav',          gain: 0.8 },
  // 🕒 Ожидают ассетов — engine молча игнорирует отсутствующие URL.
  // Когда положишь файлы в public/sounds/ — меняй расширение здесь.
  'modal.open':        { url: '/sounds/modal-open.wav',        gain: 0.9 },
  'modal.close':       { url: '/sounds/modal-close.wav',       gain: 0.7 },
  'progress.step':     { url: '/sounds/progress-step.wav',     gain: 1.0 },
  'progress.complete': { url: '/sounds/progress-complete.wav', gain: 1.0 },
  'toast.show':        { url: '/sounds/toast-show.wav',        gain: 0.6 }
};

export const SOUND_KEYS = Object.keys(SOUND_REGISTRY);
