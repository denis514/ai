import React, { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme.js';
import { useHashRoute } from '../hooks/useHashRoute.js';
import Icon from '../components/Icon.jsx';
import InlineText from '../components/InlineText.jsx';
import PlanetLogo from '../components/PlanetLogo.jsx';
import Loader from '../components/Loader.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import './StyleGuide.css';

/**
 * StyleGuide — внутренний «эталон» компонентов и токенов 105 Atlas.
 *
 * Назначение: единый источник правды по дизайну. Показывает РЕАЛЬНЫЕ
 * CSS-переменные и классы из App.css в светлой и тёмной теме — ничего
 * не дублируется и не выдумывается. Меняешь токен в App.css → эталон
 * обновляется сам.
 *
 * Доступ: только в режиме разработки (npm run dev → /styleguide).
 * В публичную сборку ветка не попадает (guard import.meta.env.DEV в App.jsx).
 * Навигация на русском, только для внутреннего пользования.
 */

// Разделы навигации. id используется и для якоря, и для прокрутки.
const SECTIONS = [
  { id: 'colors',    label: 'Цвета и поверхности' },
  { id: 'lines',     label: 'Линии связей' },
  { id: 'text',      label: 'Текст' },
  { id: 'borders',   label: 'Границы' },
  { id: 'accent',    label: 'Акцент' },
  { id: 'shadows',   label: 'Тени' },
  { id: 'radii',     label: 'Радиусы' },
  { id: 'type',      label: 'Типографика' },
  { id: 'buttons',   label: 'Кнопки' },
  { id: 'chips',     label: 'Чипы и бейджи' },
  { id: 'fab',       label: 'FAB-кнопки' },
  { id: 'controls',  label: 'Чекбоксы и радио' },
  { id: 'language',  label: 'Переключатель языка' },
  { id: 'links',     label: 'Ссылки' },
  { id: 'inlinks',   label: 'Инлайновые ссылки' },
  { id: 'sphere',    label: 'Сфера-логотип' },
  { id: 'dots',      label: 'Точечный фон' },
  { id: 'buildercode', label: 'Код схемы (Builder)' },
];

// Токены ровно как в App.css :root (имя → описание).
const COLOR_TOKENS = [
  ['--bg', 'Фон холста'],
  ['--surface', 'Поверхность: карточки, панели'],
  ['--surface-2', 'Поверхность 2: чуть глубже'],
  ['--surface-3', 'Поверхность 3: ещё глубже'],
  ['--bg-grid', 'Цвет сетки (legacy)'],
];
const LINE_TOKENS = [
  ['--line', 'Связь между узлами'],
  ['--line-soft', 'Связь приглушённая'],
  ['--line-deep', 'Связь насыщенная'],
];
const TEXT_TOKENS = [
  ['--text', 'Основной текст'],
  ['--text-muted', 'Вторичный текст'],
  ['--text-dim', 'Третичный / подписи'],
];
const BORDER_TOKENS = [
  ['--border', 'Граница обычная'],
  ['--border-strong', 'Граница контрастная'],
];
const ACCENT_TOKENS = [
  ['--accent', 'Акцент бренда (терракот)'],
  ['--accent-soft', 'Акцент мягкий (подложка)'],
];
const SHADOW_TOKENS = [
  ['--shadow-sm', 'Тень малая'],
  ['--shadow-md', 'Тень средняя'],
  ['--shadow-lg', 'Тень крупная'],
];
const RADII_TOKENS = [
  ['--radius-sm', 'Малый'],
  ['--radius-md', 'Средний'],
  ['--radius', 'Базовый'],
  ['--radius-lg', 'Крупный'],
  ['--radius-pill', 'Пилюля'],
];

/** Считать актуальные значения CSS-переменных с :root (= правда из App.css). */
function useTokens(names, dep) {
  const [map, setMap] = useState({});
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const next = {};
    names.forEach(n => { next[n] = cs.getPropertyValue(n).trim(); });
    setMap(next);
  }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps
  return map;
}

