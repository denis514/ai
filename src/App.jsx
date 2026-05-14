import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { mindmapData, CATEGORIES } from './data/mindmapData.js';
import { tutorials, tutorialIds } from './data/tutorials.js';
import CanvasHeader from './components/CanvasHeader.jsx';
import Mindmap from './components/Mindmap.jsx';
import DetailPanel from './components/DetailPanel.jsx';
import TutorialModal from './components/TutorialModal.jsx';
import CoursesModal from './components/CoursesModal.jsx';
import PromptLibraryModal from './components/PromptLibraryModal.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import CanvasZoom from './components/CanvasZoom.jsx';
import CanvasFilters from './components/CanvasFilters.jsx';
import { useLevelFilter, LEVEL_RANK } from './hooks/useLevelFilter.js';
import { useActivityLog } from './hooks/useActivityLog.js';
import { useUserIdentity } from './hooks/useUserIdentity.js';
import ProfileFab from './components/ProfileFab.jsx';
import MobileFab from './components/MobileFab.jsx';
import PromptModal from './components/PromptModal.jsx';
import DetailNavFooter from './components/DetailNavFooter.jsx';
import WelcomeCard from './components/WelcomeCard.jsx';
import HelpModal from './components/HelpModal.jsx';
import { useTutorialProgress } from './hooks/useTutorialProgress.js';
import { useHashRoute } from './hooks/useHashRoute.js';
import { useBookmarks } from './hooks/useBookmarks.js';
import { useNodeProgress } from './hooks/useNodeProgress.js';
import { useLocale } from './i18n/LocaleContext.jsx';
import { STRINGS } from './i18n/strings.js';
import PasswordGate from './components/PasswordGate.jsx';
import './App.css';

function collectAllIds(node, acc = new Set()) {
  acc.add(node.id);
  if (node.children) for (const c of node.children) collectAllIds(c, acc);
  return acc;
}
function collectMainIds(root) {
  const ids = new Set([root.id]);
  if (root.children) for (const c of root.children) ids.add(c.id);
  return ids;
}
/**
 * Default-набор раскрытых узлов под текущий уровень пользователя.
 * Корень + те ветки, чей minLevel ≤ уровню пользователя.
 * Ветки выше уровня — видны заголовки, но дети скрыты (soft mode).
 */
function collectIdsForLevel(root, level) {
  const ids = new Set([root.id]);
  if (!root.children) return ids;
  const need = LEVEL_RANK[level] ?? LEVEL_RANK.expert;
  for (const c of root.children) {
    const branchLevel = c.minLevel ? (LEVEL_RANK[c.minLevel] ?? 0) : 0;
    if (branchLevel <= need) ids.add(c.id);
  }
  return ids;
}
function findNodeById(root, id) {
  if (!root || !id) return null;
  if (root.id === id) return root;
  if (root.children) {
    for (const c of root.children) {
      const f = findNodeById(c, id);
      if (f) return f;
    }
  }
  return null;
}

// Путь предков от root до targetId (не включая targetId)
function findAncestorPath(root, targetId, path = []) {
  if (root.id === targetId) return path;
  if (root.children) {
    for (const c of root.children) {
      const r = findAncestorPath(c, targetId, [...path, root.id]);
      if (r) return r;
    }
  }
  return null;
}

function searchTree(root, query, category, searchableById) {
  const q = (query || '').trim().toLowerCase();
  const hasQuery = q.length > 0;
  const hasCat = category && category !== 'all';
  if (!hasQuery && !hasCat) return { matched: new Set(), ancestors: new Set(), active: false };

  const matched = new Set();
  const ancestors = new Set();

  function visit(node, path) {
    const text = searchableById?.[node.id] || '';
    const inText = !hasQuery || text.includes(q);
    const inCat = !hasCat || node.category === category;

    if (inText && inCat && !node.isRoot) {
      matched.add(node.id);
      for (const a of path) ancestors.add(a);
    }

    if (node.children) {
      const newPath = [...path, node.id];
      for (const c of node.children) visit(c, newPath);
    }
  }

  visit(root, []);
  return { matched, ancestors, active: hasQuery || hasCat };
}

