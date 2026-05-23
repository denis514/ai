import { useEffect, useState, useCallback } from 'react';

/**
 * Глобальная очередь toast-уведомлений.
 *
 * Использование:
 *   const { toast } = useToast();
 *   toast('Курс начат');
 *   toast.success('Файл сохранён');
 *   toast.error('Не удалось загрузить');
 *   toast({ message: 'Закладка удалена', action: { label: 'Отменить', onClick: undo } });
 *
 * ToastContainer (см. components/ToastContainer.jsx) рендерится один раз
 * в App и подписывается на эту очередь.
 *
 * Идея: pub/sub через listeners + Set. Toasts создаются с уникальным id,
 * каждый ToastContainer-instance отображает все active toasts.
 */

let nextId = 1;
const toasts = [];
const listeners = new Set();

function notify() {
  for (const cb of listeners) cb([...toasts]);
}

function add(opts) {
  const id = `t${nextId++}`;
  const t = {
    id,
    message: typeof opts === 'string' ? opts : opts.message || '',
    variant: typeof opts === 'string' ? 'info' : (opts.variant || 'info'),
    duration: typeof opts === 'string' ? 4000 : (opts.duration ?? 4000),
    action: typeof opts === 'string' ? null : (opts.action || null),
    createdAt: Date.now(),
  };
  toasts.push(t);
  notify();
  if (t.duration > 0) {
    setTimeout(() => remove(id), t.duration);
  }
  return id;
}

function remove(id) {
  const idx = toasts.findIndex(t => t.id === id);
  if (idx !== -1) {
    toasts.splice(idx, 1);
    notify();
  }
}

// Публичный API
function toastFn(opts) { return add(opts); }
toastFn.success = (msg, opts = {}) => add({ ...opts, message: msg, variant: 'success' });
toastFn.error   = (msg, opts = {}) => add({ ...opts, message: msg, variant: 'error' });
toastFn.info    = (msg, opts = {}) => add({ ...opts, message: msg, variant: 'info' });
toastFn.warning = (msg, opts = {}) => add({ ...opts, message: msg, variant: 'warning' });
toastFn.dismiss = (id) => remove(id);

/**
 * Hook для использования в компонентах. Возвращает стабильный API.
 */
export function useToast() {
  return { toast: toastFn };
}

/**
 * Хук-подписка для ToastContainer.
 */
export function useToastList() {
  const [list, setList] = useState(() => [...toasts]);
  useEffect(() => {
    listeners.add(setList);
    return () => { listeners.delete(setList); };
  }, []);
  const dismiss = useCallback((id) => remove(id), []);
  return { list, dismiss };
}
