import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { listAllSchedules, toggleSchedule, deleteSchedule, disableAllSchedules, getTodayUsage, listRecentRuns, clearRunHistory } from '../../services/scheduleService.js';
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
export default function AllSchedulesModal({ onClose, embedded = false, guest = false, onRequestAuth }) {
  const t = useT();
  const [items, setItems] = useState(null);
  const [confirmStopAll, setConfirmStopAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [usage, setUsage] = useState(null); // { runs, tokens } за сегодня
  const [runs, setRuns] = useState(null);   // история последних прогонов
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const refresh = useCallback(() => {
    if (guest) { setItems([]); setUsage(null); setRuns([]); return; } // у гостя в облаке ничего нет
    listAllSchedules().then(setItems).catch(() => setItems([]));
    getTodayUsage().then(setUsage).catch(() => setUsage(null));
    listRecentRuns(20).then(setRuns).catch(() => setRuns([]));
  }, [guest]);
  useEffect(() => { refresh(); }, [refresh]);

  const activeCount = (items || []).filter(s => s.enabled).length;

  const [confirmDelId, setConfirmDelId] = useState(null);
  const onToggle = async (s) => { try { await toggleSchedule(s.id, !s.enabled); refresh(); } catch { /* */ } };
  const onDelete = async (s) => { try { await deleteSchedule(s.id); setConfirmDelId(null); refresh(); } catch { /* */ } };

  const clearHistory = async () => {
    setClearing(true);
    try {
      await clearRunHistory();
      setRuns([]);
      setConfirmClear(false);
      refresh(); // освежить историю + счётчик «сегодня»
      toast.success(t('builder.allsched.historyCleared') || 'История запусков очищена');
    } catch (e) {
      toast.error((t('builder.allsched.clearErr') || 'Не удалось очистить историю') + (e?.message ? ` (${e.message})` : ''));
    } finally { setClearing(false); }
  };

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
  const MN = (t('builder.schedule.months') || 'Янв,Фев,Мар,Апр,Май,Июн,Июл,Авг,Сен,Окт,Ноя,Дек').split(',');
  const pad = (n) => String(n).padStart(2, '0');
  const fmtFreq = (s) => {
    // Показываем по местному времени человека (в базе — UTC).
    const base = new Date();
    const L = (() => { const d = new Date(Date.UTC(s.year || base.getUTCFullYear(), (s.month ?? base.getUTCMonth() + 1) - 1, s.day_of_month ?? base.getUTCDate(), s.hour ?? 0, s.minute ?? 0)); return { h: d.getHours(), m: d.getMinutes(), wd: d.getDay(), d: d.getDate(), mon: d.getMonth(), y: d.getFullYear() }; })();
    if (s.frequency === 'once') {
      const d = s.next_run_at ? new Date(s.next_run_at) : null;
      return d ? `${d.getDate()} ${MN[d.getMonth()] || ''} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
               : `${L.d} ${MN[L.mon] || ''} ${L.y} ${pad(L.h)}:${pad(L.m)}`;
    }
    if (s.frequency === 'minutes') return `${(t('builder.schedule.everyFmt') || 'Каждые {n} мин').replace('{n}', s.minute)}`;
    if (s.frequency === 'hourly') return `${t('builder.schedule.hourly') || 'Ежечасно'} :${pad(s.minute)}`;
    if (s.frequency === 'weekly') return `${WD[L.wd]} ${pad(L.h)}:${pad(L.m)}`;
    if (s.frequency === 'monthly') return `${(t('builder.schedule.monthlyFmt') || '{d} числа').replace('{d}', L.d)} ${pad(L.h)}:${pad(L.m)}`;
    if (s.frequency === 'yearly') return `${L.d} ${MN[L.mon] || ''} ${pad(L.h)}:${pad(L.m)}`;
    return `${t('builder.schedule.daily') || 'Ежедневно'} ${pad(L.h)}:${pad(L.m)}`;
  };
  const fmtTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    // По местному времени человека (раньше — сырой UTC)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const body = (
    <>
        <p className="builder-schedule__lead">
          {t('builder.allsched.lead') || 'Все автозапуски по всем вашим схемам. Они работают на сервере — даже когда компьютер выключен.'}
        </p>

        {usage && (
          <div className="builder-allsched__usage">
            <Icon name="flash" size={13} strokeWidth={1.6} />
            <span>
              {(t('builder.allsched.usageToday') || 'Сегодня: {runs} запусков · ~{tokens} токенов')
                .replace('{runs}', String(usage.runs))
                .replace('{tokens}', usage.tokens.toLocaleString())}
            </span>
          </div>
        )}

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
            guest ? (
              // Гостю список всегда пуст: автозапуски живут в аккаунте. Без
              // подсказки это выглядело как «ничего нет» без объяснения.
              <div className="builder-schedule__empty">
                <p>{t('builder.allsched.guestHint')}</p>
                {onRequestAuth && (
                  <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={onRequestAuth}>
                    {t('auth.signIn') || 'Войти'}
                  </button>
                )}
              </div>
            ) : (
              <div className="builder-schedule__empty">{t('builder.allsched.empty') || 'Автозапусков пока нет.'}</div>
            )
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
              {confirmDelId === s.id ? (
                <span className="builder-schedule__delconfirm">
                  <span className="builder-schedule__delconfirm-q">{t('builder.schedule.delConfirm') || 'Удалить?'}</span>
                  <button type="button" className="builder-btn builder-btn--danger builder-btn--small" onClick={() => onDelete(s)}>
                    {t('builder.schedule.delYes') || 'Да'}
                  </button>
                  <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={() => setConfirmDelId(null)}>
                    {t('common.cancel') || 'Отмена'}
                  </button>
                </span>
              ) : (
                <>
                  <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={() => onToggle(s)}>
                    {s.enabled ? (t('builder.schedule.pause') || 'Пауза') : (t('builder.schedule.resume') || 'Включить')}
                  </button>
                  <button type="button" className="builder-btn builder-btn--ghost builder-btn--small builder-schedule__del" onClick={() => setConfirmDelId(s.id)} aria-label={t('common.delete') || 'Удалить'}>
                    <Icon name="trash" size={13} strokeWidth={1.6} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* История последних прогонов (ручных и по расписанию) */}
        <div className="builder-allsched__history">
          <div className="builder-allsched__history-head">
            <Icon name="terminal" size={13} strokeWidth={1.6} />
            <span>{t('builder.allsched.historyTitle') || 'История запусков'}</span>
          </div>
          {runs === null && <SkeletonList rows={3} />}
          {runs !== null && runs.length === 0 && (
            <div className="builder-schedule__empty">{t('builder.allsched.historyEmpty') || 'Запусков пока не было.'}</div>
          )}
          {runs !== null && runs.map(r => (
            <div key={r.id} className={`builder-runrow builder-runrow--${r.status}`}>
              <span className={`builder-runrow__dot builder-runrow__dot--${r.status}`} aria-hidden="true">
                {r.status === 'completed' && <Icon name="check" size={11} strokeWidth={2.5} />}
                {r.status === 'failed' && <Icon name="close" size={11} strokeWidth={2.5} />}
                {(r.status === 'running' || r.status === 'pending') && <span className="builder-runrow__pulse" />}
              </span>
              <div className="builder-runrow__main">
                <span className="builder-runrow__wf">
                  {r.workflowName || (t('builder.allsched.orphan') || 'Схема удалена')}
                  <span className="builder-runrow__src">
                    {r.scheduled ? (t('builder.allsched.bySchedule') || 'по расписанию') : (t('builder.allsched.manual') || 'вручную')}
                  </span>
                </span>
                <span className="builder-runrow__meta">
                  {fmtTime(r.created_at)}
                  {r.tokens_used ? ` · ${r.tokens_used.toLocaleString()} ${t('builder.allsched.tok') || 'ток.'}` : ''}
                </span>
                {r.status === 'failed' && r.error_message && (
                  <span className="builder-runrow__err">{String(r.error_message).slice(0, 160)}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Липкий футер: очистка истории. Тёмная кнопка во всю ширину;
            красный цвет — только на шаге подтверждения. */}
        {runs !== null && runs.length > 0 && (
          <div className="builder-allsched__footer">
            {!confirmClear ? (
              <button
                type="button"
                className="builder-btn builder-btn--dark builder-allsched__clear-btn"
                onClick={() => setConfirmClear(true)}
              >
                <Icon name="trash" size={14} strokeWidth={1.75} />
                <span>{t('builder.allsched.clearHistory') || 'Очистить историю'}</span>
              </button>
            ) : (
              <div className="builder-allsched__clear-confirm">
                <span className="builder-allsched__clear-q">{t('builder.allsched.clearConfirm') || 'Очистить всю историю?'}</span>
                <div className="builder-allsched__clear-actions">
                  <button type="button" className="builder-btn builder-btn--ghost" onClick={() => setConfirmClear(false)} disabled={clearing}>
                    {t('common.cancel') || 'Отмена'}
                  </button>
                  <button type="button" className="builder-btn builder-btn--danger" onClick={clearHistory} disabled={clearing}>
                    {t('builder.allsched.clearYes') || 'Да, очистить'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
    </>
  );

  // Встроенный режим — содержимое для вкладки «Автозапуски» внутри окна Консоли
  // (без затемнения и собственной шапки: их даёт ConsoleWindow).
  if (embedded) {
    return <div className="builder-allsched builder-allsched--embed">{body}</div>;
  }

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
        {body}
      </div>
    </div>
  );
}
