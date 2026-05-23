import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'claude-mindmap.tutorial-progress.v1';

// Структура: { [tutorialId]: { completedSteps: string[], lastStepIndex: number, completedAt: string|null, startedAt: string|null } }

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / privacy mode
  }
}

export function useTutorialProgress() {
  const [progress, setProgress] = useState(readStorage);

  // Синхронизация между вкладками
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setProgress(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((tutorialId, updater) => {
    setProgress(prev => {
      const isNew = !prev[tutorialId];
      const cur = prev[tutorialId] || { completedSteps: [], lastStepIndex: 0, completedAt: null, startedAt: null };
      const updated = updater(cur);
      // Ставим startedAt при первом касании туториала
      if (isNew || !cur.startedAt) {
        updated.startedAt = updated.startedAt || new Date().toISOString();
      }
      const next = { ...prev, [tutorialId]: updated };
      writeStorage(next);
      return next;
    });
  }, []);

  const toggleStep = useCallback((tutorialId, stepId, totalSteps) => {
    update(tutorialId, cur => {
      const set = new Set(cur.completedSteps);
      if (set.has(stepId)) set.delete(stepId);
      else set.add(stepId);
      const completedSteps = [...set];
      const isFullyComplete = completedSteps.length === totalSteps;
      return {
        ...cur,
        completedSteps,
        completedAt: isFullyComplete ? (cur.completedAt || new Date().toISOString()) : null
      };
    });
  }, [update]);

  const setLastStepIndex = useCallback((tutorialId, idx) => {
    update(tutorialId, cur => ({ ...cur, lastStepIndex: idx }));
  }, [update]);

  const reset = useCallback((tutorialId) => {
    setProgress(prev => {
      const next = { ...prev };
      delete next[tutorialId];
      writeStorage(next);
      return next;
    });
  }, []);

  const getProgress = useCallback((tutorialId) => {
    return progress[tutorialId] || { completedSteps: [], lastStepIndex: 0, completedAt: null };
  }, [progress]);

  const isCompleted = useCallback((tutorialId) => {
    return !!progress[tutorialId]?.completedAt;
  }, [progress]);

  // Сводка для тулбара / счётчика
  const summary = {
    total: 0,
    completed: 0
  };

  return {
    progress,
    getProgress,
    isCompleted,
    toggleStep,
    setLastStepIndex,
    reset,
    summary
  };
}
