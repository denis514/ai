import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import ShareButton from './ShareButton.jsx';

export default function PromptModal({ prompt, onClose }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  useFocusReturn();
  useBodyScrollLock();

  useEffect(() => {
    // ESC закрывает ТОЛЬКО этот модал, не пропуская событие в parent
    // (если открыт поверх PromptLibraryModal). stopImmediatePropagation
    // прерывает остальные window-level listener'ы в том же event-tick.
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    // capture: true чтобы наш handler выполнился РАНЬШЕ родительского
    // (Library использует addEventListener без capture).
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = prompt.text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="prompt-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="prompt-modal">
        <header className="prompt-modal__header">
          <div className="prompt-modal__head-main">
            <span className="prompt-modal__icon" aria-hidden="true">
              <Icon name={prompt.icon} size={26} strokeWidth={1.5} />
            </span>
            <div>
              <span className="prompt-modal__kicker">{t('prompt.kicker')}</span>
              <h2 id="prompt-modal-title" className="prompt-modal__title">{prompt.title}</h2>
              <p className="prompt-modal__subtitle">{prompt.description}</p>
            </div>
          </div>
          <div className="prompt-modal__head-actions">
            {prompt.id && <ShareButton type="prompt" id={prompt.id} title={prompt.title} />}
            <button
              type="button"
              className="prompt-modal__close"
              onClick={onClose}
              aria-label={t('prompt.closeAria')}
            >
              <Icon name="close" size={20} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <main className="prompt-modal__body">
          <pre className="prompt-modal__text">{prompt.text}</pre>
        </main>

        <footer className="prompt-modal__footer">
          <span className="prompt-modal__hint" aria-hidden="true">
            <kbd>Esc</kbd> {t('prompt.escHint')}
          </span>
          <div className="prompt-modal__actions">
            <a
              className="btn btn--ghost"
              href={`https://claude.ai/new?q=${encodeURIComponent(prompt.text)}`}
              target="_blank"
              rel="noopener noreferrer"
              title={t('prompt.openInClaude')}
            >
              <Icon name="external-link" size={14} strokeWidth={1.5} />
              {t('prompt.openClaude')}
            </a>
            <button
              type="button"
              className={`btn btn--primary ${copied ? 'is-copied' : ''}`}
              onClick={copy}
            >
              {copied ? (
                <>
                  <Icon name="check" size={14} strokeWidth={1.75} /> {t('common.copied')}
                </>
              ) : t('prompt.copyFull')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
