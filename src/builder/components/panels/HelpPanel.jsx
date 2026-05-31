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
      ['builder.help.start_2', 'Минимальная схема: «User Input» → «Агент» → «Выход» (Markdown или Telegram).'],
      ['builder.help.start_3', 'Задачу пишите в поле снизу — она попадает в узел «User Input» и течёт дальше.'],
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
      ['builder.help.link_1', 'Поток данных: «User Input → агент → выход». По нему течёт задача и результат. Циклы запрещены.'],
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
      ['builder.help.grp_tools', 'Инструменты — способности агента. Прикрепляются к агенту. Сейчас по-настоящему работает Web Search.'],
      ['builder.help.grp_logic', 'Логика — Условие (ветка Да/Нет), Условие-агент (решает сам) и Цикл (повтор с лимитом).'],
      ['builder.help.grp_flow', 'Поток — User Input (старт), Markdown (результат на экране), Telegram (доставка в чат).'],
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
    titleFb: 'Запуск: Демо и Реально',
    items: [
      ['builder.help.run_1', '«Демо» — бесплатная имитация без вызова Claude. «Реально» — настоящий запуск, тратит токены вашего ключа.'],
      ['builder.help.run_2', 'Перед реальным запуском схема проверяется: предупредит про несоединённые узлы и отсутствие агента.'],
      ['builder.help.run_3', 'Заполненный узел заливается своим цветом — сразу видно, что готово, а что нет.'],
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
          <button type="button" className="builder-palette__clear" onClick={() => setQ('')} aria-label="Очистить">
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
