/**
 * soundEngine — singleton для воспроизведения коротких UI SFX.
 *
 * Особенности:
 *  • Никаких внешних зависимостей (нативный HTMLAudioElement).
 *  • Ленивая загрузка: Audio создаётся при первом play(key).
 *  • Параллельные срабатывания: cloneNode() чтобы не обрезать предыдущий звук.
 *  • Тихо игнорирует NotAllowedError (autoplay policy до первого user gesture).
 *  • Prefs хранятся в localStorage и публикуются через subscribe().
 *  • Уважает prefers-reduced-motion: если включено и пользователь не делал
 *    явного выбора — звук по умолчанию выключен.
 *
 * Использование:
 *   import { playSound } from './soundEngine';
 *   playSound('node.expand');
 */

import { SOUND_REGISTRY } from './soundRegistry.js';

const LS_ENABLED = 'atlas:sound:enabled';
const LS_VOLUME  = 'atlas:sound:volume';

const DEFAULT_VOLUME = 0.3;

// ---------------- Prefs ----------------

function readBool(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (v === '1' || v === 'true') return true;
    if (v === '0' || v === 'false') return false;
  } catch {}
  return fallback;
}

function readNumber(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
  } catch {}
  return fallback;
}

function getDefaultEnabled() {
  // prefers-reduced-motion → off по умолчанию
  if (typeof window !== 'undefined' && window.matchMedia) {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    } catch {}
  }
  return true;
}

let enabled = readBool(LS_ENABLED, getDefaultEnabled());
let volume  = readNumber(LS_VOLUME, DEFAULT_VOLUME);

const listeners = new Set();
function emit() {
  const state = { enabled, volume };
  listeners.forEach(fn => { try { fn(state); } catch {} });
}

// ---------------- Audio cache ----------------

/** key → HTMLAudioElement (template; для play() клонируется) */
const cache = new Map();

function getAudio(key) {
  if (cache.has(key)) return cache.get(key);
  const entry = SOUND_REGISTRY[key];
  if (!entry) return null;
  try {
    const a = new Audio(entry.url);
    a.preload = 'auto';
    cache.set(key, a);
    return a;
  } catch {
    return null;
  }
}

// ---------------- Public API ----------------

export function playSound(key, { volume: vOverride } = {}) {
  if (!enabled) return;
  const tmpl = getAudio(key);
  if (!tmpl) return;
  const entry = SOUND_REGISTRY[key];
  const gain = entry?.gain ?? 1;
  const v = Math.max(0, Math.min(1, (vOverride ?? volume) * gain));
  try {
    const node = tmpl.cloneNode(true);
    node.volume = v;
    const p = node.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {}
}

export function setSoundEnabled(next) {
  enabled = !!next;
  try { localStorage.setItem(LS_ENABLED, enabled ? '1' : '0'); } catch {}
  emit();
}

export function setSoundVolume(next) {
  const n = Math.max(0, Math.min(1, Number(next) || 0));
  volume = n;
  try { localStorage.setItem(LS_VOLUME, String(n)); } catch {}
  emit();
}

export function getSoundState() {
  return { enabled, volume };
}

export function subscribeSound(listener) {
  listeners.add(listener);
  // Сразу пушим текущее состояние, чтобы подписчик не ждал первого emit
  try { listener({ enabled, volume }); } catch {}
  return () => listeners.delete(listener);
}

/** Предзагрузка набора звуков. Можно вызвать на idle. */
export function preloadSounds(keys) {
  (keys || Object.keys(SOUND_REGISTRY)).forEach(getAudio);
}