function AppInner() {
  // Локаль — нужна для поискового индекса (контент в текущей локали).
  const { locale } = useLocale();

  // Global user level — определяет дефолтный набор раскрытых веток
  const { level, setLevel } = useLevelFilter();

  // Поисковый индекс: id узла → searchable-строка (title + все details).
  // Пересобирается при смене локали.
  const searchableById = useMemo(() => {
    const bag = STRINGS[locale]?.nodes || STRINGS.ru.nodes;
    const out = {};
    for (const [id, c] of Object.entries(bag)) {
      out[id] = `${c.title} ${c.what} ${c.why} ${c.when} ${c.impact} ${c.example} ${c.mistakes}`.toLowerCase();
    }
    return out;
  }, [locale]);

  // По умолчанию на первой загрузке — только root, всё остальное свёрнуто.
  // Раскрытие по уровню происходит только при ЯВНОМ изменении уровня в Profile
  // (см. handleLevelChange ниже). Так первый экран = минимум шума.
  const [expandedIds, setExpandedIds] = useState(() => new Set([mindmapData.id]));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // При смене уровня — пересобираем дефолтный набор раскрытых веток.
  // Soft mode: после этого пользователь может вручную раскрыть любую ветку.
  const onLevelChange = useCallback((next) => {
    setLevel(next);
    setExpandedIds(collectIdsForLevel(mindmapData, next));
  }, [setLevel]);

  // Hash-роутер — единый источник истины о том, что открыто.
  const [route, setRoute] = useHashRoute();

  // Derived UI state из route.
  // Узел "выбран" не только когда route.type === 'node', но и когда открыт
  // tutorial — чтобы mindmap позиционировался на том же узле и был виден
  // под модалкой и после её закрытия.
  const selectedId = useMemo(() => {
    if (!route?.id) return null;
    if (route.type === 'node' || route.type === 'tutorial') return route.id;
    return null;
  }, [route]);
  const selected = useMemo(
    () => (selectedId ? findNodeById(mindmapData, selectedId) : null),
    [selectedId]
  );
  const panelOpen     = route?.type === 'node' && !!selected;
  const activeTutorial = route?.type === 'tutorial' ? route.id : null;
  const coursesOpen   = route?.type === 'courses';
  const libraryOpen   = route?.type === 'library' || route?.type === 'prompt';
  const helpOpen      = route?.type === 'help';
  const activeHelpSection = route?.type === 'help' ? route.id : null;
  const activePromptId = route?.type === 'prompt' ? route.id : null;

  const mapRef = useRef(null);
  const progressApi = useTutorialProgress();
  const bookmarksApi = useBookmarks();
  const nodeProgressApi = useNodeProgress();
  const activityApi = useActivityLog();
  const identityApi = useUserIdentity();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [featuredPrompt, setFeaturedPrompt] = useState(null);

  // Cmd+K / Ctrl+K → открыть command palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ===== Prev/Next: плоский список видимых узлов по DFS =====
  const visibleFlat = useMemo(() => {
    const out = [];
    const isCatActive = category && category !== 'all';
    function walk(node) {
      if (!node.isRoot) out.push(node);
      if (node.children && expandedIds.has(node.id)) {
        for (const c of node.children) walk(c);
      }
    }
    walk(mindmapData);
    if (isCatActive) return out.filter(n => n.category === category);
    return out;
  }, [expandedIds, category]);

  const currentIdx = selected
    ? visibleFlat.findIndex(n => n.id === selected.id)
    : -1;
  const prevNode = currentIdx > 0 ? visibleFlat[currentIdx - 1] : null;
  const nextNode =
    currentIdx >= 0 && currentIdx < visibleFlat.length - 1
      ? visibleFlat[currentIdx + 1]
      : null;

  // ←/→ для переключения между узлами (когда панель открыта)
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      // не перехватываем в input / textarea / contentEditable
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.key === 'ArrowLeft' && prevNode) {
        e.preventDefault();
        setRoute({ type: 'node', id: prevNode.id });
      } else if (e.key === 'ArrowRight' && nextNode) {
        e.preventDefault();
        setRoute({ type: 'node', id: nextNode.id });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen, prevNode, nextNode, setRoute]);

  const { matched, ancestors, active } = useMemo(
    () => searchTree(mindmapData, query, category, searchableById),
    [query, category, searchableById]
  );

  // Pinned узлы — список id, который пользователь хочет «увидеть на карте»
  // (например, кликнул на «Закладки: 5» в профиле → должны раскрыться и
  // подсветиться именно эти 5). Очищается при следующей навигации.
  const [pinnedIds, setPinnedIds] = useState(() => new Set());
  const [pinLabel, setPinLabel] = useState('');

  const pinnedAncestors = useMemo(() => {
    if (!pinnedIds.size) return new Set();
    const acc = new Set();
    for (const id of pinnedIds) {
      const path = findAncestorPath(mindmapData, id) || [];
      path.forEach(a => acc.add(a));
    }
    return acc;
  }, [pinnedIds]);

  useEffect(() => {
    if (!active && !pinnedIds.size) return;
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.add(mindmapData.id);
      ancestors.forEach(id => next.add(id));
      pinnedAncestors.forEach(id => next.add(id));
      return next;
    });
  }, [active, ancestors, pinnedIds, pinnedAncestors]);

  const highlightedIds = useMemo(() => {
    const s = new Set(matched);
    ancestors.forEach(id => s.add(id));
    if (active) s.add(mindmapData.id);
    if (pinnedIds.size) {
      pinnedIds.forEach(id => s.add(id));
      pinnedAncestors.forEach(id => s.add(id));
      s.add(mindmapData.id);
    }
    return s;
  }, [matched, ancestors, active, pinnedIds, pinnedAncestors]);

  const onShowNodes = useCallback((ids, label) => {
    if (!ids || !ids.length) return;
    setPinnedIds(new Set(ids));
    setPinLabel(label || '');
  }, []);

  const clearPinned = useCallback(() => {
    setPinnedIds(new Set());
    setPinLabel('');
  }, []);

  // Esc — единственный способ сбросить подсветку pinned-нод (чип удалён).
  useEffect(() => {
    if (!pinnedIds.size) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      clearPinned();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinnedIds, clearPinned]);

  const onToggle = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onSelect = useCallback((node) => {
    setRoute({ type: 'node', id: node.id });
  }, [setRoute]);

  // При смене выбранного узла — раскрываем всех предков, чтобы узел стал
  // видимым на карте (важно для глубоких ссылок: Cmd+K, learning paths,
  // tutorials, cross-links).
  useEffect(() => {
    if (!selected) return;
    const ancestors = findAncestorPath(mindmapData, selected.id) || [];
    setExpandedIds(prev => {
      let changed = false;
      const next = new Set(prev);
      for (const id of ancestors) {
        if (!next.has(id)) { next.add(id); changed = true; }
      }
      // Также раскрываем сам узел, если у него есть дети
      if (selected.children?.length && !next.has(selected.id)) {
        next.add(selected.id);
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [selected]);

  const expandAll   = useCallback(() => setExpandedIds(collectAllIds(mindmapData)), []);
  const collapseAll = useCallback(() => setExpandedIds(new Set([mindmapData.id])), []);

  const onZoomIn  = () => mapRef.current?.zoomIn();
  const onZoomOut = () => mapRef.current?.zoomOut();
  const onReset   = () => mapRef.current?.reset();
  const onFit     = () => mapRef.current?.fitToScreen();

  useEffect(() => {
    let raf;
    const tick = () => {
      const z = mapRef.current?.zoom;
      if (typeof z === 'number' && Math.abs(z - zoomLevel) > 0.005) setZoomLevel(z);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [zoomLevel]);

  // Tutorial state — для подсветки узлов с обучением
  const tutorialState = useCallback((id) => {
    if (!tutorials[id]) return null;
    const p = progressApi.getProgress(id);
    return {
      has: true,
      done: !!p.completedAt,
      started: (p.completedSteps?.length || 0) > 0 || (p.lastStepIndex || 0) > 0
    };
  }, [progressApi]);

  // Сводка для тулбара
  const tutorialsCompleted = tutorialIds.filter(id => progressApi.isCompleted(id)).length;

  const onStartTutorial = useCallback((nodeId) => {
    setRoute({ type: 'tutorial', id: nodeId });
  }, [setRoute]);

  const onOpenCourses  = useCallback(() => setRoute({ type: 'courses' }), [setRoute]);
  const onOpenLibrary  = useCallback(() => setRoute({ type: 'library' }), [setRoute]);
  const onOpenHelp     = useCallback((sectionId) => setRoute({ type: 'help', id: sectionId || null }), [setRoute]);
  const onCloseAll     = useCallback(() => setRoute(null), [setRoute]);

  // Закрытие tutorial — оставляем пользователя на узле, не очищаем route
  // полностью. Так после прохождения курса карта остаётся позиционированной
  // на изученном узле, и DetailPanel открыт для повторного чтения.
  const onCloseTutorial = useCallback(() => {
    if (route?.type === 'tutorial' && route.id) {
      setRoute({ type: 'node', id: route.id });
    } else {
      setRoute(null);
    }
  }, [route, setRoute]);

  // Цвет «тинта» canvas — берётся либо из активного фильтра категории,
  // либо из категории выбранного узла. Подмешивается в фон лёгкой долей,
  // чтобы сохранить читаемость текста и контрастность узлов.
  const canvasTint = useMemo(() => {
    if (category && category !== 'all') {
      return CATEGORIES[category]?.color || null;
    }
    if (selected && selected.category) {
      return CATEGORIES[selected.category]?.color || null;
    }
    return null;
  }, [category, selected]);
  const onLibraryPromptChange = useCallback(
    (id) => setRoute({ type: id ? 'prompt' : 'library', id: id || null }),
    [setRoute]
  );

  return (
    <div className="app">

      <main
        className={`app__main ${canvasTint ? 'is-tinted' : ''} ${panelOpen ? 'has-detail' : ''}`}
        style={canvasTint ? { '--canvas-tint': canvasTint } : undefined}
      >
        <Mindmap
          ref={mapRef}
          root={mindmapData}
          expandedIds={expandedIds}
          selectedId={selected?.id}
          matchedIds={highlightedIds}
          searchActive={active || pinnedIds.size > 0}
          onToggle={onToggle}
          onSelect={onSelect}
          tutorialState={tutorialState}
          nodeStatusOf={nodeProgressApi.getStatus}
        />

        <DetailPanel
          node={selected}
          isOpen={panelOpen}
          onClose={onCloseAll}
          onStartTutorial={onStartTutorial}
          onSelectRelated={(id) => setRoute({ type: 'node', id })}
          progressApi={progressApi}
          bookmarksApi={bookmarksApi}
          nodeProgressApi={nodeProgressApi}
          footer={
            (prevNode || nextNode) ? (
              <DetailNavFooter
                prev={prevNode}
                next={nextNode}
                onGo={(id) => setRoute({ type: 'node', id })}
              />
            ) : null
          }
        />

        <CanvasHeader
          query={query}
          onQuery={setQuery}
          tutorialsCompleted={tutorialsCompleted}
          tutorialsTotal={tutorialIds.length}
          onOpenCourses={onOpenCourses}
          onOpenLibrary={onOpenLibrary}
          onOpenHelp={onOpenHelp}
        />

        <ProfileFab
          level={level}
          onLevelChange={onLevelChange}
          progressApi={progressApi}
          nodeProgressApi={nodeProgressApi}
          bookmarksApi={bookmarksApi}
          activityApi={activityApi}
          identityApi={identityApi}
          onShowNodes={onShowNodes}
          onStartTutorial={onStartTutorial}
        />

        <CanvasFilters category={category} onCategory={setCategory} />

        <WelcomeCard
          progressApi={progressApi}
          onStartTutorial={onStartTutorial}
          onOpenCourses={onOpenCourses}
        />

        <CanvasZoom
          zoomLevel={zoomLevel}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFit={onFit}
          onReset={onReset}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />
      </main>

      {coursesOpen && (
        <CoursesModal
          onClose={onCloseAll}
          onOpen={onStartTutorial}
          onNavigate={setRoute}
          progressApi={progressApi}
          nodeProgressApi={nodeProgressApi}
          onOpenPrompt={setFeaturedPrompt}
        />
      )}

      {activeTutorial && (
        <TutorialModal
          tutorialId={activeTutorial}
          onClose={onCloseTutorial}
          onOpenTutorial={(id) => setRoute({ type: 'tutorial', id })}
          onOpenLibrary={onOpenLibrary}
          onOpenNode={(id) => setRoute({ type: 'node', id })}
          onOpenCourses={onOpenCourses}
          progressApi={progressApi}
        />
      )}

      {libraryOpen && (
        <PromptLibraryModal
          onClose={onCloseAll}
          activePromptId={activePromptId}
          onActivePromptChange={onLibraryPromptChange}
          bookmarksApi={bookmarksApi}
        />
      )}

      {helpOpen && (
        <HelpModal
          onClose={onCloseAll}
          activeSectionId={activeHelpSection}
          onNavigate={setRoute}
          onOpenNode={(id) => setRoute({ type: 'node', id })}
          onOpenTutorial={(id) => setRoute({ type: 'tutorial', id })}
          onOpenLibrary={onOpenLibrary}
          onOpenCourses={onOpenCourses}
        />
      )}

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(r) => setRoute(r)}
        bookmarksApi={bookmarksApi}
      />

      <MobileFab
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        onFit={onFit}
        onReset={onReset}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onOpenCourses={onOpenCourses}
        onOpenLibrary={onOpenLibrary}
        onOpenPrompt={setFeaturedPrompt}
      />

      {featuredPrompt && (
        <PromptModal
          prompt={featuredPrompt}
          onClose={() => setFeaturedPrompt(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('ca_auth') === '1');

  const handleUnlock = () => {
    localStorage.setItem('ca_auth', '1');
    setAuthed(true);
  };

  if (!authed) return <PasswordGate onUnlock={handleUnlock} />;
  return <AppInner />;
}
