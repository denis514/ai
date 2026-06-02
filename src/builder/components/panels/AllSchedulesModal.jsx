import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { listAllSchedules, toggleSchedule, deleteSchedule, disableAllSchedules } from '../../services/scheduleService.js';
import { toast } from '../Toast.jsx';
import { SkeletonList } from '../Skeleton.jsx';

/**
 * AllSchedulesModal — единый обзор ВСЕХ автозапусков пользователя по всем схемам.
 *
 * Закрывает «слепую зону»: окно расписаний (ScheduleModal) показывает только
 * открытую схему, поэтому включённое расписание на другой/удалённой схеме
 * оставалось невидимым и тикало на сервере. Здесь видно всё сразу + большая
 * кнопка «Остановить все» (аварийный стоп для серверного планировщика).
 *
 * Только чтение + выключение/удаление. Создание — в ScheduleModal (по схеме).
 */
export default function AllSchedulesModal({ onClose }) {
  const t = useT();
  const [items, setItems] = useState(null);
  const [confirmStopAll, setConfirmStopAll] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    listAllSchedules().then(setItems).catch(() => setItems([]));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const activeCount = (items || []).filter(s => s.enabled).length;

  const onToggle = async (s) => { try { await toggleSchedule(s.id, !s.enabled); refresh(); } catch { /* */ } };
  const onDelete = async (s) => { try { await deleteSchedule(s.id); refresh(); } catch { /* */ } };

  const stopAll = async () => {
    setBusy(true);
    try {
      const n = await disableAllSchedules();
      toast.success((t('builder.allsched.stoppedN') || 'Остановлено автозапусков: {n}').replace('{n}', String(n)));
      setConfirmStopAll(false);
      refresh();
    } catch (e) {
      toast.error((t('builder.allsched.stopErr') || 'Не удалось остановить') + (e?.message ? ` (${e.message})` : ''));
    } finally { setBusy(false); }
  };

  const WD = (t('builder.schedule.weekdays') || 'Вс,Пн,Вт,Ср,Чт,Пт,Сб').split(',');
  const pad = (n) => String(n).padStart(2, '0');
  const fmtFreq = (s) => {
    if (s.frequency === 'minutes') return (t('builder.schedule.everyFmt') || 'Каждые {n} мин').replace('{n}', s.minute);
    if (s.frequency === 'hourly') return `${t('builder.schedule.hourly') || 'Ежечасно'} :${pad(s.minute)}`;
    if (s.frequency === 'weekly') return `${WD[s.weekday ?? 1]} ${pad(s.hour)}:${pad(s.minute)} UTC`;
    return `${t('builder.schedule.daily') || 'Ежедневно'} ${pad(s.hour)}:${pad(s.minute)} UTC`;
  };
  const fmtTime = (iso) => {
    if (!iso) return '—';
    return String(iso).slice(0, 16).replace('T', ' ') + ' UTC';
  };

  return (
    <div className="builder-schedule-pop-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="builder-modal builder-schedule builder-allsched" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="builder-modal__header">
          <h2 className="builder-modal__title">
            <Icon name="clock" size={16} strokeWidth={1.6} /> {t('builder.allsched.title') || 'Все автозапуски'}
          </h2>
          <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={onClose} aria-label={t('common.close') || 'Закрыть'}>
            <Icon name="close" size={14} strokeWidth={1.75} />
          </button>
        </header>

        <p className="builder-schedule__lead">
          {t('builder.allsched.lead') || 'Все автозапуски по всем вашим схемам. Они работают на сервере — даже когда компьютер выключен.'}
        </p>

        {/* Сводка + аварийный стоп */}
        <div className="builder-allsched__bar">
          <span className={`builder-allsched__count ${activeCount > 0 ? 'is-active' : ''}`}>
            {activeCount > 0
              ? (t('builder.allsched.activeN') || 'Активно: {n}').replace('{n}', String(activeCount))
              : (t('builder.allsched.noneActive') || 'Активных нет')}
          </span>
          {activeCount > 0 && !confirmStopAll && (
            <button type="button" className="builder-btn builder-btn--danger builder-btn--small" onClick={() => setConfirmStopAll(true)}>
              <Icon name="close" size={13} strokeWidth={1.9} />
              <span>{t('builder.allsched.stopAll') || 'Остановить все'}</span>
            </button>
          )}
          {confirmStopAll && (
            <span className="builder-allsched__confirm">
              <span>{t('builder.allsched.stopAllConfirm') || 'Выключить все автозапуски?'}</span>
              <button type="button" className="builder-btn builder-btn--danger builder-btn--small" onClick={stopAll} disabled={busy}>
                {t('builder.allsched.stopAllYes') || 'Да, остановить'}
              </button>
              <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={() => setConfirmStopAll(false)} disabled={busy}>
                {t('common.cancel') || 'Отмена'}
              </button>
            </span>
          )}
        </div>

        <div className="builder-schedule__list">
          {items === null && <SkeletonList rows={3} />}
          {items !== null && items.length === 0 && (
            <div className="builder-schedule__empty">{t('builder.allsched.empty') || 'Автозапусков пока нет.'}</div>
          )}
          {items !== null && items.map(s => (
            <div key={s.id} className={`builder-schedule__item builder-allsched__item ${s.enabled ? '' : 'is-off'}`}>
              <div className="builder-schedule__item-main">
                <span className="builder-allsched__wf">
                  <Icon name="folder" size={12} strokeWidth={1.6} />
                  <span>{s.workflowName || (t('builder.allsched.orphan') || 'Схема удалена')}</span>
                  <span className={`builder-allsched__badge ${s.enabled ? 'is-on' : 'is-paused'}`}>
                    {s.enabled ? (t('builder.allsched.on') || 'Активно') : (t('builder.allsched.paused') || 'Пауза')}
                  </span>
                </span>
                <span className="builder-schedule__item-when">{fmtFreq(s)}</span>
                {s.input && <span className="builder-schedule__item-task">{s.input}</span>}
                <span className="builder-allsched__runs">
                  {(t('builder.allsched.lastRun') || 'Последний') + ': ' + fmtTime(s.last_run_at)}
                  {s.enabled && ' · ' + (t('builder.allsched.nextRun') || 'Следующий') + ': ' + fmtTime(s.next_run_at)}
                </span>
              </div>
              <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={() => onToggle(s)}>
                {s.enabled ? (t('builder.schedule.pause') || 'Пауза') : (t('builder.schedule.resume') || 'Включить')}
              </button>
              <button type="button" className="builder-btn builder-btn--ghost builder-btn--small builder-schedule__del" onClick={() => onDelete(s)} aria-label={t('common.delete') || 'Удалить'}>
                <Icon name="trash" size={13} strokeWidth={1.6} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
