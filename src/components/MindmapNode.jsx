import React from 'react';
import { CATEGORIES } from '../data/mindmapData.js';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

function countDescendants(node) {
  if (!node.children || !node.children.length) return 0;
  let n = node.children.length;
  for (const c of node.children) n += countDescendants(c);
  return n;
}

export default function MindmapNode({
  node, pos, depth,
  isExpanded, isSelected, isMatched, isDimmed,
  hasTutorial, tutorialDone, tutorialStarted,
  nodeStatus,
  isBookmarked,
  isNew, newType, hasNewInside,
  onToggle, onSelect
}) {
  const t = useT();
  const isRoot = node.isRoot;
  const hasChildren = node.children && node.children.length > 0;
  const childrenCount = hasChildren ? node.children.length : 0;
  const total = hasChildren ? countDescendants(node) : 0;

  const cat = CATEGORIES[node.category] || CATEGORIES['основы'];

  const cls = [
    'mm-node',
    isRoot ? 'mm-node--root' : (depth === 1 ? 'mm-node--branch' : 'mm-node--leaf'),
    isSelected ? 'is-selected' : '',
    isMatched ? 'is-matched' : '',
    isDimmed ? 'is-dimmed' : '',
    nodeStatus ? `mm-node--status-${nodeStatus}` : ''
  ].join(' ');

  const onNodeClick = (e) => {
    e.stopPropagation();
    // Узлы с детьми (ветки) — клик переключает раскрытие, без открытия деталей.
    // Листья — клик открывает деталь-панель.
    // Root — клик открывает root-деталь (overview).
    if (hasChildren && !isRoot) {
      onToggle(node.id);
    } else {
      onSelect(node);
    }
  };

  return (
    <div
      data-no-pan="true"
      className={cls}
      style={{
        left: pos.x,
        top: pos.y,
        '--cat-color': cat.color
      }}
      onClick={onNodeClick}
      role="button"
      tabIndex={0}
      aria-label={t(`nodes.${node.id}.title`)}
      aria-expanded={hasChildren && !isRoot ? isExpanded : undefined}
    >
      {!isRoot && (
        <span className="mm-node__icon" aria-hidden="true">
          <Icon name={node.icon} size={18} strokeWidth={1.5} />
        </span>
      )}
      {isRoot && (
        <span className="mm-node__icon mm-node__icon--root" aria-hidden="true">
          <Icon name={node.icon} size={26} strokeWidth={1.75} />
        </span>
      )}

      {!isRoot && (
        <span className="mm-node__title">{t(`nodes.${node.id}.title`)}</span>
      )}

      {hasTutorial && (() => {
        const label = tutorialDone
          ? t('node.tutorialDone')
          : tutorialStarted
            ? t('node.tutorialStarted')
            : t('node.tutorialAvailable');
        return (
          <span
            className={`mm-node__tut ${tutorialDone ? 'is-done' : tutorialStarted ? 'is-started' : ''}`}
            title={label}
            aria-label={label}
          >
            <Icon name={tutorialDone ? 'check' : 'graduation'} size={14} strokeWidth={1.75} />
          </span>
        );
      })()}

      {hasChildren && !isRoot && (
        <span
          className={`mm-node__badge ${isExpanded ? 'is-expanded' : ''}`}
          title={`${childrenCount} ${isExpanded ? '(раскрыто)' : '(нажми, чтобы раскрыть)'}`}
        >
          {childrenCount}
        </span>
      )}

      {isNew && !isRoot && (
        <span className={`mm-node__new-badge mm-node__new-badge--${newType || 'new'}`}>
          {newType === 'updated' ? t('node.badgeUpdated') : t('node.badgeNew')}
        </span>
      )}

      {!isNew && hasNewInside && !isRoot && (
        <span className="mm-node__new-badge mm-node__new-badge--new mm-node__new-badge--inside">
          {t('node.badgeNew')}
        </span>
      )}

      {/* Бейджи статусов: viewed / review / bookmark — белый круг, цвет категории */}
      {!isRoot && (nodeStatus || isBookmarked) && (
        <span className="mm-node__status-badges" aria-hidden="true">
          {nodeStatus === 'viewed' && (
            <span className="mm-node__status-badge mm-node__status-badge--viewed" title={t('detail.progress.viewed')}>
              <Icon name="check-circle" size={14} strokeWidth={1.5} />
            </span>
          )}
          {nodeStatus === 'review' && (
            <span className="mm-node__status-badge mm-node__status-badge--review" title={t('detail.progress.review')}>
              <Icon name="refresh-circle" size={14} strokeWidth={1.5} />
            </span>
          )}
          {isBookmarked && (
            <span className="mm-node__status-badge mm-node__status-badge--bookmark" title={t('detail.bookmarkAdd')}>
              <Icon name="bookmark-filled" size={14} strokeWidth={1.5} />
            </span>
          )}
        </span>
      )}
    </div>
  );
}
