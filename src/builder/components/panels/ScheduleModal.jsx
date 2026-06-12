import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { listSchedules, createSchedule, toggleSchedule, deleteSchedule } from '../../services/scheduleService.js';
import { getWebhook, ensureWebhook, toggleWebhook, regenerateWebhook, deleteWebhook, webhookUrl } from '../../services/webhookService.js';
import { toast } from '../Toast.jsx';
import Skeleton, { SkeletonList } from '../Skeleton.jsx';

/**
 * ScheduleModal — автозапуск схемы по расписанию (серверный планировщик).
 *
 * Запуск делает сервер (builder-scheduler по cron), а НЕ браузер — работает,
 * даже когда компьютер выключен. Здесь пользователь только задаёт частоту,
 * время и задачу + видит/выключает/удаляет свои расписания.
 *
 * Время — в UTC (подписано), чтобы совпадало с серверным cron. MVP-просто.
 */
export default function ScheduleModal({ workflowId, workflowName, locale, onClose }) {
  const t = useT();
  const [items, setItems] = useState(null);
  const [freq, setFreq] = useState('daily');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [weekday, setWeekday] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1); // 1..31 (monthly/yearly)
  const [month, setMonth] = useState(1);           // 1..12 (yearly)
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pending, setPending] = useState(false); // показать экран подтверждения

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
      await createSchedule({ workflowId, frequency: freq, hour, minute, weekday, dayOfMonth, month, tier: 's', locale });
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
    if (freq === 'weekly' || freq === 'monthly' || freq === 'yearly') return null; // редкие
    return 1; // daily
  };

  const onToggle = async (s) => { try { await toggleSchedule(s.id, !s.enabled); refresh(); } catch { /* */ } };
  const onDelete = async (s) => { try { await deleteSchedule(s.id); refresh(); } catch { /* */ } };

  const WD = (t('builder.schedule.weekdays') || 'Вс,Пн,Вт,Ср,Чт,Пт,Сб').split(',');
  const MN = (t('builder.schedule.months') || 'Янв,Фев,Мар,Апр,Май,Июн,Июл,Авг,Сен,Окт,Ноя,Дек').split(',');
  const pad = (n) => String(n).padStart(2, '0');
  const fmtFreq = (s) => {
    if (s.frequency === 'minutes') return `${(t('builder.schedule.everyFmt') || 'Каждые {n} мин').replace('{n}', s.minute)}`;
    if (s.frequency === 'hourly') return `${t('builder.schedule.hourly') || 'Ежечасно'} :${pad(s.minute)}`;
    if (s.frequency === 'weekly') return `${WD[s.weekday ?? 1]} ${pad(s.hour)}:${pad(s.minute)} UTC`;
    if (s.frequency === 'monthly') return `${(t('builder.schedule.monthlyFmt') || '{d} числа').replace('{d}', s.day_of_month ?? 1)} ${pad(s.hour)}:${pad(s.minute)} UTC`;
    if (s.frequency === 'yearly') return `${s.day_of_month ?? 1} ${MN[(s.month ?? 1) - 1] || ''} ${pad(s.hour)}:${pad(s.minute)} UTC`;
    return `${t('builder.schedule.daily') || 'Ежедневно'} ${pad(s.hour)}:${pad(s.minute)} UTC`;
  };

  // Конкретное пояснение для выбранной частоты + пример ближайших запусков.
  const helpText = () => {
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
    <div className="builder-schedule-pop-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="builder-modal builder-schedule builder-schedule--pop" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="builder-modal__header">
          <h2 className="builder-modal__title">
            <Icon name="clock" size={16} strokeWidth={1.6} /> {t('builder.schedule.title') || 'Автозапуск по расписанию'}
          </h2>
          <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={onClose} aria-label={t('common.close') || 'Закрыть'}>
            <Icon name="close" size={14} strokeWidth={1.75} />
          </button>
        </header>

        <p className="builder-schedule__lead">
          {(t('builder.schedule.lead') || 'Схема «{name}» будет запускаться сама на сервере — даже когда компьютер выключен.').replace('{name}', workflowName || '—')}
        </p>

        {/* Форма создания — визуальный пикер в стиле Apple Reminders */}
        <div className="builder-schedule__form builder-sched">
          {/* Частота — плитки */}
          <div className="builder-sched-pills" role="tablist" aria-label={t('builder.schedule.freq') || 'Частота'}>
            {[
              ['minutes', t('builder.schedule.minutes') || 'Минуты'],
              ['hourly', t('builder.schedule.hourly') || 'Час'],
              ['daily', t('builder.schedule.daily') || 'День'],
              ['weekly', t('builder.schedule.weekly') || 'Неделя'],
              ['monthly', t('builder.schedule.monthly') || 'Месяц'],
              ['yearly', t('builder.schedule.yearly') || 'Год'],
            ].map(([id, label]) => (
              <button
                key={id} type="button" role="tab" aria-selected={freq === id}
                className={`builder-sched-pill ${freq === id ? 'is-active' : ''}`}
                onClick={() => setFreq(id)}
              >{label}</button>
            ))}
          </div>

          {/* Дни недели — кружочки (weekly) */}
          {freq === 'weekly' && (
            <div className="builder-sched-dows">
              {WD.map((d, i) => (
                <button
                  key={i} type="button"
                  className={`builder-sched-dow ${weekday === i ? 'is-active' : ''}`}
                  onClick={() => setWeekday(i)}
                  aria-pressed={weekday === i}
                >{d}</button>
              ))}
            </div>
          )}

          {/* Месяцы — чипы (yearly) */}
          {freq === 'yearly' && (
            <div className="builder-sched-months">
              {MN.map((m, i) => (
                <button
                  key={i} type="button"
                  className={`builder-sched-month ${month === i + 1 ? 'is-active' : ''}`}
                  onClick={() => setMonth(i + 1)}
                  aria-pressed={month === i + 1}
                >{m}</button>
              ))}
            </div>
          )}

          {/* Число месяца — мини-календарь 1..31 (monthly/yearly) */}
          {(freq === 'monthly' || freq === 'yearly') && (
            <div className="builder-sched-grid" role="grid" aria-label={t('builder.schedule.dayOfMonth') || 'Число месяца'}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <button
                  key={d} type="button"
                  className={`builder-sched-day ${dayOfMonth === d ? 'is-active' : ''}`}
                  onClick={() => setDayOfMonth(d)}
                  aria-pressed={dayOfMonth === d}
                >{d}</button>
              ))}
            </div>
          )}

          {/* Время / интервал */}
          {freq === 'minutes' ? (
            <div className="builder-sched-time">
              <span>{t('builder.schedule.everyLabel') || 'Каждые'}</span>
              <input type="number" min="1" max="59" value={minute}
                onChange={(e) => setMinute(Math.min(59, Math.max(1, Number(e.target.value) || 1)))} />
              <span>{t('builder.schedule.minUnit') || 'мин'}</span>
            </div>
          ) : freq === 'hourly' ? (
            <div className="builder-sched-time">
              <span>{t('builder.schedule.atMinute') || 'на минуте'}</span>
              <input type="number" min="0" max="59" value={minute}
                onChange={(e) => setMinute(Math.min(59, Math.max(0, Number(e.target.value) || 0)))} />
            </div>
          ) : (
            <div className="builder-sched-time">
              <span>{t('builder.schedule.atTime') || 'в'}</span>
              <input type="number" min="0" max="23" value={hour}
                onChange={(e) => setHour(Math.min(23, Math.max(0, Number(e.target.value) || 0)))} />
              <span className="builder-sched-time__colon">:</span>
              <input type="number" min="0" max="59" value={minute}
                onChange={(e) => setMinute(Math.min(59, Math.max(0, Number(e.target.value) || 0)))} />
              <span className="builder-sched-time__utc">UTC</span>
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
            <button type="button" className="builder-btn builder-btn--primary" onClick={add} disabled={busy}>
              <Icon name="check" size={14} strokeWidth={1.75} />
              <span>{t('builder.schedule.add') || 'Создать автозапуск'}</span>
            </button>
          ) : (
            <div className="builder-schedule__confirm builder-schedule__row--full">
              <div className="builder-schedule__confirm-title">
                <Icon name="clock" size={14} strokeWidth={1.7} />
                <span>{(t('builder.schedule.confirmFreq') || 'Запуск: {f}').replace('{f}', fmtFreq({ frequency: freq, hour, minute, weekday, day_of_month: dayOfMonth, month }))}</span>
              </div>
              <p className="builder-schedule__confirm-warn">
                {t('builder.schedule.confirmWarn') || 'Схема будет запускаться сама на сервере и тратить токены на вашем ключе при каждом запуске.'}
              </p>
              {runsPerDay() != null && (
                <p className={`builder-schedule__confirm-runs ${runsPerDay() >= 48 ? 'is-high' : ''}`}>
                  {(t('builder.schedule.confirmRuns') || '≈ {n} запусков в день').replace('{n}', String(runsPerDay()))}
                  {runsPerDay() >= 48 && ' · ' + (t('builder.schedule.confirmHigh') || '⚠️ очень часто — расход будет быстрым')}
                </p>
              )}
              <div className="builder-schedule__confirm-actions">
                <button type="button" className="builder-btn builder-btn--primary" onClick={confirmCreate} disabled={busy}>
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
              <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={() => onToggle(s)}>
                {s.enabled ? (t('builder.schedule.pause') || 'Пауза') : (t('builder.schedule.resume') || 'Включить')}
              </button>
              <button type="button" className="builder-btn builder-btn--ghost builder-btn--small builder-schedule__del" onClick={() => onDelete(s)} aria-label={t('common.delete') || 'Удалить'}>
                <Icon name="trash" size={13} strokeWidth={1.6} />
              </button>
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
      </div>
    </div>
  );
}
