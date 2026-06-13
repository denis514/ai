import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { listSchedules, createSchedule, toggleSchedule, deleteSchedule } from '../../services/scheduleService.js';
import { getWebhook, ensureWebhook, toggleWebhook, regenerateWebhook, deleteWebhook, webhookUrl } from '../../services/webhookService.js';
import { toast } from '../Toast.jsx';
import Skeleton, { SkeletonList } from '../Skeleton.jsx';
import AllSchedulesModal from './AllSchedulesModal.jsx';

/**
 * MonthCalendar — мини-календарь месяца (стиль Apple Reminders): шапка с
 * названием месяца и навигацией ‹ ›, строка дней недели (Пн-первый), сетка дат
 * с правильным выравниванием по дням недели. Выбранная дата — залитый кружок,
 * сегодня — обводка. `pickFull` управляет, учитывается ли год при сравнении
 * выбранного дня (для «ежемесячно» год/месяц не важны — сравниваем только число).
 */
function MonthCalendar({ viewY, viewM, onView, sel, onPick, monthsFull, dows, todayKey }) {
  const firstDow = (new Date(Date.UTC(viewY, viewM, 1)).getUTCDay() + 6) % 7; // Пн=0
  const days = new Date(Date.UTC(viewY, viewM + 1, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const prev = () => onView(viewM === 0 ? viewY - 1 : viewY, viewM === 0 ? 11 : viewM - 1);
  const next = () => onView(viewM === 11 ? viewY + 1 : viewY, viewM === 11 ? 0 : viewM + 1);
  const key = (d) => `${viewY}-${viewM}-${d}`;
  return (
    <div className="builder-cal">
      <div className="builder-cal__head">
        <span className="builder-cal__title">{monthsFull[viewM]} {viewY}</span>
        <span className="builder-cal__nav">
          <button type="button" className="builder-cal__arrow" onClick={prev} aria-label="Предыдущий месяц"><Icon name="arrow-left" size={16} strokeWidth={2} /></button>
          <button type="button" className="builder-cal__arrow" onClick={next} aria-label="Следующий месяц"><Icon name="arrow-right" size={16} strokeWidth={2} /></button>
        </span>
      </div>
      <div className="builder-cal__dows">
        {dows.map((d, i) => <span key={i} className="builder-cal__dow">{d}</span>)}
      </div>
      <div className="builder-cal__grid" role="grid">
        {cells.map((d, i) => d === null
          ? <span key={i} className="builder-cal__cell builder-cal__cell--empty" />
          : (
            <button
              key={i} type="button"
              className={`builder-cal__cell ${sel === key(d) ? 'is-sel' : ''} ${todayKey === key(d) ? 'is-today' : ''}`}
              onClick={() => onPick(viewY, viewM, d)}
              aria-pressed={sel === key(d)}
            >{d}</button>
          ))}
      </div>
    </div>
  );
}

/**
 * ScheduleModal — автозапуск схемы по расписанию (серверный планировщик).
 *
 * Запуск делает сервер (builder-scheduler по cron), а НЕ браузер — работает,
 * даже когда компьютер выключен. Здесь пользователь только задаёт частоту,
 * время и задачу + видит/выключает/удаляет свои расписания.
 *
 * Время — в UTC (подписано), чтобы совпадало с серверным cron. MVP-просто.
 */
export default function ScheduleModal({ workflowId, workflowName, locale, dockRight = 16, onClose }) {
  const t = useT();
  const [items, setItems] = useState(null);
  const [freq, setFreq] = useState('daily');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [weekday, setWeekday] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(new Date().getUTCDate()); // 1..31
  const [month, setMonth] = useState(new Date().getUTCMonth() + 1);      // 1..12
  const [year, setYear] = useState(new Date().getUTCFullYear()); // once
  // Месяц, показываемый в календаре (по умолчанию — текущий).
  const [viewY, setViewY] = useState(new Date().getUTCFullYear());
  const [viewM, setViewM] = useState(new Date().getUTCMonth());
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pending, setPending] = useState(false); // показать экран подтверждения
  const [histOpen, setHistOpen] = useState(false); // раскрыть «Все автозапуски + история»

  const [hook, setHook] = useState(undefined); // undefined=загрузка, null=нет, obj=есть
  const [hookBusy, setHookBusy] = useState(false);

  const refresh = useCallback(() => {
    listSchedules(workflowId).then(setItems).catch(() => { setItems([]); });
    getWebhook(workflowId).then(setHook).catch(() => setHook(null));
  }, [workflowId]);

  useEffect(() => { refresh(); }, [refresh]);

  const onCreateHook = async () => {
    setHookBusy(true);
    try { setHook(await ensureWebhook(workflowId, { locale })); toast.success(t('builder.webhook.created') || 'Ссылка-вебхук создана'); }
    catch (e) { toast.error((t('builder.webhook.err') || 'Не удалось создать ссылку') + (e?.message ? ` (${e.message})` : '')); }
    finally { setHookBusy(false); }
  };
  const onToggleHook = async () => {
    if (!hook) return;
    setHookBusy(true);
    try { await toggleWebhook(hook.id, !hook.enabled); setHook({ ...hook, enabled: !hook.enabled }); }
    catch { /* */ } finally { setHookBusy(false); }
  };
  const onRegenHook = async () => {
    if (!hook) return;
    setHookBusy(true);
    try { const token = await regenerateWebhook(hook.id); setHook({ ...hook, token }); toast.success(t('builder.webhook.regen') || 'Ссылка обновлена — старая больше не работает'); }
    catch { /* */ } finally { setHookBusy(false); }
  };
  const onDeleteHook = async () => {
    if (!hook) return;
    setHookBusy(true);
    try { await deleteWebhook(hook.id); setHook(null); }
    catch { /* */ } finally { setHookBusy(false); }
  };
  const onCopyHook = async () => {
    try { await navigator.clipboard.writeText(webhookUrl(hook?.token)); toast.success(t('common.copied') || 'Скопировано'); }
    catch { /* */ }
  };

  // Шаг 1: показ подтверждения (без записи). Задачу не спрашиваем — она берётся
  // из узла «Старт» схемы при каждом запуске («строго как на холсте»).
  const add = () => {
    setPending(true);
  };

  // Шаг 2: реальное создание после подтверждения.
  const confirmCreate = async () => {
    setBusy(true);
    try {
      await createSchedule({ workflowId, frequency: freq, hour, minute, weekday, dayOfMonth, month, year, tier: 's', locale });
      setPending(false);
      toast.success(t('builder.schedule.created') || 'Автозапуск создан');
      refresh();
    } catch (e) {
      toast.error((t('builder.schedule.err') || 'Не удалось создать') + (e?.message ? ` (${e.message})` : ''));
    } finally { setBusy(false); }
  };

  // Сколько запусков в день для выбранной частоты (для предупреждения о расходе).
  const runsPerDay = () => {
    if (freq === 'minutes') return Math.floor(1440 / Math.max(minute, 1));
    if (freq === 'hourly') return 24;
    if (['weekly', 'monthly', 'yearly', 'once'].includes(freq)) return null; // редкие/разовые
    return 1; // daily
  };

  const onToggle = async (s) => { try { await toggleSchedule(s.id, !s.enabled); refresh(); } catch { /* */ } };
  const [confirmDelId, setConfirmDelId] = useState(null); // id автозапуска на подтверждении удаления
  const onDelete = async (s) => { try { await deleteSchedule(s.id); setConfirmDelId(null); refresh(); } catch { /* */ } };

  const WD = (t('builder.schedule.weekdays') || 'Вс,Пн,Вт,Ср,Чт,Пт,Сб').split(',');
  const MN = (t('builder.schedule.months') || 'Янв,Фев,Мар,Апр,Май,Июн,Июл,Авг,Сен,Окт,Ноя,Дек').split(',');
  const pad = (n) => String(n).padStart(2, '0');
  // Для «Один раз»: выбранный момент и проверка, что он не в прошлом.
  const onceDate = new Date(Date.UTC(year, month - 1, dayOfMonth, hour, minute, 0, 0));
  const oncePast = freq === 'once' && onceDate.getTime() <= Date.now();

  // Режим: однократно / многократно. Внутри «многократно» — частоты.
  const mode = freq === 'once' ? 'once' : 'repeat';
  const setMode = (m) => setFreq(m === 'once' ? 'once' : 'daily');
  // Календарь показываем там, где выбирают КОНКРЕТНЫЙ день: один раз, ежемесячно,
  // ежегодно. Для недели — кружки дней недели, для день/час/минуты — только время.
  const showCal = freq === 'once' || freq === 'monthly' || freq === 'yearly';
  const monthsFull = (t('builder.schedule.monthsFull') || 'Январь,Февраль,Март,Апрель,Май,Июнь,Июль,Август,Сентябрь,Октябрь,Ноябрь,Декабрь').split(',');
  const dowsShort = (t('builder.schedule.weekdaysShort') || 'Пн,Вт,Ср,Чт,Пт,Сб,Вс').split(',');
  const now0 = new Date();
  const todayKey = `${now0.getUTCFullYear()}-${now0.getUTCMonth()}-${now0.getUTCDate()}`;
  // Ключ выбранной даты для подсветки в календаре.
  const selKey = freq === 'monthly'
    ? `${viewY}-${viewM}-${dayOfMonth}`          // любое число месяца
    : freq === 'yearly'
      ? `${viewY}-${month - 1}-${dayOfMonth}`     // месяц + число
      : `${year}-${month - 1}-${dayOfMonth}`;     // once: точная дата
  // Выбор даты в календаре: проставляем число/месяц/год + день недели.
  const pickDay = (y, m, d) => {
    setViewY(y); setViewM(m);
    setDayOfMonth(d); setMonth(m + 1); setYear(y);
    setWeekday(new Date(Date.UTC(y, m, d)).getUTCDay());
  };
  const fmtFreq = (s) => {
    if (s.frequency === 'once') {
      const d = s.next_run_at ? new Date(s.next_run_at)
        : new Date(Date.UTC(s.year || new Date().getUTCFullYear(), (s.month ?? 1) - 1, s.day_of_month ?? 1, s.hour ?? 0, s.minute ?? 0));
      return `${d.getUTCDate()} ${MN[d.getUTCMonth()] || ''} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
    }
    if (s.frequency === 'minutes') return `${(t('builder.schedule.everyFmt') || 'Каждые {n} мин').replace('{n}', s.minute)}`;
    if (s.frequency === 'hourly') return `${t('builder.schedule.hourly') || 'Ежечасно'} :${pad(s.minute)}`;
    if (s.frequency === 'weekly') return `${WD[s.weekday ?? 1]} ${pad(s.hour)}:${pad(s.minute)} UTC`;
    if (s.frequency === 'monthly') return `${(t('builder.schedule.monthlyFmt') || '{d} числа').replace('{d}', s.day_of_month ?? 1)} ${pad(s.hour)}:${pad(s.minute)} UTC`;
    if (s.frequency === 'yearly') return `${s.day_of_month ?? 1} ${MN[(s.month ?? 1) - 1] || ''} ${pad(s.hour)}:${pad(s.minute)} UTC`;
    return `${t('builder.schedule.daily') || 'Ежедневно'} ${pad(s.hour)}:${pad(s.minute)} UTC`;
  };

  // Конкретное пояснение для выбранной частоты + пример ближайших запусков.
  const helpText = () => {
    if (freq === 'once') {
      return (t('builder.schedule.helpOnce')
        || 'Один запуск в указанную дату и время ({d} {mon} {y} в {h}:{m} UTC). После выполнения автозапуск выключится сам.')
        .replaceAll('{d}', String(dayOfMonth)).replaceAll('{mon}', MN[month - 1] || '').replaceAll('{y}', String(year))
        .replaceAll('{h}', pad(hour)).replaceAll('{m}', pad(minute));
    }
    if (freq === 'minutes') {
      return (t('builder.schedule.helpMinutes')
        || 'Запуск каждые {n} минут (минимум 1). ⚠️ Очень частые запуски быстро тратят токены на вашем ключе — для теста ставьте на паузу.')
        .replaceAll('{n}', String(Math.max(minute, 1)));
    }
    if (freq === 'hourly') {
      return (t('builder.schedule.helpHourly')
        || 'Запуск раз в час, на {m}-й минуте каждого часа. Пример: 13:{m}, 14:{m}, 15:{m}… «Минута» — это не интервал, а отметка минуты часа.')
        .replaceAll('{m}', pad(minute));
    }
    if (freq === 'weekly') {
      return (t('builder.schedule.helpWeekly')
        || 'Запуск раз в неделю: {d} в {h}:{m} по UTC. Один раз каждую неделю в этот день и время.')
        .replaceAll('{d}', WD[weekday] || '').replaceAll('{h}', pad(hour)).replaceAll('{m}', pad(minute));
    }
    if (freq === 'monthly') {
      return (t('builder.schedule.helpMonthly')
        || 'Запуск раз в месяц: {dom} числа в {h}:{m} по UTC. Если в месяце нет такого числа (например 31), сработает в последний день месяца.')
        .replaceAll('{dom}', String(dayOfMonth)).replaceAll('{h}', pad(hour)).replaceAll('{m}', pad(minute));
    }
    if (freq === 'yearly') {
      return (t('builder.schedule.helpYearly')
        || 'Запуск раз в год: {dom} {mon} в {h}:{m} по UTC.')
        .replaceAll('{dom}', String(dayOfMonth)).replaceAll('{mon}', MN[month - 1] || '').replaceAll('{h}', pad(hour)).replaceAll('{m}', pad(minute));
    }
    return (t('builder.schedule.helpDaily')
      || 'Запуск раз в день в {h}:{m} по UTC. Пример: сегодня и завтра в это же время.')
      .replaceAll('{h}', pad(hour)).replaceAll('{m}', pad(minute));
  };

  return (
    <aside className="builder-sidepanel builder-sidepanel--schedule"
      style={{ right: `${dockRight}px` }}
      role="dialog" aria-label={t('builder.schedule.title') || 'Автозапуск по расписанию'}>
      <div className="builder-sidebar__header">
        <span><Icon name="clock" size={15} strokeWidth={1.6} /> {t('builder.schedule.title') || 'Автозапуск по расписанию'}</span>
        <button type="button" className="builder-panel-collapse" onClick={onClose}
          title={t('common.close') || 'Закрыть'} aria-label={t('common.close') || 'Закрыть'}>
          <Icon name="panel-right" size={15} strokeWidth={1.6} />
        </button>
      </div>
      <div className="builder-sidebar__body">

        <p className="builder-schedule__lead">
          {(t('builder.schedule.lead') || 'Схема «{name}» будет запускаться сама на сервере — даже когда компьютер выключен.').replace('{name}', workflowName || '—')}
        </p>

        {/* Форма создания — два режима + календарь + крупные часы/минуты */}
        <div className="builder-schedule__form builder-sched">
          {/* Режим: однократно / многократно */}
          <div className="builder-sched-modes" role="tablist">
            <button type="button" role="tab" aria-selected={mode === 'once'}
              className={`builder-sched-mode ${mode === 'once' ? 'is-active' : ''}`}
              onClick={() => setMode('once')}>{t('builder.schedule.modeOnce') || 'Однократно'}</button>
            <button type="button" role="tab" aria-selected={mode === 'repeat'}
              className={`builder-sched-mode ${mode === 'repeat' ? 'is-active' : ''}`}
              onClick={() => setMode('repeat')}>{t('builder.schedule.modeRepeat') || 'Многократно'}</button>
          </div>

          {/* Многократно — выбор частоты */}
          {mode === 'repeat' && (
            <div className="builder-sched-pills" role="tablist" aria-label={t('builder.schedule.freq') || 'Частота'}>
              {[
                ['minutes', t('builder.schedule.minutes') || 'Минуты'],
                ['hourly', t('builder.schedule.hourly') || 'Час'],
                ['daily', t('builder.schedule.daily') || 'День'],
                ['weekly', t('builder.schedule.weekly') || 'Неделя'],
                ['monthly', t('builder.schedule.monthly') || 'Месяц'],
                ['yearly', t('builder.schedule.yearly') || 'Год'],
              ].map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={freq === id}
                  className={`builder-sched-pill ${freq === id ? 'is-active' : ''}`}
                  onClick={() => setFreq(id)}>{label}</button>
              ))}
            </div>
          )}

          {/* Дни недели — кружочки (weekly) */}
          {freq === 'weekly' && (
            <div className="builder-sched-dows">
              {WD.map((d, i) => (
                <button key={i} type="button"
                  className={`builder-sched-dow ${weekday === i ? 'is-active' : ''}`}
                  onClick={() => setWeekday(i)} aria-pressed={weekday === i}>{d}</button>
              ))}
            </div>
          )}

          {/* Календарь месяца — для once / monthly / yearly */}
          {showCal && (
            <MonthCalendar
              viewY={viewY} viewM={viewM}
              onView={(y, m) => { setViewY(y); setViewM(m); }}
              sel={selKey} onPick={pickDay}
              monthsFull={monthsFull} dows={dowsShort} todayKey={todayKey}
            />
          )}

          {/* Крупные часы/минуты во всю ширину */}
          {freq === 'minutes' ? (
            <div className="builder-sched-clock">
              <div className="builder-sched-clock__col">
                <label>{t('builder.schedule.everyLabel') || 'Каждые'}</label>
                <input type="number" min="1" max="59" value={minute} aria-label={t('builder.schedule.everyN') || 'Интервал (мин)'}
                  onChange={(e) => setMinute(Math.min(59, Math.max(1, Number(e.target.value) || 1)))} />
                <span className="builder-sched-clock__unit">{t('builder.schedule.minUnit') || 'мин'}</span>
              </div>
            </div>
          ) : (
            <div className="builder-sched-clock">
              {freq !== 'hourly' && (
                <div className="builder-sched-clock__col">
                  <label>{t('builder.schedule.clockHours') || 'Часы'}</label>
                  <input type="number" min="0" max="23" value={hour} aria-label={t('builder.schedule.hour') || 'Час (UTC)'}
                    onChange={(e) => setHour(Math.min(23, Math.max(0, Number(e.target.value) || 0)))} />
                </div>
              )}
              <div className="builder-sched-clock__col">
                <label>{t('builder.schedule.clockMinutes') || 'Минуты'}</label>
                <input type="number" min="0" max="59" value={minute} aria-label={t('builder.schedule.minute') || 'Минута'}
                  onChange={(e) => setMinute(Math.min(59, Math.max(0, Number(e.target.value) || 0)))} />
              </div>
              <span className="builder-sched-clock__utc">UTC</span>
            </div>
          )}
          {/* Кнопка «Инструкция» под полями слева — открывает пояснение по частоте */}
          <div className="builder-schedule__row--full">
            <button
              type="button"
              className="builder-schedule__instr-btn"
              onClick={() => setShowHelp(v => !v)}
              aria-expanded={showHelp}
            >
              <Icon name="idea" size={13} strokeWidth={1.6} />
              <span>{t('builder.schedule.instruction') || 'Инструкция'}</span>
            </button>
          </div>
          {showHelp && (
            <div className="builder-schedule__help builder-schedule__row--full">
              <p className="builder-schedule__help-p">
                {t('builder.schedule.asCanvas') || 'Запустит схему как на холсте — задача берётся из узла «Старт». Меняете схему — меняется и автозапуск.'}
              </p>
              <p className="builder-schedule__help-p">{helpText()}</p>
            </div>
          )}
          {!pending ? (
            <button type="button" className="lg-btn builder-schedule__create" onClick={add} disabled={busy}>
              <span className="blob blob-r1" /><span className="blob blob-r2" /><span className="blob blob-p" />
              <span className="blob blob-d" /><span className="blob blob-o" /><span className="blob blob-a" />
              <span className="lg-btn__l">{t('builder.schedule.add') || 'Создать автозапуск'}</span>
            </button>
          ) : (
            <div className="builder-schedule__confirm builder-schedule__row--full">
              <div className="builder-schedule__confirm-title">
                <Icon name="clock" size={14} strokeWidth={1.7} />
                <span>{(t('builder.schedule.confirmFreq') || 'Запуск: {f}').replace('{f}', fmtFreq({ frequency: freq, hour, minute, weekday, day_of_month: dayOfMonth, month, year }))}</span>
              </div>
              <p className="builder-schedule__confirm-warn">
                {freq === 'once'
                  ? (t('builder.schedule.confirmWarnOnce') || 'Запустится один раз в указанное время и потратит токены на вашем ключе, затем автозапуск выключится сам.')
                  : (t('builder.schedule.confirmWarn') || 'Схема будет запускаться сама на сервере и тратить токены на вашем ключе при каждом запуске.')}
              </p>
              {oncePast && (
                <p className="builder-schedule__confirm-runs is-high">
                  {t('builder.schedule.oncePast') || '⚠️ Эта дата уже прошла — запуск произойдёт сразу же. Выберите будущую дату.'}
                </p>
              )}
              {runsPerDay() != null && (
                <p className={`builder-schedule__confirm-runs ${runsPerDay() >= 48 ? 'is-high' : ''}`}>
                  {(t('builder.schedule.confirmRuns') || '≈ {n} запусков в день').replace('{n}', String(runsPerDay()))}
                  {runsPerDay() >= 48 && ' · ' + (t('builder.schedule.confirmHigh') || '⚠️ очень часто — расход будет быстрым')}
                </p>
              )}
              <div className="builder-schedule__confirm-actions">
                <button type="button" className="builder-btn builder-btn--primary" onClick={confirmCreate} disabled={busy || oncePast}>
                  <Icon name="check" size={14} strokeWidth={1.75} />
                  <span>{t('builder.schedule.confirmYes') || 'Да, включить автозапуск'}</span>
                </button>
                <button type="button" className="builder-btn builder-btn--ghost" onClick={() => setPending(false)} disabled={busy}>
                  {t('common.cancel') || 'Отмена'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Список расписаний */}
        <div className="builder-schedule__list">
          {items === null && <SkeletonList rows={2} />}
          {items !== null && items.length === 0 && (
            <div className="builder-schedule__empty">{t('builder.schedule.empty') || 'Пока нет автозапусков.'}</div>
          )}
          {items !== null && items.map(s => (
            <div key={s.id} className={`builder-schedule__item ${s.enabled ? '' : 'is-off'}`}>
              <div className="builder-schedule__item-main">
                <span className="builder-schedule__item-name">{workflowName || (t('builder.workflows.untitled') || 'Без названия')}</span>
                <span className="builder-schedule__item-when">{fmtFreq(s)}</span>
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

        {/* Вебхук — запуск схемы по внешнему событию (секретная ссылка) */}
        <div className="builder-webhook">
          <div className="builder-webhook__head">
            <Icon name="link" size={14} strokeWidth={1.6} />
            <span>{t('builder.webhook.title') || 'Вебхук — запуск извне'}</span>
          </div>
          <p className="builder-webhook__lead">
            {t('builder.webhook.lead') || 'Секретная ссылка: POST-запрос на неё запускает схему. Данные запроса станут задачей (иначе — текст «Старта»).'}
          </p>
          {hook === undefined && <SkeletonList rows={1} />}
          {hook === null && (
            <button type="button" className="builder-btn builder-btn--primary" onClick={onCreateHook} disabled={hookBusy}>
              <Icon name="plus" size={14} strokeWidth={1.75} />
              <span>{t('builder.webhook.create') || 'Создать ссылку-вебхук'}</span>
            </button>
          )}
          {hook && (
            <>
              <div className={`builder-webhook__url ${hook.enabled ? '' : 'is-off'}`}>
                <input type="text" readOnly value={hook.enabled ? webhookUrl(hook.token) : (t('builder.webhook.disabled') || 'Выключен — включите, чтобы получить ссылку')} onFocus={(e) => e.target.select()} />
                <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={onCopyHook} disabled={!hook.enabled} aria-label={t('common.copy') || 'Копировать'}>
                  <Icon name="clipboard" size={13} strokeWidth={1.6} />
                </button>
              </div>
              <div className="builder-webhook__actions">
                <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={onToggleHook} disabled={hookBusy}>
                  {hook.enabled ? (t('builder.schedule.pause') || 'Пауза') : (t('builder.schedule.resume') || 'Включить')}
                </button>
                <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={onRegenHook} disabled={hookBusy}>
                  <Icon name="refresh" size={13} strokeWidth={1.6} />
                  <span>{t('builder.webhook.regen_btn') || 'Новая ссылка'}</span>
                </button>
                <button type="button" className="builder-btn builder-btn--ghost builder-btn--small builder-schedule__del" onClick={onDeleteHook} disabled={hookBusy} aria-label={t('common.delete') || 'Удалить'}>
                  <Icon name="trash" size={13} strokeWidth={1.6} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* История автозапусков — раскрывающийся блок в самом низу панели.
            Все автозапуски по всем схемам + история прогонов (AllSchedulesModal). */}
        <div className="builder-sched-history">
          <button
            type="button"
            className="builder-sched-history__toggle"
            onClick={() => setHistOpen(v => !v)}
            aria-expanded={histOpen}
          >
            <Icon name="clock" size={14} strokeWidth={1.6} />
            <span>{t('builder.allsched.title') || 'Все автозапуски'}</span>
            <Icon name={histOpen ? 'arrow-up' : 'arrow-down'} size={13} strokeWidth={1.75} />
          </button>
          {histOpen && (
            <div className="builder-sched-history__body">
              <AllSchedulesModal embedded />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
