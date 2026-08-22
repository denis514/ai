import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';

/**
 * GenerateHero — первый экран конструктора (решение основателя 2026-08-23):
 * вместо кнопки «Старт» — строка «опиши задачу», в которой сами печатаются
 * живые примеры «по делам». Клик — печать замирает, человек пишет своё.
 * Ниже — «Выбрать из шаблонов» (пилюльный стиль) и ссылка «пустой холст».
 *
 * ВАЖНО (тексты): лимитируются только АВТОсборки — сборка руками безлимитна,
 * счётчик обязан это проговаривать.
 */
export default function GenerateHero({ t, busy, remaining, error, ownKey = false, onGenerate }) {
  const [value, setValue] = useState('');
  const [demo, setDemo] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Примеры — JSON-массив в i18n (builder.gen.examples), как у vars шаблонов.
  const examples = (() => {
    try {
      const raw = t('builder.gen.examples');
      const arr = JSON.parse(raw);
      return Array.isArray(arr) && arr.length ? arr : [];
    } catch { return []; }
  })();

  // Пишущая машинка: печатаем пример, держим, стираем, следующий.
  // Уважение к «меньше движения»: показываем первый пример статично.
  useEffect(() => {
    if (!examples.length || focused || value) { setDemo(''); return; }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) { setDemo(examples[0]); return; }
    let ex = 0, pos = 0, dir = 1, timer;
    const tick = () => {
      const text = examples[ex];
      pos += dir;
      if (pos >= text.length + 14) { dir = -1; pos = text.length; } // подержать
      if (pos <= 0 && dir === -1) { dir = 1; pos = 0; ex = (ex + 1) % examples.length; }
      setDemo(text.slice(0, Math.max(0, Math.min(pos, text.length))));
      timer = setTimeout(tick, dir === 1 ? (pos > text.length ? 120 : 45) : 18);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examples.length, focused, value]);

  const submit = () => {
    const q = value.trim();
    if (q.length >= 8 && !busy) onGenerate(q);
  };

  // Подпись под строкой: до первого использования — общая; дальше — остаток.
  // Формулировка отделяет автосборки от безлимитной ручной сборки.
  const counterText = ownKey
    ? t('builder.gen.hintOwnKey')
    : remaining === null
      ? t('builder.gen.hint')
      : remaining > 0
        ? t('builder.gen.counter', { n: remaining })
        : t('builder.gen.counterOut');

  return (
    <>
      {/* Кнопка-«молния» живёт ВНУТРИ строки (решение основателя): круглая,
          без подписи; имя действия остаётся для незрячих в aria-label. */}
      <div className="builder-gen-row" style={{ pointerEvents: 'auto' }}>
        <input
          ref={inputRef}
          type="text"
          className="builder-gen-input"
          value={value}
          placeholder={demo || t('builder.gen.placeholder')}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          maxLength={300}
          disabled={busy}
          aria-label={t('builder.gen.placeholder')}
        />
        <button
          type="button"
          className="builder-start-cta builder-gen-cta"
          onClick={submit}
          disabled={busy || value.trim().length < 8}
          aria-label={busy ? t('builder.gen.building') : t('builder.gen.build')}
          title={busy ? t('builder.gen.building') : t('builder.gen.build')}
        >
          <span className="builder-cta-blob-r1" aria-hidden="true" />
          <span className="builder-cta-blob-r2" aria-hidden="true" />
          <span className="builder-cta-blob-p"  aria-hidden="true" />
          <span className="builder-cta-blob-d"  aria-hidden="true" />
          <span className="builder-cta-blob-o"  aria-hidden="true" />
          <span className="builder-cta-blob-a"  aria-hidden="true" />
          <span className="builder-start-cta__label">
            {busy
              ? <Icon name="refresh-circle" size={16} strokeWidth={1.6} />
              : <Icon name="flash" size={16} strokeWidth={1.6} />}
          </span>
        </button>
      </div>

      <p className={`builder-gen-note ${error ? 'is-error' : ''}`} style={{ pointerEvents: 'auto' }} role={error ? 'alert' : undefined}>
        {error || counterText}
      </p>
    </>
  );
}
