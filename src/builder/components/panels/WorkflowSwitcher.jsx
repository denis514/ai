import React, { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { listWorkflows, deleteWorkflow } from '../../services/workflowStorage.js';

/**
 * WorkflowSwitcher — dropdown в header Builder.
 *
 * Показывает список сохранённых workflow (cloud если auth, localStorage если
 * anon). Действия: открыть, новый, архивировать.
 *
 * Props:
 *  • userId      — id пользователя (null = anon → localStorage)
 *  • currentId   — id текущего открытого workflow (для подсветки)
 *  • onOpen(id)  — открыть workflow
 *  • onNew()     — создать пустой
 *  • onClose()   — закрыть dropdown
 */
export default function WorkflowSwitcher({ userId, currentId, refreshKey, onOpen, onNew, onDeleted, onClose }) {
  const t = useT();
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState(false);
  const [confirmId, setConfirmId] = useState(null); // id workflow в режиме подтверждения удаления
  const ref = useRef(null);

  const refresh = useCallback(() => {
    setError(false);
    listWorkflows(userId)
      .then(setItems)
      .catch((e) => { console.error('[Builder] list failed', e); setError(true); setItems([]); });
  }, [userId]);

  // Перезагружаем при открытии и при изменении refreshKey (save/delete снаружи).
  useEffect(() => { refresh(); }, [refresh, refreshKey]);

  // Закрытие по клику вне / Esc.
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Шаг 1: клик по × → запросить подтверждение (не удаляем сразу).
  const askDelete = useCallback((e, id) => {
    e.stopPropagation();
    setConfirmId(id);
  }, []);

  // Шаг 2: подтверждено → удаляем.
  const confirmDelete = useCallback(async (e, id) => {
    e.stopPropagation();
    try {
      await deleteWorkflow(id, userId);
      setConfirmId(null);
      refresh();
      onDeleted?.(id); // уведомить родителя → обновить «Недавние» в центре
    } catch (err) {
      console.error('[Builder] delete failed', err);
    }
  }, [userId, refresh, onDeleted]);

  const cancelDelete = useCallback((e) => {
    e.stopPropagation();
    setConfirmId(null);
  }, []);

  const fmtDate = (ts) => {
    if (!ts) return '';
    try { return new Date(ts).toLocaleDateString(); } catch { return ''; }
  };

  return (
    <div className="builder-switcher" ref={ref} role="menu">
      <div className="builder-switcher__head">
        <span className="builder-switcher__title">
          {t('builder.workflows.title') || 'My workflows'}
        </span>
        {!userId && (
          <span className="builder-switcher__badge" title={t('builder.workflows.localHint') || 'Saved locally — sign in to sync'}>
            {t('builder.workflows.local') || 'Local'}
          </span>
        )}
      </div>

      <button type="button" className="builder-switcher__new" onClick={onNew}>
        <Icon name="sparkles" size={14} strokeWidth={1.5} />
        <span>{t('builder.workflows.new') || 'New workflow'}</span>
      </button>

      <div className="builder-switcher__list">
        {items === null && (
          <div className="builder-switcher__empty">{t('builder.workflows.loading') || 'Loading…'}</div>
        )}
        {items !== null && items.length === 0 && (
          <div className="builder-switcher__empty">
            {error
              ? (t('builder.workflows.error') || 'Could not load workflows')
              : (t('builder.workflows.empty') || 'No saved workflows yet')}
          </div>
        )}
        {items !== null && items.map(w => (
          confirmId === w.id ? (
            <div
              key={w.id}
              className="builder-switcher__item builder-switcher__item--confirm"
              role="alertdialog"
              aria-label={t('builder.workflows.confirmTitle') || 'Delete this workflow?'}
            >
              <span className="builder-switcher__confirm-text">
                {t('builder.workflows.confirmText') || 'Delete this workflow?'}
              </span>
              <span className="builder-switcher__confirm-actions">
                <button
                  type="button"
                  className="builder-switcher__confirm-cancel"
                  onClick={cancelDelete}
                >
                  {t('builder.workflows.confirmCancel') || 'Cancel'}
                </button>
                <button
                  type="button"
                  className="builder-switcher__confirm-yes"
                  onClick={(e) => confirmDelete(e, w.id)}
                >
                  {t('builder.workflows.confirmYes') || 'Delete'}
                </button>
              </span>
            </div>
          ) : (
            <button
              key={w.id}
              type="button"
              className={`builder-switcher__item ${w.id === currentId ? 'is-current' : ''}`}
              onClick={() => onOpen(w.id)}
              role="menuitem"
            >
              <span className="builder-switcher__item-main">
                <span className="builder-switcher__item-name">{w.name}</span>
                <span className="builder-switcher__item-date">{fmtDate(w.updatedAt)}</span>
              </span>
              <span
                className="builder-switcher__item-del"
                onClick={(e) => askDelete(e, w.id)}
                role="button"
                tabIndex={0}
                aria-label={t('builder.workflows.delete') || 'Delete'}
                title={t('builder.workflows.delete') || 'Delete'}
              >
                <Icon name="close" size={12} strokeWidth={1.75} />
              </span>
            </button>
          )
        ))}
      </div>
    </div>
  );
}
