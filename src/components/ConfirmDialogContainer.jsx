import React, { useEffect } from 'react';
import Icon from './Icon.jsx';
import { useConfirmQueue } from '../hooks/useConfirm.js';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';

/**
 * Рендерит активные confirm-диалоги. Только верхний из стека показывается
 * (LIFO) — остальные ждут пока этот не закроется.
 */
export default function ConfirmDialogContainer() {
  const { list, onConfirm, onCancel } = useConfirmQueue();
  if (!list.length) return null;
  // Показываем последний — topmost
  const dialog = list[list.length - 1];
  return <ConfirmDialog dialog={dialog} onConfirm={onConfirm} onCancel={onCancel} />;
}

function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  useFocusReturn();
  useBodyScrollLock();

  // ESC закрывает (cancel), Enter подтверждает
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onCancel(dialog.id);
      } else if (e.key === 'Enter') {
        e.stopImmediatePropagation();
        onConfirm(dialog.id);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [dialog.id, onConfirm, onCancel]);

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`confirm-title-${dialog.id}`}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(dialog.id); }}
    >
      <div className={`confirm-dialog ${dialog.danger ? 'confirm-dialog--danger' : ''}`}>
        <header className="confirm-dialog__header">
          {dialog.danger && (
            <span className="confirm-dialog__icon" aria-hidden="true">
              <Icon name="question" size={20} strokeWidth={1.75} />
            </span>
          )}
          <h2 id={`confirm-title-${dialog.id}`} className="confirm-dialog__title">
            {dialog.title}
          </h2>
        </header>
        {dialog.description && (
          <p className="confirm-dialog__description">{dialog.description}</p>
        )}
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={() => onCancel(dialog.id)}
          >
            {dialog.cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            className={`confirm-dialog__btn ${dialog.danger ? 'confirm-dialog__btn--danger' : 'confirm-dialog__btn--primary'}`}
            onClick={() => onConfirm(dialog.id)}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
