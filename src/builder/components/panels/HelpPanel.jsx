import React, { useMemo, useState } from 'react';
import Icon from '../../../components/Icon.jsx';

/**
 * HelpPanel — встроенная энциклопедия Builder: как соединять узлы, типы связей,
 * что делает каждая группа, частые сценарии и ошибки. Раскрывающиеся секции +
 * поиск. Контент берётся из i18n (builder.help.*), с RU-фолбэками.
 *
 * Цель: снять кривую входа — обучение прямо в конструкторе (ров Atlas).
 */

// Секции: ключ i18n заголовка + массив пунктов (i18n + фолбэк).
const SECTIONS = [
  {
    id: 'start',
    icon: 'flash',
    titleKey: 'builder.help.s_start',
    titleFb: 'С чего начать',
    items: [
      ['builder.help.start_1', 'Слева на вкладке «Узлы» перетащите узел на холст или кликните по нему — он добавится в центр.'],
      ['builder.help.start_2', 'Минимальная схема: «Старт» → «Агент» → «Выход» (Markdown, Telegram, Email или Календарь).'],
      ['builder.help.start_3', 'Задачу пишут внутри узла «Старт»: кликните по нему — справа откроется поле задачи. Отдельного поля снизу больше нет.'],
      ['builder.help.start_4', 'Схема сохраняется сама — кнопки «Сохранить» нет. Название схемы — по центру сверху, там же список «Мои workflow».'],
    ],
  },
  {
    id: 'connect',
    icon: 'link',
    titleKey: 'builder.help.s_connect',
    titleFb: 'Как соединять узлы',
    items: [
      ['builder.help.conn_1', 'Наведите на узел — по краям появятся кружки-порты. Тяните линию от одного узла к другому.'],
      ['builder.help.conn_2', 'Можно тянуть с любой стороны. Главный (родитель) — тот узел, ОТ которого вы потянули; анимация линии идёт от него.'],
      ['builder.help.conn_3', 'Чтобы разорвать связь — наведите на линию и нажмите красный кружок. Узлы останутся.'],
      ['builder.help.conn_4', 'Если соединить нельзя — при перетаскивании всплывёт подсказка с причиной.'],
    ],
  },
  {
    id: 'links',
    icon: 'branch',
    titleKey: 'builder.help.s_links',
    titleFb: 'Два типа связей',
    items: [
      ['builder.help.link_1', 'Поток данных: «Старт → агент → выход». По нему течёт задача и результат. Циклы запрещены.'],
      ['builder.help.link_2', 'Прикрепление способности: «инструмент ↔ агент». Так агент получает умение (поиск в вебе, файлы и т.д.). По этой связи данные не текут.'],
    ],
  },
  {
    id: 'groups',
    icon: 'grid',
    titleKey: 'builder.help.s_groups',
    titleFb: 'Группы узлов',
    items: [
      ['builder.help.grp_agents', 'Агенты — делают основную работу (думают, пишут, анализируют). Каждому задаётся инструкция.'],
      ['builder.help.grp_tools', 'Инструменты — способности агента, прикрепляются к нему сбоку. Работают: Веб-поиск, Файлы, Зрение, Память, MCP-коннектор.'],
      ['builder.help.grp_logic', 'Логика — Условие (ветка Да/Нет), Условие-агент (решает сам) и Цикл (повтор с лимитом).'],
      ['builder.help.grp_flow', 'Поток — Старт и выходы: Markdown (на экран), Telegram, Email, Google Календарь.'],
    ],
  },
  {
    id: 'variables',
    icon: 'developer',
    titleKey: 'builder.help.s_vars',
    titleFb: 'Переменные',
    items: [
      ['builder.help.var_1', 'Переменная — это подставляемое значение. Пишете {{имя}} в задаче или в инструкции агента — при запуске оно заменяется на заданное значение.'],
      ['builder.help.var_2', 'Где задавать: кликните узел «Старт» → блок «Переменные» → «Добавить переменную». Слева впишите имя (без скобок), справа — значение.'],
      ['builder.help.var_3', 'Зачем: одна схема под разные данные. Пример — в задаче «Погода в {{город}}» меняете только значение {{город}}, саму схему не трогаете.'],
      ['builder.help.var_4', 'Встроенные переменные есть всегда: {{input}} — текст самой задачи, {{today}} или {{date}} — сегодняшняя дата. Их добавлять не нужно.'],
      ['builder.help.var_5', 'Имя — латиница, цифры, дефис. Если {{плейсхолдер}} не задан — он останется в тексте как есть и не сломает запуск.'],
    ],
  },
  {
    id: 'logic',
    icon: 'branch',
    titleKey: 'builder.help.s_logic',
    titleFb: 'Условие и Цикл',
    items: [
      ['builder.help.logic_1', 'Условие = один вопрос и два выхода: зелёный «Да», красный «Нет». Оператор: содержит / не содержит / равно.'],
      ['builder.help.logic_2', 'Три исхода = два Условия цепочкой (ветка «Нет» ведёт во второе).'],
      ['builder.help.logic_3', 'Цикл повторяет цепочку: выберите «вернуться к» и число повторов (до 8). Каждый повтор получает прошлый результат.'],
    ],
  },
  {
    id: 'run',
    icon: 'flash',
    titleKey: 'builder.help.s_run',
    titleFb: 'Запуск, расписание, сохранение',
    items: [
      ['builder.help.run_1', '«Запуск» по-настоящему вызывает Claude и тратит токены вашего ключа. Ключ подключается в разделе с замком сверху.'],
      ['builder.help.run_2', 'Размер ответа (S / M / L) и примерную цену видно в узле «Старт». Перед запуском схема проверяется на несоединённые узлы и отсутствие агента.'],
      ['builder.help.run_3', 'Рядом с «Запуск» — часики: автозапуск по расписанию (например, каждое утро). Работает на сервере, даже когда сайт закрыт.'],
      ['builder.help.run_4', 'Сохранение автоматическое. Когда схема сохранилась — под шапкой коротко мелькает «Сохранено». Cmd/Ctrl+S сохраняет сразу.'],
    ],
  },
  {
    id: 'keys',
    icon: 'lock',
    titleKey: 'builder.help.s_keys',
    titleFb: 'Ключи и подключения',
    items: [
      ['builder.help.keys_1', 'Кнопка с замком сверху — ваши ключи и подключения: ключ Claude (нужен для запуска), Telegram, Email (Resend), Google Календарь, MCP-серверы.'],
      ['builder.help.keys_2', 'Выходы Telegram / Email / Календарь и MCP-коннектор работают только после подключения в этом разделе. Ключи хранятся в зашифрованном виде.'],
    ],
  },
  {
    id: 'mistakes',
    icon: 'close',
    titleKey: 'builder.help.s_mistakes',
    titleFb: 'Частые ошибки',
    items: [
      ['builder.help.mis_1', 'Инструмент стоит «между» агентами в потоке. Нет — инструмент прикрепляется сбоку к агенту.'],
      ['builder.help.mis_2', 'Узел висит без связей — поток до него не дойдёт. Соедините его с цепочкой.'],
      ['builder.help.mis_3', 'Telegram: адрес чата для лички — только числовой ID; @имя — лишь для каналов, где бот админ.'],
      ['builder.help.mis_4', '{{переменная}} написана, но не задана в «Старт» — останется в тексте как есть. Задайте её в блоке «Переменные».'],
    ],
  },
];

