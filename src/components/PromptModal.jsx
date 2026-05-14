import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

export default function PromptModal({ prompt, onClose }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
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
          <button
            type="button"
            className="prompt-modal__close"
            onClick={onClose}
            aria-label={t('prompt.closeAria')}
          >
            <Icon name="close" size={20} strokeWidth={1.75} />
          </button>
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
