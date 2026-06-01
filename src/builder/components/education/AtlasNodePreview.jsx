import React, { useState, useEffect } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useLocale, useT } from '../../../i18n/LocaleContext.jsx';
import { STRINGS } from '../../../i18n/strings.js';
import { FALLBACK_LOCALE } from '../../../i18n/config.js';
import { parseInlineLinks } from '../../../utils/inlineLinks.js';
import { nodeIndex } from '../../../data/mindmapData.js';

/**
 * AtlasNodePreview — preview Atlas-узла прямо в Builder sidebar.
 *
 * Заменяет открытие новой вкладки. Сохраняет user'а в Builder, при этом
 * даёт доступ к полному контенту Atlas (what / why / when / impact /
 * example / mistakes).
 *
 * Inline cross-links [[node:xxx|label]] кликабельны — каждый клик
 * переключает preview на следующий узел. Stack history → back button.
 *
 * Источники данных (read-only):
 *  • `mindmapData` через `nodeIndex` — для icon, category
 *  • `STRINGS[locale]?.nodes[id]` — для localized content
 *  • `parseInlineLinks` (pure utility) — для cross-link parsing
 *
 * Не reuse существующий DetailPanel (per do-not-touch list в
 * docs/agent-builder/05-risks.md). Этот компонент изолирован в Builder.
 *
 * Props:
 *  • atlasId — узел из mindmapData
 *  • onClose — return к default sidebar (NodeDetails)
 *  • onOpenAtlas(id) — switch preview к другому Atlas узлу
 */

const FIELD_LABELS = {
  what: 'preview.what',
  why: 'preview.why',
  when: 'preview.when',
  impact: 'preview.impact',
  example: 'preview.example',
  mistakes: 'preview.mistakes',
};

const FIELD_ICONS = {
  what: 'idea',
  why: 'question',
  when: 'clock',
  impact: 'flash',
  example: 'sparkles',
  mistakes: 'shield',
};

const FIELD_ORDER = ['what', 'why', 'when', 'impact', 'example', 'mistakes'];

export default function AtlasNodePreview({ atlasId, onClose, onOpenAtlas }) {
  const t = useT();
  const { locale, contentVersion } = useLocale();
  const [history, setHistory] = useState([atlasId]);
  const currentId = history[history.length - 1];

  // Reset history when atlasId prop changes externally
  useEffect(() => {
    setHistory([atlasId]);
  }, [atlasId]);

  // Get content from current locale (fallback to default if missing)
  const bag = STRINGS[locale]?.nodes || STRINGS[FALLBACK_LOCALE]?.nodes || {};
  const content = bag[currentId];

  // Get structural info from mindmapData
  const struct = nodeIndex[currentId];

  if (!content && !struct) {
    return (
      <div className="builder-preview">
        <PreviewHeader
          title={currentId}
          icon="question"
          onClose={onClose}
          canGoBack={false}
          t={t}
        />
        <div className="builder-preview__missing">
          <Icon name="question" size={24} strokeWidth={1.5} />
          <p>{t('builder.preview.notFound') || 'Atlas node not found.'}</p>
          {/* eslint-disable-next-line react/jsx-no-undef */}
          <p className="builder-preview__missing-id">{currentId}</p>
        </div>
      </div>
    );
  }

  const title = content?.title || currentId;
  const icon = struct?.icon || 'compass';

  const handleNodeClick = (linkId) => {
    setHistory(prev => [...prev, linkId]);
  };

  const handleBack = () => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const handleOpenInAtlas = () => {
    // Открыть полную страницу узла Atlas в этой же вкладке (path-routing).
    window.location.assign(`/${locale}/node/${currentId}`);
  };

  // Inline link navigators
  const inlineNav = {
    node: handleNodeClick,
    tutorial: () => {}, // пока не открываем туториалы из Builder
    prompt: () => {},   // пока не открываем prompts из Builder
  };

  return (
    <div className="builder-preview" data-content-version={contentVersion}>
      <PreviewHeader
        title={title}
        icon={icon}
        onClose={onClose}
        canGoBack={history.length > 1}
        onBack={handleBack}
        t={t}
      />

      <div className="builder-preview__body">
        {content ? (
          FIELD_ORDER.map(field => {
            const value = content[field];
            if (!value) return null;
            return (
              <section key={field} className="builder-preview__section">
                <h4 className="builder-preview__field-label">
                  <Icon name={FIELD_ICONS[field]} size={11} strokeWidth={1.5} />
                  <span>{t(`builder.${FIELD_LABELS[field]}`) || field}</span>
                </h4>
                <div className="builder-preview__field-body">
                  <InlinePreviewText text={value} onNavigate={inlineNav} />
                </div>
              </section>
            );
          })
        ) : (
          <p className="builder-preview__no-content">
            {t('builder.preview.noContent') || 'Content not localized in this language yet.'}
          </p>
        )}
      </div>

      <footer className="builder-preview__footer">
        <button
          type="button"
          className="builder-preview__atlas-btn"
          onClick={handleOpenInAtlas}
          title={t('builder.preview.openFull') || 'Open full Atlas page'}
        >
          <Icon name="compass" size={12} strokeWidth={1.5} />
          <span>{t('builder.preview.openFull') || 'Open in Atlas'}</span>
          <Icon name="arrow-right" size={12} strokeWidth={1.5} />
        </button>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* PreviewHeader — title + close + back navigation              */
/* ─────────────────────────────────────────────────────────── */

function PreviewHeader({ title, icon, onClose, canGoBack, onBack, t }) {
  return (
    <div className="builder-preview__head">
      <div className="builder-preview__head-nav">
        {canGoBack && onBack && (
          <button
            type="button"
            className="builder-preview__nav-btn"
            onClick={onBack}
            aria-label={t('builder.preview.back') || 'Back'}
            title={t('builder.preview.back') || 'Back'}
          >
            <Icon name="arrow-left" size={12} strokeWidth={1.75} />
          </button>
        )}
        <span className="builder-preview__head-icon" aria-hidden="true">
          <Icon name={icon} size={16} strokeWidth={1.5} />
        </span>
        <span className="builder-preview__head-title">{title}</span>
      </div>
      <button
        type="button"
        className="builder-preview__nav-btn builder-preview__nav-btn--close"
        onClick={onClose}
        aria-label={t('builder.preview.close') || 'Close preview'}
        title={t('builder.preview.close') || 'Close preview'}
      >
        <Icon name="close" size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* InlinePreviewText — render parsed text с clickable links     */
/* ─────────────────────────────────────────────────────────── */

function InlinePreviewText({ text, onNavigate }) {
  const parts = parseInlineLinks(text);
  return (
    <p className="builder-preview__text">
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          // Preserve line breaks
          return part.value.split('\n').map((line, i, arr) => (
            <React.Fragment key={`${idx}-${i}`}>
              {line}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ));
        }
        // Link part
        const handle = onNavigate?.[part.kind];
        return (
          <button
            key={idx}
            type="button"
            className={`builder-preview__inline-link builder-preview__inline-link--${part.kind}`}
            onClick={() => handle?.(part.id)}
            disabled={!handle}
          >
            {part.label || part.id}
          </button>
        );
      })}
    </p>
  );
}
