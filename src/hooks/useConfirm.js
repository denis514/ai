import { useEffect, useState, useCallback } from 'react';

/**
 * Promise-based confirm dialog. Заменяет browser `window.confirm()` —
 * который выглядит инородно и не поддерживает theme/branding.
 *
 * Использование:
 *   const { confirm } = useConfirm();
 *   const ok = await confirm({
 *     title: 'Сбросить прогресс?',
 *     description: 'Это действие нельзя отменить.',
 *     confirmLabel: 'Сбросить',
 *     cancelLabel: 'Отмена',
 *     danger: true,
 *   });
 *   if (ok) doReset();
 *
 * ConfirmDialogContainer рендерится один раз в App, подписан на очередь.
 */

let nextId = 1;
const queue = [];
const listeners = new Set();

function notify() {
  for (const cb of listeners) cb([...queue]);
}

function ask(opts) {
  return new Promise((resolve) => {
    const id = `c${nextId++}`;
    queue.push({
      id,
      title: opts.title || 'Подтверждение',
      description: opts.description || '',
      confirmLabel: opts.confirmLabel || 'OK',
      cancelLabel: opts.cancelLabel || 'Отмена',
      danger: !!opts.danger,
      resolve,
    });
    notify();
  });
}

function resolveDialog(id, answer) {
  const idx = queue.findIndex(d => d.id === id);
  if (idx !== -1) {
    const d = queue[idx];
    queue.splice(idx, 1);
    notify();
    d.resolve(answer);
  }
}

// Публичный API
function confirmFn(opts) { return ask(opts); }

export function useConfirm() {
  return { confirm: confirmFn };
}

export function useConfirmQueue() {
  const [list, setList] = useState(() => [...queue]);
  useEffect(() => {
    listeners.add(setList);
    return () => { listeners.delete(setList); };
  }, []);
  const onConfirm = useCallback((id) => resolveDialog(id, true), []);
  const onCancel = useCallback((id) => resolveDialog(id, false), []);
  return { list, onConfirm, onCancel };
}
