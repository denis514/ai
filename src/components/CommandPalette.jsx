import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { mindmapData } from '../data/mindmapData.js';
import { promptLibrary } from '../data/promptLibrary.js';
import { tutorials } from '../data/tutorials.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';
import { getLocalizedLibraryTemplate, getLibraryCategory } from '../i18n/usePrompt.js';

/**
 * Cmd+K command palette — единый поиск по mindmap, tutorials, library.
 *
 * Открывается Cmd+K (mac) или Ctrl+K. Закрывается Esc.
 * Навигация ↑ ↓, выбор Enter.
 *
 * При выборе — вызывает onNavigate({ type, id }) для роутинга.
 */

function flattenNodes(root, tFn, acc = []) {
  if (!root.isRoot) acc.push({
    type: 'node',
    id: root.id,
    title: tFn(`nodes.${root.id}.title`),
    icon: root.icon,
    subtitle: tFn(`nodes.${root.id}.what`),
    category: root.category
  });
  if (root.children) for (const c of root.children) flattenNodes(c, tFn, acc);
  return acc;
}

export default function CommandPalette({ isOpen, onClose, onNavigate, bookmarksApi }) {
  const t = useT();
  const { locale } = useLocale();
  const KIND_LABEL = {
    node:     t('palette.kind.node'),
    prompt:   t('palette.kind.prompt'),
    tutorial: t('palette.kind.tutorial')
  };
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Полный индекс — пересобирается при смене локали (контент узлов из t()).
  const fullIndex = useMemo(() => {
    const nodes = flattenNodes(mindmapData, t);
    const prompts = promptLibrary.map(p => {
      const loc = getLocalizedLibraryTemplate(p.id, locale);
      const cat = getLibraryCategory(p.category, locale);
      return {
        type: 'prompt',
        id: p.id,
        title: loc?.title || '',
        icon: p.icon,
        subtitle: loc?.description || '',
        category: cat?.label || '',
        level: p.level
      };
    });
    const tuts = Object.entries(tutorials).map(([key, struct]) => {
      const loc = getLocalizedTutorial(key, locale);
      return {
        type: 'tutorial',
        // ВАЖНО: id = ключ туториала, НЕ struct.nodeId. Иначе onNavigate
        // получит nodeId и TutorialModal будет искать tutorials[nodeId] →
        // null → пустой экран при клике из палитры.
        id: key,
        title: loc?.title || '',
        icon: struct.icon || 'graduation',
        subtitle: loc?.subtitle || '',
        meta: loc?.totalTime || ''
      };
    });
    return [...nodes, ...prompts, ...tuts];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Закладки, разрешённые против полного индекса
  const bookmarkedItems = useMemo(() => {
    if (!bookmarksApi || bookmarksApi.count === 0) return [];
    const lookup = new Map(fullIndex.map(it => [`${it.type}:${it.id}`, it]));
    const out = [];
    // Сначала новые сверху
    const entries = Array.from(bookmarksApi.bookmarks.values())
      .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    for (const bm of entries) {
      const it = lookup.get(`${bm.type}:${bm.id}`);
      if (it) out.push(it);
    }
    return out;
  }, [bookmarksApi, fullIndex]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Без запроса: закладки + первые 25 элементов индекса (не дублируя bm)
      const bmKeys = new Set(bookmarkedItems.map(it => `${it.type}:${it.id}`));
      const rest = fullIndex
        .filter(it => !bmKeys.has(`${it.type}:${it.id}`))
        .slice(0, 25);
      return [...bookmarkedItems, ...rest];
    }

    const scored = [];
    for (const item of fullIndex) {
      const t = item.title.toLowerCase();
      const s = (item.subtitle || '').toLowerCase();
      let score = 0;
      if (t === q) score += 100;
      else if (t.startsWith(q)) score += 50;
      else if (t.includes(q)) score += 20;
      if (s.includes(q)) score += 5;
      if (score > 0) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 40).map(x => x.item);
  }, [query, fullIndex, bookmarkedItems]);

  const showBookmarksSection = !query.trim() && bookmarkedItems.length > 0;

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      // фокусировать input после mount
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Reset activeIdx когда меняется результат
  useEffect(() => { setActiveIdx(0); }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = results[activeIdx];
        if (item) {
          onNavigate({ type: item.type, id: item.id });
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, onNavigate, results, activeIdx]);

  // Scroll активного элемента в видимую область
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  if (!isOpen) return null;

  return (
    <div
      className="cmdk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('palette.ariaModal')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cmdk-modal">
        <div className="cmdk-input-wrap">
          <Icon name="search" size={18} strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            className="cmdk-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('palette.placeholder')}
            aria-label={t('palette.queryAria')}
          />
          <kbd className="cmdk-kbd">Esc</kbd>
        </div>

        <div className="cmdk-results" ref={listRef}>
          {results.length === 0 ? (
            <div className="cmdk-empty">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            <ul>
              {showBookmarksSection && (
                <li className="cmdk-section">
                  <Icon name="bookmark-filled" size={11} strokeWidth={1.5} /> Избранное
                </li>
              )}
              {results.map((item, idx) => {
                const isBm = bookmarksApi?.isBookmarked(item.type, item.id);
                // Когда достигли первого не-bookmarked элемента после bookmarks-секции → разделитель
                const showRestHeader =
                  showBookmarksSection &&
                  idx === bookmarkedItems.length &&
                  bookmarkedItems.length > 0;
                return (
                  <React.Fragment key={`${item.type}-${item.id}-${idx}`}>
                    {showRestHeader && (
                      <li className="cmdk-section">Всё</li>
                    )}
                    <li>
                      <button
                        type="button"
                        data-idx={idx}
                        className={`cmdk-item ${idx === activeIdx ? 'is-active' : ''}`}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => {
                          onNavigate({ type: item.type, id: item.id });
                          onClose();
                        }}
                      >
                        <span className="cmdk-item__icon" aria-hidden="true">
                          <Icon name={item.icon} size={16} strokeWidth={1.5} />
                        </span>
                        <span className="cmdk-item__main">
                          <span className="cmdk-item__title">
                            {item.title}
                            {isBm && (
                              <span className="cmdk-item__bm" aria-hidden="true">
                                <Icon name="bookmark-filled" size={11} strokeWidth={1.5} />
                              </span>
                            )}
                          </span>
                          {item.subtitle && (
                            <span className="cmdk-item__subtitle">{item.subtitle}</span>
                          )}
                        </span>
                        <span className="cmdk-item__kind">
                          {KIND_LABEL[item.type]}
                          {item.category ? ` · ${item.category}` : ''}
                        </span>
                      </button>
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </div>

        <div className="cmdk-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> навигация</span>
          <span><kbd>↵</kbd> открыть</span>
          <span><kbd>Esc</kbd> закрыть</span>
        </div>
      </div>
    </div>
  );
}
