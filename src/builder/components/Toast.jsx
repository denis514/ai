import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../components/Icon.jsx';

/**
 * Toast — всплывающие push-сообщения (ошибки / успех / инфо).
 *
 * Архитектура: модульная шина (toast.*). Любой код вызывает toast.error('…')
 * без проброса пропсов. <ToastHost/> монтируется один раз и слушает шину.
 *
 *   import { toast } from './Toast.jsx';
 *   toast.error('Не удалось сохранить');
 *   toast.success('Сохранено');
 *   toast.info('…');
 */

let _id = 0;
const listeners = new Set();

export const toast = {
  show: (type, message, opts = {}) => {
    const item = { id: ++_id, type, message, ttl: opts.ttl ?? (type === 'error' ? 6000 : 3500) };
    listeners.forEach(fn => fn(item));
    return item.id;
  },
  error: (m, o) => toast.show('error', m, o),
  success: (m, o) => toast.show('success', m, o),
  info: (m, o) => toast.show('info', m, o),
};

const ICON = { error: 'close', success: 'check', info: 'idea' };

export default function ToastHost() {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => setItems(list => list.filter(i => i.id !== id)), []);

  useEffect(() => {
    const onAdd = (item) => {
      setItems(list => [...list, item]);
      if (item.ttl > 0) setTimeout(() => remove(item.id), item.ttl);
    };
    listeners.add(onAdd);
    return () => listeners.delete(onAdd);
  }, [remove]);

  if (items.length === 0) return null;

  return (
    <div className="builder-toasts" role="region" aria-live="polite">
      {items.map(it => (
        <div key={it.id} className={`builder-toast builder-toast--${it.type}`} role="status">
          <span className="builder-toast__icon" aria-hidden="true">
            <Icon name={ICON[it.type] || 'idea'} size={14} strokeWidth={2} />
          </span>
          <span className="builder-toast__msg">{it.message}</span>
          <button
            type="button"
            className="builder-toast__close"
            onClick={() => remove(it.id)}
            aria-label="Закрыть"
          >
            <Icon name="close" size={12} strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  );
}
