import { useEffect, useState, useCallback } from 'react';
import {
  getSoundState,
  subscribeSound,
  setSoundEnabled,
  setSoundVolume
} from '../sound/soundEngine.js';

/**
 * useSoundPrefs — подписка на состояние звуковой подсистемы.
 *
 * Возвращает { enabled, volume, setEnabled, setVolume }.
 * Любой компонент с этим хуком перерисуется при изменении prefs
 * (включая изменение из другого компонента).
 */
export function useSoundPrefs() {
  const [state, setState] = useState(getSoundState);

  useEffect(() => subscribeSound(setState), []);

  const setEnabled = useCallback((v) => setSoundEnabled(v), []);
  const setVolume  = useCallback((v) => setSoundVolume(v), []);

  return {
    enabled: state.enabled,
    volume:  state.volume,
    setEnabled,
    setVolume
  };
}
