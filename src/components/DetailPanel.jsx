import React, { useState } from 'react';
import Tooltip from './Tooltip.jsx';
import Icon from './Icon.jsx';
import BottomSheet from './BottomSheet.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { CATEGORIES, getRelatedNodes } from '../data/mindmapData.js';
import { tutorials, tutorialByNodeId } from '../data/tutorials.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getNodeContent } from '../i18n/useNode.js';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';

export default function DetailPanel({
  node,
  isOpen,
  onClose,
  onStartTutorial,
  onSelectRelated,
  progressApi,
  bookmarksApi,
  nodeProgressApi,
  footer
}) {
  const t = useT();
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

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

  const copy = async () => {
    if (!d.example) return;
    try {
      await navigator.clipboard.writeText(d.example);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = d.example;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
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

  const metaBlock = (
    <>
      {(bookmarksApi || nodeProgressApi) && (
        <div className="detail__meta">
          <span className="detail__cat detail__cat--inline" style={{ '--cat-color': cat.color }}>
            {catLabel}
          </span>
          {bookmarksApi && (
            <button
              type="button"
              className={`detail__bookmark detail__bookmark--inline ${bookmarkOn ? 'is-on' : ''}`}
              onClick={() => bookmarksApi.toggle('node', node.id)}
              aria-label={bookmarkOn ? t('detail.bookmark.remove') : t('detail.bookmark.add')}
              title={bookmarkOn ? t('detail.bookmark.added') : t('detail.bookmark.toAdd')}
            >
              <Icon
                name={bookmarkOn ? 'bookmark-filled' : 'bookmark'}
                size={16}
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>
      )}

      {nodeProgressApi && (
        <div className="detail__progress" role="group" aria-label={t('detail.progress.aria')}>
          <span className="detail__progress-label">{t('detail.progress.label')}</span>
          <button
            type="button"
            className={`detail__progress-btn ${nodeProgressApi.getStatus(node.id) === 'viewed' ? 'is-on' : ''}`}
            onClick={() => nodeProgressApi.setStatus(
              node.id,
              nodeProgressApi.getStatus(node.id) === 'viewed' ? null : 'viewed'
            )}
            title={t('detail.progress.viewedTitle')}
          >
            <Icon name="check" size={13} strokeWidth={1.75} />
            {t('detail.progress.viewed')}
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
            <Icon name="question" size={13} strokeWidth={1.75} />
            {t('detail.progress.review')}
          </button>
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
      {['what', 'why', 'when', 'impact'].map(k => d[k] && (
        <section key={k} className="detail__section">
          <h3>
            {t(`detail.sections.${k}`)}
            <Tooltip label={t(`detail.tooltips.${k}`)} />
          </h3>
          <p>{d[k]}</p>
        </section>
      ))}

      {hasExample && (
        <section className="detail__section detail__section--example">
          <h3>
            {t('detail.sections.example')}
            <Tooltip label={t('detail.tooltips.example')} />
          </h3>
          <div className="detail__example">
            <pre>{d.example}</pre>
            <button
              type="button"
              className={`copy-btn ${copied ? 'is-copied' : ''}`}
              onClick={copy}
            >
              {copied ? (
                <>
                  <Icon name="check" size={14} strokeWidth={1.75} /> {t('common.copied')}
                </>
              ) : t('common.copy')}
            </button>
          </div>
        </section>
      )}

      {d.mistakes && (
        <section className="detail__section detail__section--mistakes">
          <h3>
            {t('detail.sections.mistakes')}
            <Tooltip label={t('detail.tooltips.mistakes')} />
          </h3>
          <p>{d.mistakes}</p>
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
          <div>
            <span className="detail__cat">{catLabel}</span>
            <h2 className="detail__title">{title}</h2>
          </div>
          {bookmarksApi && (
            <button
              type="button"
              className={`detail__bookmark ${bookmarkOn ? 'is-on' : ''}`}
              onClick={() => bookmarksApi.toggle('node', node.id)}
              aria-label={bookmarkOn ? t('detail.bookmark.remove') : t('detail.bookmark.add')}
              title={bookmarkOn ? t('detail.bookmark.added') : t('detail.bookmark.toAdd')}
            >
              <Icon
                name={bookmarkOn ? 'bookmark-filled' : 'bookmark'}
                size={18}
                strokeWidth={1.5}
              />
            </button>
          )}
          <button type="button" className="detail__close" onClick={onClose} aria-label={t('detail.closePanel')}>
            <Icon name="close" size={18} strokeWidth={1.75} />
          </button>
        </div>

        {nodeProgressApi && (
          <div className="detail__progress" role="group" aria-label={t('detail.progress.aria')}>
            <span className="detail__progress-label">{t('detail.progress.label')}</span>
            <button
              type="button"
              className={`detail__progress-btn ${nodeProgressApi.getStatus(node.id) === 'viewed' ? 'is-on' : ''}`}
              onClick={() => nodeProgressApi.setStatus(
                node.id,
                nodeProgressApi.getStatus(node.id) === 'viewed' ? null : 'viewed'
              )}
              title={t('detail.progress.viewedTitle')}
            >
              <Icon name="check" size={13} strokeWidth={1.75} />
              {t('detail.progress.viewed')}
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
              <Icon name="question" size={13} strokeWidth={1.75} />
              {t('detail.progress.review')}
            </button>
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
