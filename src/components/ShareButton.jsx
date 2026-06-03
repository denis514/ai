import { useState, useRef, useEffect } from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import { buildShareUrl, shareTargets } from '../utils/shareUrl.js';

/**
 * ShareButton — кнопка «Поделиться» для обучающей сущности.
 *
 * Props:
 *  • type  — 'node' | 'tutorial' | 'prompt' | 'path'
 *  • id    — id сущности
 *  • title — заголовок для текста шаринга
 *  • variant — 'icon' (по умолч.) | 'text'
 *
 * Поведение: меню «Скопировать ссылку / Telegram / WhatsApp / Email».
 * На устройствах с системным шарингом (navigator.share) сверху — «Поделиться…».
 * Ссылка = существующий path-URL сущности (превью-карточку отдаёт сама страница).
 */
export default function ShareButton({ type, id, title = '', variant = 'icon' }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState(null); // {top,left} — плавающее меню поверх всего
  const ref = useRef(null);
  const btnRef = useRef(null);

  const url = buildShareUrl({ type, id });
  const targets = shareTargets(url, title);
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const MENU_W = 208;
  const toggle = () => {
    if (open) { setOpen(false); return; }
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const left = Math.max(8, Math.min(r.right - MENU_W, window.innerWidth - MENU_W - 8));
      setPos({ top: r.bottom + 6, left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    const onScrollResize = () => setOpen(false); // меню фиксированное — закрываем при сдвиге
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const native = async () => {
    try { await navigator.share({ title, url }); setOpen(false); } catch { /* отменили — ок */ }
  };

  const openTarget = (href) => { window.open(href, '_blank', 'noopener,noreferrer'); setOpen(false); };

  return (
    <div className="share" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        className={`share__btn ${variant === 'text' ? 'share__btn--text' : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        title={t('share.button') || 'Поделиться'}
        aria-label={t('share.button') || 'Поделиться'}
      >
        <Icon name="send" size={14} strokeWidth={1.75} />
        {variant === 'text' && <span>{t('share.button') || 'Поделиться'}</span>}
      </button>

      {open && (
        <div
          className="share__menu"
          role="menu"
          style={pos ? { position: 'fixed', top: pos.top, left: pos.left, right: 'auto' } : undefined}
        >
          {canNative && (
            <button type="button" className="share__item" role="menuitem" onClick={native}>
              <Icon name="send" size={14} strokeWidth={1.6} />
              <span>{t('share.native') || 'Поделиться…'}</span>
            </button>
          )}
          <button type="button" className="share__item" role="menuitem" onClick={copy}>
            <Icon name={copied ? 'check' : 'link'} size={14} strokeWidth={1.6} />
            <span>{copied ? (t('share.copied') || 'Скопировано') : (t('share.copy') || 'Скопировать ссылку')}</span>
          </button>
          <button type="button" className="share__item" role="menuitem" onClick={() => openTarget(targets.telegram)}>
            <Icon name="send" size={14} strokeWidth={1.6} />
            <span>Telegram</span>
          </button>
          <button type="button" className="share__item" role="menuitem" onClick={() => openTarget(targets.whatsapp)}>
            <Icon name="globe" size={14} strokeWidth={1.6} />
            <span>WhatsApp</span>
          </button>
          <button type="button" className="share__item" role="menuitem" onClick={() => openTarget(targets.email)}>
            <Icon name="mail" size={14} strokeWidth={1.6} />
            <span>{t('share.email') || 'Почта'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