export default function HelpPanel({ t }) {
  const [open, setOpen] = useState(() => new Set(['start', 'connect']));
  const [q, setQ] = useState('');

  const toggle = (id) => setOpen(s => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const query = q.trim().toLowerCase();
  const sections = useMemo(() => {
    if (!query) return SECTIONS;
    return SECTIONS
      .map(s => {
        const items = s.items.filter(([k, fb]) => ((t(k) || fb).toLowerCase().includes(query)));
        const titleHit = (t(s.titleKey) || s.titleFb).toLowerCase().includes(query);
        return titleHit ? s : { ...s, items };
      })
      .filter(s => s.items.length > 0);
  }, [query, t]);

  return (
    <div className="builder-help">
      <div className="builder-palette__search">
        <Icon name="search" size={14} strokeWidth={1.75} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('builder.help.search') || 'Поиск по справке…'}
          aria-label={t('builder.help.search') || 'Поиск по справке'}
        />
        {q && (
          <button type="button" className="builder-palette__clear" onClick={() => setQ('')} aria-label={t('common.clear') || 'Очистить'}>
            <Icon name="close" size={12} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="builder-help__body">
        {sections.length === 0 && (
          <div className="builder-palette__empty">{t('builder.help.noResults') || 'Ничего не найдено'}</div>
        )}
        {sections.map(s => {
          const isOpen = open.has(s.id) || !!query;
          return (
            <div key={s.id} className="builder-help__section">
              <button
                type="button"
                className="builder-help__head"
                onClick={() => toggle(s.id)}
                aria-expanded={isOpen}
              >
                <span className="builder-help__head-icon"><Icon name={s.icon} size={14} strokeWidth={1.6} /></span>
                <span className="builder-help__head-title">{t(s.titleKey) || s.titleFb}</span>
                <Icon name={isOpen ? 'arrow-down' : 'arrow-right'} size={12} strokeWidth={1.75} />
              </button>
              {isOpen && (
                <ul className="builder-help__list">
                  {s.items.map(([k, fb], i) => (
                    <li key={i}>{t(k) || fb}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
