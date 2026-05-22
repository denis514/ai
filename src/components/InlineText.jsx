import React from 'react';
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

  if (kind === 'node') {
    // Пробуем достать title узла из локали; если ключа нет — узел "битый"
    const key = `nodes.${id}.title`;
    const got = t(key);
    if (!got || got === key) {
      exists = false;
    } else {
      title = got;
      if (!resolvedLabel) resolvedLabel = got;
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
    }
    icon = 'graduation';
  } else if (kind === 'prompt') {
    const prompt = getLocalizedFeaturedPrompt(id, locale);
    if (!prompt || !prompt.title) {
      exists = false;
    } else {
      title = prompt.title;
      if (!resolvedLabel) resolvedLabel = title;
    }
    icon = 'sparkles';
  }

  if (!exists) {
    // Битая ссылка — показываем label (или id) без интерактива, но с пометкой
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
    <button
      type="button"
      className={`inline-link inline-link--${kind}`}
      onClick={handleClick}
      title={title}
    >
      {icon && (
        <span className="inline-link__icon" aria-hidden="true">
          <Icon name={icon} size={12} strokeWidth={1.75} />
        </span>
      )}
      <span className="inline-link__label">{resolvedLabel}</span>
    </button>
  );
}
