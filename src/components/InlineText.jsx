import React, { useState, useRef, useEffect } from 'react';
import { parseInlineLinks } from '../utils/inlineLinks.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedFeaturedPrompt } from '../i18n/usePrompt.js';
import { tutorials } from '../data/tutorials.js';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';
import Icon from './Icon.jsx';

/**
 * Рендерит текст с inline-ссылками [[type:id|label]].
 *
 * Поддерживает три типа целей:
 *   - node:<nodeId>     — перейти к узлу карты
 *   - tutorial:<tutId>  — открыть туториал
 *   - prompt:<promptId> — открыть готовый промпт
 *
 * Props:
 *   text: исходная строка
 *   as: тег обёртки ('p' по умолчанию, можно 'span')
 *   onNavigate: { node, tutorial, prompt } — три колбэка-навигатора
 *   className: дополнительный класс
 */
export default function InlineText({ text, as: Tag = 'p', onNavigate, className }) {
  const t = useT();
  const { locale } = useLocale();
  const parts = parseInlineLinks(text);

  return (
    <Tag className={className}>
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return <React.Fragment key={idx}>{part.value}</React.Fragment>;
        }
        return (
          <InlineLink
            key={idx}
            kind={part.kind}
            id={part.id}
            label={part.label}
            t={t}
            locale={locale}
            onNavigate={onNavigate}
          />
        );
      })}
    </Tag>
  );
}

function InlineLink({ kind, id, label, t, locale, onNavigate }) {
  let resolvedLabel = label;
  let exists = true;
  let icon = null;
  let title = '';
  let preview = ''; // короткий «что это» для hover-карточки

  if (kind === 'node') {
    const key = `nodes.${id}.title`;
    const got = t(key);
    if (!got || got === key) {
      exists = false;
    } else {
      title = got;
      if (!resolvedLabel) resolvedLabel = got;
      // Превью: первые ~140 символов поля what
      const whatKey = `nodes.${id}.what`;
      const what = t(whatKey);
      if (what && what !== whatKey) {
        preview = what.replace(/\[\[[^\]]+\]\]/g, '').trim().slice(0, 160);
        if (preview.length === 160) preview += '…';
      }
    }
    icon = 'arrow-right';
  } else if (kind === 'tutorial') {
    const tut = tutorials[id];
    if (!tut) {
      exists = false;
    } else {
      const loc = getLocalizedTutorial(id, locale);
      title = loc?.title || id;
      if (!resolvedLabel) resolvedLabel = title;
      preview = (loc?.intro || loc?.subtitle || '').slice(0, 160);
      if (preview.length === 160) preview += '…';
    }
    icon = 'graduation';
  } else if (kind === 'prompt') {
    const prompt = getLocalizedFeaturedPrompt(id, locale);
    if (!prompt || !prompt.title) {
      exists = false;
    } else {
      title = prompt.title;
      if (!resolvedLabel) resolvedLabel = title;
      preview = (prompt.description || '').slice(0, 160);
      if (preview.length === 160) preview += '…';
    }
    icon = 'sparkles';
  }

  if (!exists) {
    return (
      <span
        className="inline-link inline-link--broken"
        title={`Ресурс не найден: ${kind}:${id}`}
      >
        {resolvedLabel || id}
      </span>
    );
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onNavigate) return;
    if (kind === 'node' && onNavigate.node) onNavigate.node(id);
    else if (kind === 'tutorial' && onNavigate.tutorial) onNavigate.tutorial(id);
    else if (kind === 'prompt' && onNavigate.prompt) onNavigate.prompt(id);
  };

  return (
    <LinkWithPreview
      kind={kind}
      icon={icon}
      title={title}
      preview={preview}
      label={resolvedLabel}
      onClick={handleClick}
    />
  );
}

function LinkWithPreview({ kind, icon, title, preview, label, onClick }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 350);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <span
      className="inline-link-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <button
        type="button"
        className={`inline-link inline-link--${kind}`}
        onClick={onClick}
      >
        {icon && (
          <span className="inline-link__icon" aria-hidden="true">
            <Icon name={icon} size={12} strokeWidth={1.75} />
          </span>
        )}
        <span className="inline-link__label">{label}</span>
      </button>
      {open && preview && (
        <span className={`inline-link__preview inline-link__preview--${kind}`} role="tooltip">
          <span className="inline-link__preview-title">{title}</span>
          <span className="inline-link__preview-body">{preview}</span>
        </span>
      )}
    </span>
  );
}
