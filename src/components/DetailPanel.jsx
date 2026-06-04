import React, { useState } from 'react';
import Tooltip from './Tooltip.jsx';
import Icon from './Icon.jsx';
import BottomSheet from './BottomSheet.jsx';
import InlineText from './InlineText.jsx';
import ShareButton from './ShareButton.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { CATEGORIES, getRelatedNodes } from '../data/mindmapData.js';
import { tutorials, tutorialByNodeId } from '../data/tutorials.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getNodeContent } from '../i18n/useNode.js';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../hooks/useToast.js';

export default function DetailPanel({
  node,
  isOpen,
  onClose,
  onStartTutorial,
  onSelectRelated,
  onOpenPrompt,
  backNode,
  onBack,
  progressApi,
  bookmarksApi,
  nodeProgressApi,
  footer
}) {
  const t = useT();
  const { locale } = useLocale();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  // Toggle закладки с feedback-toast. При удалении — даём 5-секундный
  // undo-shortcut через action в toast (повторный toggle = восстановит).
  const handleBookmarkToggle = () => {
    if (!bookmarksApi || !node) return;
    const wasOn = bookmarksApi.isBookmarked('node', node.id);
    bookmarksApi.toggle('node', node.id);
    if (wasOn) {
      toast({
        message: t('detail.bookmark.removedToast') || t('detail.bookmark.remove'),
        duration: 5000,
        action: {
          label: t('common.undo') || 'Отменить',
          onClick: () => bookmarksApi.toggle('node', node.id),
        },
      });
    } else {
      toast.success(t('detail.bookmark.addedToast') || t('detail.bookmark.added'));
    }
  };

  if (!node) return null;

  const cat = CATEGORIES[node.category] || CATEGORIES['основы'];
  const catLabel = t(`category.${node.category || 'основы'}`);
  const content = getNodeContent(t, node.id);
  const title = content.title;
  const d = {
    what: content.what,
    why: content.why,
    when: content.when,
    impact: content.impact,
    example: content.example,
    mistakes: content.mistakes
  };
  const hasExample = !!d.example;

  // При копировании вырезаем inline-link синтаксис: [[type:id|label]] → label,
  // [[type:id]] → id. В буфер попадает чистый человеко-читаемый текст.
  const stripInlineLinks = (s) =>
    (s || '').replace(
      /\[\[(?:node|tutorial|prompt):([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g,
      (_, id, label) => label || id
    );

  const copy = async () => {
    if (!d.example) return;
    const cleanText = stripInlineLinks(d.example);
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = cleanText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  // «Попробовать в Claude»: открываем claude.ai с примером + инструкцией —
  // чтобы Claude объяснил пользователю, что это и как применять.
  const tryInClaude = () => {
    if (!d.example) return;
    const clean = stripInlineLinks(d.example);
    const instruction = t('detail.tryInClaude.prompt')
      || 'Объясни простыми словами, что делает этот промпт и как им пользоваться. Затем покажи пример хорошего ответа на него:';
    const q = `${instruction}\n\n${clean}`;
    window.open(`https://claude.ai/new?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
  };

  // Находим туториал через обратный индекс nodeId→key, а не tutorials[node.id].
  const tutKey = tutorialByNodeId[node.id];
  const tutorial = tutKey ? tutorials[tutKey] : null;
  const tutorialLocalized = tutKey ? getLocalizedTutorial(tutKey, locale) : null;
  const tProgress = tutKey && progressApi ? progressApi.getProgress(tutKey) : null;
  const tDone = !!tProgress?.completedAt;
  const tStarted = !!tProgress && (tProgress.completedSteps?.length > 0 || tProgress.lastStepIndex > 0);
  const tStepsTotal = tutorial ? tutorial.steps.length : 0;
  const tStepsDone = tProgress ? (tProgress.completedSteps?.length || 0) : 0;
  const tTotalTime = tutorialLocalized?.totalTime || '';

  const bookmarkOn = bookmarksApi?.isBookmarked('node', node.id);

  // Заголовок узла «откуда пришёл» — для breadcrumb «← назад в X».
  const backTitle = backNode ? t(`nodes.${backNode.id}.title`) : '';

  // Навигаторы для inline-ссылок [[node:|tutorial:|prompt:]] в тексте узла.
  const inlineNav = {
    node: (id) => onSelectRelated?.(id),
    tutorial: (id) => onStartTutorial?.(id),
    prompt: (id) => onOpenPrompt?.(id)
  };

  const metaBlock = (
    <>
      {(nodeProgressApi || bookmarksApi) && (
        <div className="detail__progress" role="group" aria-label={t('detail.progress.aria')}>
          {bookmarksApi && (
            <button
              type="button"
              className={`detail__progress-btn detail__progress-btn--bookmark ${bookmarkOn ? 'is-on' : ''}`}
              onClick={handleBookmarkToggle}
              title={bookmarkOn ? t('detail.bookmark.added') : t('detail.bookmark.toAdd')}
            >
              <Icon name={bookmarkOn ? 'bookmark-filled' : 'bookmark'} size={15} strokeWidth={1.75} />
            </button>
          )}
          {nodeProgressApi && (
            <>
              <button
                type="button"
                className={`detail__progress-btn ${nodeProgressApi.getStatus(node.id) === 'viewed' ? 'is-on' : ''}`}
                onClick={() => nodeProgressApi.setStatus(
                  node.id,
                  nodeProgressApi.getStatus(node.id) === 'viewed' ? null : 'viewed'
                )}
                title={t('detail.progress.viewedTitle')}
              >
                <Icon name="check" size={15} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className={`detail__progress-btn detail__progress-btn--review ${nodeProgressApi.getStatus(node.id) === 'review' ? 'is-on' : ''}`}
                onClick={() => nodeProgressApi.setStatus(
                  node.id,
                  nodeProgressApi.getStatus(node.id) === 'review' ? null : 'review'
                )}
                title={t('detail.progress.reviewTitle')}
              >
                <Icon name="book-open" size={15} strokeWidth={1.75} />
              </button>
            </>
          )}
          <ShareButton type="node" id={node.id} title={title} variant="icon" />
        </div>
      )}

      {tutorial && (
        <button
          type="button"
          className={`detail__tutorial-cta ${tDone ? 'is-done' : tStarted ? 'is-started' : ''}`}
          onClick={() => onStartTutorial(tutKey)}
        >
          <span className="detail__tutorial-cta__icon" aria-hidden="true">
            <Icon name={tDone ? 'check' : 'graduation'} size={20} strokeWidth={1.5} />
          </span>
          <span className="detail__tutorial-cta__text">
            <strong>
              {tDone ? t('detail.tutorialRetake') : tStarted ? t('detail.tutorialContinue') : t('detail.tutorialPass')}
            </strong>
            <span>
              {tDone
                ? t('detail.tutCta.done', { steps: tStepsTotal, time: tTotalTime })
                : tStarted
                  ? t('detail.tutCta.inProgress', { current: (tProgress.lastStepIndex || 0) + 1, total: tStepsTotal, done: tStepsDone })
                  : t('detail.tutCta.start', { steps: tStepsTotal, time: tTotalTime })}
            </span>
          </span>
          <Icon name="arrow-right" size={16} strokeWidth={1.5} />
        </button>
      )}
    </>
  );

  const bodyBlock = (
    <>
      {backNode && onBack && (
        <button
          type="button"
          className="detail__back"
          onClick={onBack}
          title={t('detail.backTo', { title: backTitle })}
        >
          <Icon name="arrow-left" size={14} strokeWidth={1.75} />
          <span>{t('detail.backTo', { title: backTitle })}</span>
        </button>
      )}
      {['what', 'why', 'when', 'impact'].map(k => d[k] && (
        <section key={k} className="detail__section">
          <h3>
            {t(`detail.sections.${k}`)}
            <Tooltip label={t(`detail.tooltips.${k}`)} />
          </h3>
          <InlineText text={d[k]} onNavigate={inlineNav} />
        </section>
      ))}

      {hasExample && (
        <section className="detail__section detail__section--example">
          <h3>
            {t('detail.sections.example')}
            <Tooltip label={t('detail.tooltips.example')} />
          </h3>
          {isLoggedIn ? (
            <div className="detail__example">
              <InlineText
                as="div"
                className="detail__example-text"
                text={d.example}
                onNavigate={inlineNav}
              />
              <div className="detail__example-actions">
                <button
                  type="button"
                  className={`copy-btn ${copied ? 'is-copied' : ''}`}
                  onClick={copy}
                >
                  {copied ? (
                    <><Icon name="check" size={14} strokeWidth={1.75} /> {t('common.copied')}</>
                  ) : t('common.copy')}
                </button>
                <button
                  type="button"
                  className="detail__try-btn"
                  onClick={tryInClaude}
                >
                  <Icon name="sparkles" size={14} strokeWidth={1.6} />
                  {t('detail.tryInClaude.label') || 'Попробовать в Claude'}
                </button>
              </div>
            </div>
          ) : (
            <div className="detail__example-gate">
              <div className="detail__example-blur" aria-hidden="true">
                <pre>{stripInlineLinks(d.example)}</pre>
              </div>
              <div className="detail__example-cta">
                <Icon name="lock" size={18} strokeWidth={1.5} />
                <span>{t('auth.gateExample')}</span>
                <button
                  type="button"
                  className="detail__example-cta-btn"
                  onClick={() => document.dispatchEvent(new CustomEvent('atlas:open-auth'))}
                >
                  {t('auth.signIn')}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {d.mistakes && (
        <section className="detail__section detail__section--mistakes">
          <h3>
            {t('detail.sections.mistakes')}
            <Tooltip label={t('detail.tooltips.mistakes')} />
          </h3>
          <InlineText text={d.mistakes} onNavigate={inlineNav} />
        </section>
      )}

      {node.children && node.children.length > 0 && (
        <section className="detail__section">
          <h3>{t('detail.subsections', { n: node.children.length })}</h3>
          <ul className="detail__sublist">
            {node.children.map(c => (
              <li key={c.id}>
                <button
                  type="button"
                  className="detail__sublist-link"
                  onClick={() => onSelectRelated?.(c.id)}
                >
                  <span aria-hidden="true" className="detail__sublist-icon">
                    <Icon name={c.icon} size={16} strokeWidth={1.5} />
                  </span>
                  <span>{t(`nodes.${c.id}.title`)}</span>
                  <Icon name="arrow-right" size={12} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(() => {
        const related = getRelatedNodes(node.id);
        if (!related.length) return null;
        return (
          <section className="detail__section">
            <h3>
              {t('detail.related')}
              <Tooltip label={t('detail.tooltips.related')} />
            </h3>
            <ul className="detail__related">
              {related.map(r => {
                const rcat = CATEGORIES[r.category] || CATEGORIES['основы'];
                const rCatLabel = t(`category.${r.category || 'основы'}`);
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      className="detail__related-link"
                      onClick={() => onSelectRelated?.(r.id)}
                      style={{ '--cat-color': rcat.color }}
                    >
                      <span aria-hidden="true" className="detail__related-icon">
                        <Icon name={r.icon} size={16} strokeWidth={1.5} />
                      </span>
                      <span className="detail__related-main">
                        <span className="detail__related-title">{t(`nodes.${r.id}.title`)}</span>
                        <span className="detail__related-cat">{rCatLabel}</span>
                      </span>
                      <Icon name="arrow-right" size={12} strokeWidth={1.5} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })()}
    </>
  );

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        kicker={catLabel}
        accent={cat.color}
        icon={node.icon || 'sparkles'}
        footer={footer}
        className="bsheet--detail"
      >
        {metaBlock}
        {bodyBlock}
      </BottomSheet>
    );
  }

  return (
    <aside className={`detail ${isOpen ? 'is-open' : ''}`}>
      <header className="detail__header" style={{ '--cat-color': cat.color }}>
        <div className="detail__header-top">
          <span className="detail__icon" aria-hidden="true">
            <Icon name={node.icon || 'sparkles'} size={22} strokeWidth={1.5} />
          </span>
          <div className="detail__heading">
            <span className="detail__cat">{catLabel}</span>
            <h2 className="detail__title">{title}</h2>
            {(nodeProgressApi || bookmarksApi) && (
              <div className="detail__progress" role="group" aria-label={t('detail.progress.aria')}>
                {bookmarksApi && (
                  <button
                    type="button"
                    className={`detail__progress-btn detail__progress-btn--bookmark ${bookmarkOn ? 'is-on' : ''}`}
                    onClick={handleBookmarkToggle}
                    title={bookmarkOn ? t('detail.bookmark.added') : t('detail.bookmark.toAdd')}
                  >
                    <Icon name={bookmarkOn ? 'bookmark-filled' : 'bookmark'} size={15} strokeWidth={1.75} />
                  </button>
                )}
                {nodeProgressApi && (
                  <>
                    <button
                      type="button"
                      className={`detail__progress-btn ${nodeProgressApi.getStatus(node.id) === 'viewed' ? 'is-on' : ''}`}
                      onClick={() => nodeProgressApi.setStatus(
                        node.id,
                        nodeProgressApi.getStatus(node.id) === 'viewed' ? null : 'viewed'
                      )}
                      title={t('detail.progress.viewedTitle')}
                    >
                      <Icon name="check" size={15} strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      className={`detail__progress-btn detail__progress-btn--review ${nodeProgressApi.getStatus(node.id) === 'review' ? 'is-on' : ''}`}
                      onClick={() => nodeProgressApi.setStatus(
                        node.id,
                        nodeProgressApi.getStatus(node.id) === 'review' ? null : 'review'
                      )}
                      title={t('detail.progress.reviewTitle')}
                    >
                      <Icon name="book-open" size={15} strokeWidth={1.75} />
                    </button>
                  </>
                )}
                <ShareButton type="node" id={node.id} title={title} variant="icon" />
              </div>
            )}
          </div>
          <button type="button" className="detail__close" onClick={onClose} aria-label={t('detail.closePanel')}>
            <Icon name="close" size={18} strokeWidth={1.75} />
          </button>
        </div>

        {tutorial && (
          <button
            type="button"
            className={`detail__tutorial-cta ${tDone ? 'is-done' : tStarted ? 'is-started' : ''}`}
            onClick={() => onStartTutorial(tutKey)}
          >
            <span className="detail__tutorial-cta__icon" aria-hidden="true">
              <Icon name={tDone ? 'check' : 'graduation'} size={20} strokeWidth={1.5} />
            </span>
            <span className="detail__tutorial-cta__text">
              <strong>
                {tDone ? t('detail.tutorialRetake') : tStarted ? t('detail.tutorialContinue') : t('detail.tutorialPass')}
              </strong>
              <span>
                {tDone
                  ? t('detail.tutCta.done', { steps: tStepsTotal, time: tTotalTime })
                  : tStarted
                    ? t('detail.tutCta.inProgress', { current: (tProgress.lastStepIndex || 0) + 1, total: tStepsTotal, done: tStepsDone })
                    : t('detail.tutCta.start', { steps: tStepsTotal, time: tTotalTime })}
              </span>
            </span>
            <Icon name="arrow-right" size={16} strokeWidth={1.5} />
          </button>
        )}
      </header>

      <div className="detail__body">
        {bodyBlock}
      </div>

      {footer && (
        <div className="detail__footer">{footer}</div>
      )}
    </aside>
  );
}