function Swatch({ name, desc, value, kind }) {
  // kind: 'color' | 'line' | 'border' | 'text'
  let preview;
  if (kind === 'text') {
    preview = <span className="sg-swatch__text" style={{ color: `var(${name})` }}>Аа Бб 105</span>;
  } else if (kind === 'border') {
    preview = <span className="sg-swatch__box" style={{ border: `2px solid var(${name})`, background: 'var(--surface)' }} />;
  } else if (kind === 'line') {
    preview = <span className="sg-swatch__line" style={{ background: `var(${name})` }} />;
  } else {
    preview = <span className="sg-swatch__box" style={{ background: `var(${name})` }} />;
  }
  return (
    <div className="sg-swatch">
      {preview}
      <div className="sg-swatch__meta">
        <code className="sg-swatch__name">{name}</code>
        <span className="sg-swatch__val">{value || '—'}</span>
        <span className="sg-swatch__desc">{desc}</span>
      </div>
    </div>
  );
}

export default function StyleGuide() {
  const { theme, setThemeMode } = useTheme();
  const [, setRoute] = useHashRoute();
  // Живая навигация: клик по инлайновой ссылке реально открывает раздел в Atlas.
  const onNavigate = {
    node:     id => setRoute({ type: 'node', id }),
    tutorial: id => setRoute({ type: 'tutorial', id }),
    prompt:   id => setRoute({ type: 'prompt', id }),
  };
  const allNames = [
    ...COLOR_TOKENS, ...LINE_TOKENS, ...TEXT_TOKENS,
    ...BORDER_TOKENS, ...ACCENT_TOKENS, ...SHADOW_TOKENS, ...RADII_TOKENS,
  ].map(([n]) => n);
  const tokens = useTokens(allNames, theme);

  const swatches = (list, kind) => (
    <div className="sg-grid">
      {list.map(([name, desc]) => (
        <Swatch key={name} name={name} desc={desc} value={tokens[name]} kind={kind} />
      ))}
    </div>
  );

  return (
    <div className="sg" data-sg-theme={theme}>
      {/* SVG-фильтр «жидкого стекла» для Hero-кнопки (.lg-btn::before) */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="liquid-displace" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.025" numOctaves="2" seed="3" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.2" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <aside className="sg-nav">
        <div className="sg-nav__head">
          <span className="sg-nav__sphere" aria-hidden="true">
            <span className="mm-sphere__inner">
              <span className="planet--live">
                <span className="pl-liquid">
                  <span className="blob b-a" /><span className="blob b-b" /><span className="blob b-c" /><span className="blob b-d" /><span className="blob b-e" /><span className="blob b-f" />
                  <span className="blob b-a2" /><span className="blob b-b2" /><span className="blob b-c2" /><span className="blob b-d2" /><span className="blob b-e2" /><span className="blob b-f2" />
                </span>
              </span>
            </span>
          </span>
          <div>
            <div className="sg-nav__title">Эталон 105&nbsp;Atlas</div>
            <div className="sg-nav__sub">источник правды по дизайну</div>
          </div>
        </div>

        <div className="sg-theme">
          <button
            className={`sg-theme__btn${theme === 'light' ? ' is-active' : ''}`}
            onClick={() => setThemeMode('light')}
          >Светлая</button>
          <button
            className={`sg-theme__btn${theme === 'dark' ? ' is-active' : ''}`}
            onClick={() => setThemeMode('dark')}
          >Тёмная</button>
        </div>

        <nav className="sg-nav__list">
          {SECTIONS.map(s => (
            <a key={s.id} href={`#sg-${s.id}`} className="sg-nav__link">{s.label}</a>
          ))}
        </nav>

        <a className="sg-nav__back" href="/">← Вернуться в Atlas</a>
      </aside>

      <main className="sg-main">
        <header className="sg-hero">
          <h1>Эталон компонентов</h1>
          <p>Живой справочник по токенам и примитивам 105&nbsp;Atlas. Всё ниже —
             реальные стили из приложения. Переключайте тему слева, чтобы свериться
             со светлым и тёмным режимом.</p>
        </header>

        <Section id="colors" title="Цвета и поверхности"
          note="Фон, поверхности карточек и панелей. Значения читаются прямо из App.css.">
          {swatches(COLOR_TOKENS, 'color')}
        </Section>

        <Section id="lines" title="Линии связей"
          note="Цвета рёбер между узлами карты.">
          {swatches(LINE_TOKENS, 'line')}
        </Section>

        <Section id="text" title="Текст"
          note="Три уровня контраста текста.">
          {swatches(TEXT_TOKENS, 'text')}
        </Section>

        <Section id="borders" title="Границы"
          note="Обводки карточек, полей, разделители.">
          {swatches(BORDER_TOKENS, 'border')}
        </Section>

        <Section id="accent" title="Акцент"
          note="Терракотовый акцент бренда и его мягкая подложка.">
          {swatches(ACCENT_TOKENS, 'color')}
        </Section>

        <Section id="shadows" title="Тени"
          note="Три уровня высоты. Карточки на белой поверхности.">
          <div className="sg-grid">
            {SHADOW_TOKENS.map(([name, desc]) => (
              <div key={name} className="sg-swatch">
                <span className="sg-swatch__box sg-shadow" style={{ boxShadow: `var(${name})` }} />
                <div className="sg-swatch__meta">
                  <code className="sg-swatch__name">{name}</code>
                  <span className="sg-swatch__val">{tokens[name]}</span>
                  <span className="sg-swatch__desc">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="radii" title="Радиусы"
          note="Скругления — от мелких до пилюли.">
          <div className="sg-grid">
            {RADII_TOKENS.map(([name, desc]) => (
              <div key={name} className="sg-swatch">
                <span className="sg-swatch__box sg-radius" style={{ borderRadius: `var(${name})` }} />
                <div className="sg-swatch__meta">
                  <code className="sg-swatch__name">{name}</code>
                  <span className="sg-swatch__val">{tokens[name]}</span>
                  <span className="sg-swatch__desc">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Типографика"
          note="Системный шрифт. Ниже — реальные размеры из компонентов.">
          <div className="sg-type">
            <div className="sg-type__row" style={{ fontSize: 28, fontWeight: 600 }}>Заголовок раздела · 28px / 600</div>
            <div className="sg-type__row" style={{ fontSize: 18, fontWeight: 600 }}>Подзаголовок · 18px / 600</div>
            <div className="sg-type__row" style={{ fontSize: 15 }}>Основной текст · 15px / 400</div>
            <div className="sg-type__row" style={{ fontSize: 13.5, fontWeight: 500 }}>Кнопка · 13.5px / 500</div>
            <div className="sg-type__row" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Чип / подпись · 12px · text-muted</div>
          </div>
        </Section>

        <Section id="buttons" title="Кнопки"
          note="Реальные классы .btn, .btn--primary, .btn--ghost.">
          <div className="sg-row">
            <button className="btn btn--primary">Основная</button>
            <button className="btn">Обычная</button>
            <button className="btn btn--ghost">Призрак</button>
            <button className="btn" disabled>Выключена</button>
          </div>
          <div className="sg-row" style={{ marginTop: 22 }}>
            <button className="lg-btn lg-btn--lg" type="button">
              <span className="blob blob-r1" /><span className="blob blob-r2" /><span className="blob blob-p" />
              <span className="blob blob-d" /><span className="blob blob-o" /><span className="blob blob-a" />
              <span className="lg-btn__l">Войти в Atlas <span className="arr">→</span></span>
            </button>
            <button className="lg-btn" type="button">
              <span className="blob blob-r1" /><span className="blob blob-r2" /><span className="blob blob-p" />
              <span className="blob blob-d" /><span className="blob blob-o" /><span className="blob blob-a" />
              <span className="lg-btn__l">Hero · обычный</span>
            </button>
          </div>
          <p className="sg-hint">Hero Liquid Glass — бренд-CTA с анимацией (как «Войти в Atlas» на лендинге).</p>
        </Section>

        <Section id="loader" title="Загрузка (3 точки)"
          note="Единый индикатор для мелких мест (кнопки, модалки, инлайн): компонент Loader, три терракотовые точки «волной». size: sm / md / lg, опц. label. iOS-safe (только transform/opacity), при reduced-motion — статичные точки.">
          <div className="sg-row" style={{ gap: 36, alignItems: 'flex-end' }}>
            <Loader size="sm" label="sm" />
            <Loader size="md" label="md" />
            <Loader size="lg" label="lg" />
          </div>
          <p className="sg-hint">Полноэкранную загрузку рисует LoadingScreen (импульс по ветвям), для списков — класс .skeleton. Этот Loader — для точечных мест.</p>
        </Section>

        <Section id="chips" title="Чипы и бейджи"
          note="Реальные классы .chip, .chip.is-active, .chip__dot.">
          <div className="sg-row">
            <span className="chip"><span className="chip__dot" style={{ background: 'var(--accent)' }} />Основы</span>
            <span className="chip is-active">Активный</span>
            <span className="chip"><span className="chip__dot" style={{ background: 'var(--line)' }} />Настройка</span>
            <span className="chip">Промпты</span>
          </div>
        </Section>

        <Section id="fab" title="FAB-кнопки"
          note="Единый стандарт плавающих кнопок: круг 52×52, фон --surface, граница, тень --shadow-lg. Применяется к кнопке профиля (.profile-fab__btn) и мобильным FAB (.fab__btn) — один размер и стиль.">
          <div className="sg-row">
            <button type="button" className="profile-fab__btn" aria-label="FAB">
              <Icon name="sparkles" size={22} strokeWidth={1.5} />
            </button>
            <button type="button" className="profile-fab__btn" aria-label="FAB">
              <Icon name="search" size={22} strokeWidth={1.5} />
            </button>
            <button type="button" className="profile-fab__btn" aria-label="FAB">
              <Icon name="settings" size={22} strokeWidth={1.5} />
            </button>
          </div>
          <p className="sg-hint">Размер 52×52, скругление 50%, граница 1px, тень --shadow-lg. Иконка ~22px.</p>
        </Section>

        <Section id="controls" title="Чекбоксы и радио"
          note="Реальные классы .ctrl + .ctrl__box (/.ctrl__box--radio). На токенах бренда.">
          <div className="sg-controls">
            <label className="ctrl">
              <input type="checkbox" defaultChecked />
              <span className="ctrl__box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              Выбрано
            </label>
            <label className="ctrl">
              <input type="checkbox" />
              <span className="ctrl__box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              Не выбрано
            </label>
            <label className="ctrl">
              <input type="checkbox" defaultChecked disabled />
              <span className="ctrl__box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              Выключено
            </label>
          </div>
          <div className="sg-controls" style={{ marginTop: 14 }}>
            <label className="ctrl">
              <input type="radio" name="sg-demo-radio" defaultChecked />
              <span className="ctrl__box ctrl__box--radio"><span className="ctrl__dot" /></span>
              Вариант A
            </label>
            <label className="ctrl">
              <input type="radio" name="sg-demo-radio" />
              <span className="ctrl__box ctrl__box--radio"><span className="ctrl__dot" /></span>
              Вариант B
            </label>
            <label className="ctrl">
              <input type="radio" name="sg-demo-radio-2" defaultChecked disabled />
              <span className="ctrl__box ctrl__box--radio"><span className="ctrl__dot" /></span>
              Выключено
            </label>
          </div>
        </Section>

        <Section id="language" title="Переключатель языка"
          note="Единый компонент <LanguageSwitcher>. Кнопка-глобус — КРУГЛАЯ 44px (стекло + тень), одинаковая ВЕЗДЕ: Atlas, Builder, аккаунт, лендинг, админка. Класс .lang-switcher__btn — единственный источник стиля. НЕ переопределять локально. Меняет язык глобально (один на всю систему) + синхронит профиль у залогиненных.">
          <div className="sg-langrow">
            <LanguageSwitcher title="Язык" />
            <span className="sg-langrow__hint">Клик → выпадашка с языками, галочка слева у активного.</span>
          </div>
        </Section>

        <Section id="links" title="Ссылки"
          note="Реальные классы .link и .link--muted. Ссылки живые — открывают разделы Atlas.">
          <div className="sg-links">
            <p>Текст с <a href="/courses" className="link"
               onClick={e => { e.preventDefault(); setRoute({ type: 'courses' }); }}>обычной ссылкой</a> внутри
               абзаца — акцент бренда, подчёркивание при наведении. Клик откроет «Курсы».</p>
            <p>И вариант <a href="/library" className="link link--muted"
               onClick={e => { e.preventDefault(); setRoute({ type: 'library' }); }}>приглушённой ссылки</a> для
               второстепенных переходов. Клик откроет «Библиотеку промптов».</p>
          </div>
        </Section>

        <Section id="inlinks" title="Инлайновые ссылки"
          note="Живой компонент InlineText.jsx. Наведите — появится настоящее превью из данных; клик откроет раздел в Atlas. Три вида: узел, туториал, промпт.">
          <InlineText
            as="div"
            className="sg-inlink-live"
            onNavigate={onNavigate}
            text={'Узел карты: [[node:sys-rag-architecture]]. Туториал: [[tutorial:course-b-anthropic]]. Готовый промпт: [[prompt:create-project]].'}
          />
          <p className="sg-hint">Наведите курсор на любую ссылку выше — карточка-превью подтянется из реальных данных. Клик уводит в соответствующий раздел Atlas.</p>
        </Section>

        <Section id="sphere" title="Сфера-логотип"
          note="Анимированная планета день/ночь — фирменный логотип. Один компонент PlanetLogo (масштабируется под размер). Та же сфера в корне карты, на лендинге и в шапках Atlas / Agent Builder.">
          <div className="sg-sphere-demo">
            <div className="sg-logo-item">
              <PlanetLogo size={96} />
              <span className="sg-logo-cap">96 — крупный</span>
            </div>
            <div className="sg-logo-item">
              <PlanetLogo size={64} />
              <span className="sg-logo-cap">64 — корень карты</span>
            </div>
            <div className="sg-logo-item">
              <PlanetLogo size={32} />
              <span className="sg-logo-cap">32 — средний</span>
            </div>
            <div className="sg-logo-item">
              <PlanetLogo size={22} />
              <span className="sg-logo-cap">22 — шапка</span>
            </div>
          </div>
          <p className="sg-hint">Логотип в шапке: PlanetLogo рядом с «Atlas» и «Agent Builder».</p>
          <div className="sg-logo-inline">
            <PlanetLogo size={22} />
            <strong>Atlas</strong>
            <span className="sg-logo-sep" />
            <PlanetLogo size={22} />
            <strong>Agent Builder</strong>
          </div>
        </Section>

        <Section id="dots" title="Точечный фон"
          note="Единый фон холста Atlas и Builder. Переменные --dot-color / --dot-gap / --dot-radius (index.css).">
          <div className="sg-dots dot-canvas-bg" />
          <div className="sg-grid" style={{ marginTop: 16 }}>
            {['--dot-color', '--dot-gap', '--dot-radius'].map(name => (
              <div key={name} className="sg-swatch">
                <span className="sg-swatch__box" style={{ background: 'var(--surface-2)' }} />
                <div className="sg-swatch__meta">
                  <code className="sg-swatch__name">{name}</code>
                  <span className="sg-swatch__val">
                    {getComputedStyle(document.documentElement).getPropertyValue(name).trim()}
                  </span>
                  <span className="sg-swatch__desc">единый параметр точек</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="buildercode" title="Код схемы (Builder)"
          note="Прозрачный «код ↔ холст» в Agent Builder. Панель показывает узлы и связи схемы в реальном времени; вставка кода собирает схему на холсте с проверкой связей.">
          <p className="sg-hint">Читаемый формат: узлы (id, type, координаты, настройки) и связи (from → to). Вставил → «Собрать» строит узлы с правильными подключениями.</p>
          <pre className="sg-codeblock">{`{
  "nodes": [
    { "id": "a", "type": "agent-research",  "x": 80,  "y": 120 },
    { "id": "b", "type": "agent-analytics", "x": 440, "y": 120 }
  ],
  "edges": [
    { "from": "a", "to": "b" }
  ]
}`}</pre>
          <p className="sg-hint">При сборке схема мягко проверяется правилами запуска: если связь не пройдёт (нет агента, висячий узел, Telegram без чата) — показывается предупреждение, но холст всё равно собирается.</p>
        </Section>

        <footer className="sg-footer">
          Внутренний инструмент · доступен только в режиме разработки · обновляется
          автоматически вслед за App.css
        </footer>
      </main>
    </div>
  );
}

function Section({ id, title, note, children }) {
  return (
    <section id={`sg-${id}`} className="sg-section">
      <div className="sg-section__head">
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </div>
      {children}
    </section>
  );
}
