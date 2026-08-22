import React, { useCallback, useMemo, useRef, useState, useEffect, Suspense, lazy } from 'react';
import { mindmapData, CATEGORIES } from './data/mindmapData.js';
import { tutorials, tutorialIds, tutorialByNodeId } from './data/tutorials.js';
import CanvasHeader from './components/CanvasHeader.jsx';
import Loader from './components/Loader.jsx';
import BranchLoader from './components/BranchLoader.jsx';
import Mindmap from './components/Mindmap.jsx';
import DetailPanel from './components/DetailPanel.jsx';
// Тяжёлые модалки — lazy-загружаются только при первом открытии (#21+
// perf-audit pickup: эти 3 модалки добавляют ~30-50KB в initial bundle, но
// большинство пользователей открывает их не сразу).
const TutorialModal      = lazyWithRetry(() => import('./components/TutorialModal.jsx'), 'TutorialModal');
const WorkflowsModal     = lazyWithRetry(() => import('./components/WorkflowsModal.jsx'), 'WorkflowsModal');
const PromptLibraryModal = lazyWithRetry(() => import('./components/PromptLibraryModal.jsx'), 'PromptLibraryModal');
// Лениво: палитра команд открывается по Cmd/Ctrl+K. Внутри она и так
// возвращает null, пока закрыта, поэтому монтируем её только открытой.
const CommandPalette = lazyWithRetry(() => import('./components/CommandPalette.jsx'), 'CommandPalette');
import CanvasZoom from './components/CanvasZoom.jsx';
import CanvasFilters from './components/CanvasFilters.jsx';
import { useLevelFilter, LEVEL_RANK } from './hooks/useLevelFilter.js';
import { useIsMobile } from './hooks/useIsMobile.js';
import { useActivityLog } from './hooks/useActivityLog.js';
import { useUserIdentity } from './hooks/useUserIdentity.js';
import ProfileFab from './components/ProfileFab.jsx';
import MobileFab from './components/MobileFab.jsx';
import PromptModal from './components/PromptModal.jsx';
import DetailNavFooter from './components/DetailNavFooter.jsx';
import MinimizedPill from './components/MinimizedPill.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import { useToast } from './hooks/useToast.js';
import ConfirmDialogContainer from './components/ConfirmDialogContainer.jsx';
import WelcomeCard from './components/WelcomeCard.jsx';
// Лениво: справка открывается по кнопке.
const HelpModal = lazyWithRetry(() => import('./components/HelpModal.jsx'), 'HelpModal');
import { useTutorialProgress } from './hooks/useTutorialProgress.js';
import { useTheme } from './hooks/useTheme.js';
import { useHashRoute, parseHash } from './hooks/useHashRoute.js';
import { useDocumentMeta } from './hooks/useDocumentMeta.js';
import { useBookmarks } from './hooks/useBookmarks.js';
import { useNodeProgress } from './hooks/useNodeProgress.js';
import { useWhatsNew } from './hooks/useWhatsNew.js';
import { useLocale, useT } from './i18n/LocaleContext.jsx';
import { getLocalizedFeaturedPrompt } from './i18n/usePrompt.js';
import { useAuth } from './context/AuthContext.jsx';
import { STRINGS } from './i18n/strings.js';
import { lazyWithRetry } from './utils/lazyWithRetry.js';
import { nudgeSignIn } from './services/signInNudge.js';
import { track, trackPageView } from './services/analytics.js';
import { FALLBACK_LOCALE } from './i18n/config.js';
import CookieBanner from './components/CookieBanner.jsx';
import UpdatesArchiveModal from './components/UpdatesArchiveModal.jsx';
// Лениво: окно входа открывается по действию, а не при загрузке карты.
const AuthModal = lazyWithRetry(() => import('./components/AuthModal.jsx'), 'AuthModal');
import WelcomeOnboarding from './components/WelcomeOnboarding.jsx';
import IntroModal, { isIntroSeen, markIntroSeen } from './components/IntroModal.jsx';
// Лениво: личный кабинет — отдельный экран. Он же тянул в стартовый пакет
// сервисы конструктора (список схем, расписания) ради виджета «Мои агенты».
const AccountPage = lazyWithRetry(() => import('./components/AccountPage.jsx'), 'AccountPage');
import UpdateBanner from './components/UpdateBanner.jsx';
import { useVersionCheck } from './hooks/useVersionCheck.js';
import { syncTutorialProgress, syncBookmarks, syncNodeProgress } from './services/syncService.js';
import './App.css';

// Agent Builder — lazy loaded. Не affects main bundle.
// См. docs/agent-builder/ для полной спецификации.
const BuilderApp = lazyWithRetry(() => import('./builder/BuilderApp.jsx'), 'BuilderApp');

// StyleGuide — внутренний эталон компонентов. Только dev (см. AppRouter).
const StyleGuide = lazyWithRetry(() => import('./styleguide/StyleGuide.jsx'), 'StyleGuide');

const GA_ID = 'G-GLRHYG2JVK';

// ── GA4 Consent Mode v2 (GDPR-compliant) ────────────────────────────────────
// По умолчанию — все хранилища запрещены (ст. 6(1)(a) GDPR — согласие).
// analytics_storage и ad_storage обновляются только ПОСЛЕ явного согласия.
function initGAConsentMode() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage:        'denied',
    wait_for_update:   500,
  });
}

function loadGA() {
  if (window.__ga_loaded) return;
  window.__ga_loaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    anonymize_ip: true,          // анонимизация IP (ст. 25 GDPR — privacy by design)
    allow_google_signals: false, // отключить рекламные сигналы
    allow_ad_personalization_signals: false,
  });
  // Обновляем consent ТОЛЬКО если пользователь дал явное согласие
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
  });
}

// Инициализируем Consent Mode немедленно (до загрузки GA скрипта)
initGAConsentMode();

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
  const { locale, contentVersion } = useLocale();
  const { isNewUser, dismissOnboarding, isLoggedIn, loading: authLoading, user } = useAuth();

  // IntroModal — показывается при первом визите (до авторизации)
  const [introOpen, setIntroOpen] = useState(() => !isIntroSeen());

  // Обнаружение нового деплоя → показ баннера обновления
  const { hasUpdate, reload: reloadPage } = useVersionCheck();

  // При нажатии «Обновить страницу» — просто перезагружаем.
  // Сессия сохраняется: Supabase автоматически восстанавливает токен из localStorage.
  // signOut здесь был ошибкой — он разрывал цикл OAuth/MagicLink и приводил
  // к рассинхронизации счётчиков (Supabase) и ID (localStorage).
  const handleUpdateReload = useCallback(() => {
    reloadPage();
  }, [reloadPage]);

  // ChunkLoadError: если браузер не может загрузить JS-чанк (старый деплой) →
  // автоматически перезагружаем страницу (один раз, защита от loop в guard).
  useEffect(() => {
    const onError = (e) => {
      const msg = e?.reason?.message || e?.message || '';
      if (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('Importing a module script failed')
      ) {
        const last = parseInt(sessionStorage.getItem('atlas:last-auto-reload') || '0', 10);
        if (Date.now() - last > 10_000) {
          sessionStorage.setItem('atlas:last-auto-reload', String(Date.now()));
          window.location.reload();
        }
      }
    };
    window.addEventListener('unhandledrejection', onError);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onError);
      window.removeEventListener('error', onError);
    };
  }, []); // eslint-disable-line

  // Global user level — определяет дефолтный набор раскрытых веток
  const { level, setLevel } = useLevelFilter();

  // Поисковый индекс: id узла → searchable-строка (title + все details).
  // Пересобирается при смене локали.
  const searchableById = useMemo(() => {
    // STRINGS[locale].nodes появляется после lazy-load (contentVersion > 0).
    // До загрузки поиск возвращает пустой индекс — это ок, карта уже видна.
    const bag = STRINGS[locale]?.nodes || STRINGS[FALLBACK_LOCALE]?.nodes;
    if (!bag) return {};
    const out = {};
    for (const [id, c] of Object.entries(bag)) {
      out[id] = `${c.title} ${c.what} ${c.why} ${c.when} ${c.impact} ${c.example} ${c.mistakes}`.toLowerCase();
    }
    return out;
  }, [locale, contentVersion]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // SEO: динамический <title>/description/canonical/og под маршрут и локаль.
  useDocumentMeta(route, locale, contentVersion);

  // i18n + toast — нужны для soft-CTA после IntroModal.
  const t = useT();
  const { toast } = useToast();

  // IntroModal: handler объявлен здесь — setRoute и toast уже доступны.
  // ВАЖНО: НЕ открываем туториал автоматически. Пользователь пришёл «посмотреть карту»,
  // а не «начать курс на 30 минут». Вместо этого — soft CTA через toast.
  // История: автоматический setRoute({type:'tutorial', id:'ai-fluency'}) был
  // удалён 2026-05-24 — см. tasks/product-audit-2026-05-24.md § «самый слабый момент».
  const handleIntroDone = useCallback(() => {
    setIntroOpen(false);
    // Soft CTA: пользователь сам решает, нужен ли ему обзорный workflow.
    toast({
      message: t('intro.tourToast'),
      duration: 8000,
      action: {
        label: t('intro.tourCta'),
        onClick: () => setRoute({ type: 'tutorial', id: 'ai-fluency' })
      }
    });
  }, [setRoute, toast, t]);

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
  // Safety net: route указывает на несуществующий узел (битый URL/hash) →
  // сбрасываем чтобы не оставлять пользователя в подвешенном состоянии.
  useEffect(() => {
    if (route?.type === 'node' && route.id && !selected) {
      console.warn(`App: узел "${route.id}" не найден, сбрасываю route`);
      setRoute(null);
    }
  }, [route, selected, setRoute]);
  const coursesOpen   = route?.type === 'courses' || route?.type === 'path';

  // ─── Аналитика: что именно открывают ─────────────────────────────────────
  // Вешаемся на маршрут, а не на клик по карте: так считаются ВСЕ способы
  // попасть в узел — карта, поиск, Cmd+K, перекрёстные ссылки, прямая ссылка
  // извне. Молчит без согласия на аналитику (см. services/analytics.js).
  const lastTrackedRef = useRef('');
  useEffect(() => {
    const key = route ? `${route.type}:${route.id || ''}` : 'map';
    if (key === lastTrackedRef.current) return;   // тот же экран — не дублируем
    lastTrackedRef.current = key;

    trackPageView(window.location.pathname, document.title);

    if (!route) return;
    if (route.type === 'node' && route.id) {
      const node = findNodeById(mindmapData, route.id);
      track('node_open', {
        node_id: route.id,
        node_category: node?.category,
        locale,
      });
    } else if (route.type === 'tutorial' && route.id) {
      track('tutorial_open', { tutorial_id: route.id, locale });
    } else if (route.type === 'prompt' && route.id) {
      track('prompt_open', { prompt_id: route.id, locale });
    }
    // 'builder' здесь не считаем: при переходе в конструктор этот компонент
    // размонтируется. Событие builder_open шлёт сам BuilderApp при монтировании.
  }, [route, locale]);
  const libraryOpen   = route?.type === 'library' || route?.type === 'prompt';
  const helpOpen      = route?.type === 'help';
  const accountOpen   = route?.type === 'account';

  // ── Кабинет и пропавшая сессия ────────────────────────────────────────────
  // 1) Сессия исчезла, пока кабинет открыт (выход из другой вкладки, истечение,
  //    стирание данных сайта) — закрываем кабинет на главную: экран вошедшего
  //    не должен оставаться перед человеком, который уже не вошёл.
  const wasLoggedInRef = useRef(false);
  useEffect(() => {
    if (isLoggedIn) { wasLoggedInRef.current = true; return; }
    if (wasLoggedInRef.current) {
      wasLoggedInRef.current = false;
      if (route?.type === 'account') setRoute(null);
    }
  }, [isLoggedIn]); // eslint-disable-line
  // 2) Холодная загрузка /account в полностью чистом браузере (после «удалить
  //    куки и данные сайтов» ничего не осталось) — на главную. Гость с реальным
  //    локальным прогрессом свой кабинет видит, как задумано.
  useEffect(() => {
    if (!accountOpen || authLoading || isLoggedIn) return;
    const hasAnything = [
      'claude-mindmap:node-progress:v1',
      'claude-mindmap.tutorial-progress.v1',
      'claude-mindmap:bookmarks:v1',
      'claude-mindmap:user-identity:v1',
      'atlas:builder:workflows:v1',
      'atlas:intro-seen:v1',
    ].some(k => { try { return !!localStorage.getItem(k); } catch { return false; } });
    if (!hasAnything) setRoute(null);
  }, [accountOpen, authLoading, isLoggedIn]); // eslint-disable-line
  const activeHelpSection = route?.type === 'help' ? route.id : null;
  const activePromptId = route?.type === 'prompt' ? route.id : null;

  const mapRef = useRef(null);
  const isMobile = useIsMobile();

  // На мобиле начальный зум 100% прячет все узлы за экраном.
  // Вызываем fitToScreen один раз при первом переходе в mobile-режим.
  // hasAutoFitted гарантирует вызов не более одного раза (не на каждый resize).
  const hasAutoFitted = useRef(false);
  useEffect(() => {
    if (!isMobile || hasAutoFitted.current) return;
    hasAutoFitted.current = true;
    const timer = setTimeout(() => {
      // padding=20 на мобиле (default 80 слишком велик для 375px)
      mapRef.current?.fitToScreen(20);
    }, 400);
    return () => clearTimeout(timer);
  }, [isMobile]);

  const progressApi = useTutorialProgress();
  const bookmarksApi = useBookmarks();
  const nodeProgressApi = useNodeProgress();
  const { isNew, newType, markSeen, newIds } = useWhatsNew();

  // Предки всех новых узлов — Map<id, 'new'|'updated'>.
  // Тип: 'new' приоритетнее 'updated' (если хоть один потомок 'new' → предок тоже 'new').
  const newAncestorIds = useMemo(() => {
    const acc = new Map(); // id → 'new' | 'updated'
    for (const id of newIds) {
      const t = newType(id) || 'new';
      const path = findAncestorPath(mindmapData, id) || [];
      path.forEach(ancestorId => {
        const existing = acc.get(ancestorId);
        // 'new' имеет приоритет над 'updated'
        if (!existing || t === 'new') acc.set(ancestorId, t);
      });
    }
    return acc;
  }, [newIds, newType]);
  const activityApi = useActivityLog();
  const identityApi = useUserIdentity();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [featuredPrompt, setFeaturedPrompt] = useState(null);
  // Стек навигации для breadcrumb «← назад»: накапливается при cross-link
  // переходах внутри панели, очищается при закрытии и при «свежей» навигации
  // (клик по карте, поиск, hash-роутинг).
  const [navStack, setNavStack] = useState([]);
  // Свёрнутый workflow/tutorial — пилюля рядом с DetailPanel.
  // Появляется при cross-link клике из WorkflowsModal или TutorialModal,
  // позволяет вернуться в оригинальную модалку с восстановлением state.
  const [minimizedWorkflow, setMinimizedWorkflow] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  // Возврат «назад» из входа: что показать, если пользователь ОТМЕНИЛ вход
  // (передумал). Заполняется при открытии входа из конкретного окна; на отмене
  // выполняется, на успешном входе — обнуляется (возвращать gate-экран не нужно).
  const authCancelReturnRef = useRef(null);
  // Единая точка открытия входа с памятью о возврате.
  const openAuth = useCallback((onCancelReturn = null) => {
    authCancelReturnRef.current = onCancelReturn;
    setAuthOpen(true);
  }, []);

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

  // Глобальное событие atlas:open-auth — открывает AuthModal из любого компонента
  useEffect(() => {
    const handler = () => setAuthOpen(true);
    document.addEventListener('atlas:open-auth', handler);
    return () => document.removeEventListener('atlas:open-auth', handler);
  }, []);

  // Когда пользователь залогинился — закрываем AuthModal и возвращаем туториал
  useEffect(() => {
    if (isLoggedIn && authOpen) {
      setAuthOpen(false);
      authCancelReturnRef.current = null; // вошёл — возврат к предыдущему окну не нужен
    }
    // Вошёл прямо из интро: знакомство считаем пройденным, иначе оно
    // возвращалось при следующей загрузке, а плашка согласия в этой сессии
    // так и не показывалась (она ждёт события «интро закрыто»).
    if (isLoggedIn && !isIntroSeen()) { markIntroSeen(); setIntroOpen(false); }
  }, [isLoggedIn]); // eslint-disable-line

  // Восстанавливаем маршрут после OAuth-редиректа (Google) или Magic Link.
  //
  // Проблема: после Google OAuth страница перезагружается на origin+'/', хэш теряется.
  // Решение: authService.js сохраняет хэш в sessionStorage перед редиректом,
  //          а мы восстанавливаем его здесь когда auth-состояние установлено.
  //
  // Срабатывает один раз: когда authLoading завершается И isLoggedIn = true
  // И в sessionStorage есть сохранённый маршрут.
  // После чтения запись удаляется — не мешает следующим сессиям.
  useEffect(() => {
    if (authLoading) return; // ждём пока auth определит состояние
    if (!isLoggedIn) return; // не залогинен — нечего восстанавливать

    const saved = sessionStorage.getItem('atlas:post-auth-route');
    if (!saved) return;

    sessionStorage.removeItem('atlas:post-auth-route');

    const parsed = parseHash(saved);
    if (parsed?.type) {
      // Восстанавливаем ПОЛНЫЙ сохранённый путь (с локалью), затем оповещаем
      // роутер/локаль. path-routing (ADR-0008).
      setTimeout(() => {
        try { window.history.replaceState(null, '', saved); } catch { /* noop */ }
        window.dispatchEvent(new Event('atlas:routechange'));
      }, 50);
    }
  }, [authLoading, isLoggedIn]); // eslint-disable-line

  // ─── Реал-тайм синк localStorage → Supabase ─────────────────────────────
  // После каждого изменения данных пишем в Supabase (debounce 300ms).
  // useRef пропускает первый рендер (данные загружаются из localStorage при mount).
  const isProgressMounted  = useRef(false);
  const isBookmarksMounted = useRef(false);
  const isNodesMounted     = useRef(false);

  useEffect(() => {
    if (!isProgressMounted.current) { isProgressMounted.current = true; return; }
    if (!user?.id) return;
    const t = setTimeout(() => syncTutorialProgress(user.id, progressApi.progress), 300);
    return () => clearTimeout(t);
  }, [progressApi.progress]); // eslint-disable-line

  useEffect(() => {
    if (!isBookmarksMounted.current) { isBookmarksMounted.current = true; return; }
    if (!user?.id) return;
    const t = setTimeout(() => syncBookmarks(user.id, bookmarksApi.bookmarks), 300);
    return () => clearTimeout(t);
  }, [bookmarksApi.bookmarks]); // eslint-disable-line

  useEffect(() => {
    if (!isNodesMounted.current) { isNodesMounted.current = true; return; }
    if (!user?.id) return;
    const t = setTimeout(() => syncNodeProgress(user.id, nodeProgressApi.state ?? {}), 300);
    return () => clearTimeout(t);
  }, [nodeProgressApi.counts]); // eslint-disable-line

  // Закрыть AuthModal (ОТМЕНА — пользователь передумал входить).
  // Если задан возврат (например, интро) — выполнить его, чтобы вернуть
  // на предыдущее окно.
  const handleAuthClose = useCallback(() => {
    setAuthOpen(false);
    const ret = authCancelReturnRef.current;
    authCancelReturnRef.current = null;
    if (ret) ret();
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

  // Общий хелпер: открыть узел + плавно сдвинуть карту к нему.
  // xOffset: -230 компенсирует ширину боковой панели (460px / 2).
  const navigateToNode = useCallback((id) => {
    setRoute({ type: 'node', id });
    let attempts = 0;
    const tryPan = () => {
      attempts++;
      const found = mapRef.current?.panToNode(id, { xOffset: -230 });
      if (!found && attempts < 8) setTimeout(tryPan, 60);
    };
    setTimeout(tryPan, 50);
  }, [setRoute]);

  // ←/→ для переключения между узлами (когда панель открыта)
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      // не перехватываем в input / textarea / contentEditable
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.key === 'ArrowLeft' && prevNode) {
        e.preventDefault();
        navigateToNode(prevNode.id);
      } else if (e.key === 'ArrowRight' && nextNode) {
        e.preventDefault();
        navigateToNode(nextNode.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen, prevNode, nextNode, navigateToNode]);

  const { matched, ancestors, active } = useMemo(
    () => searchTree(mindmapData, query, category, searchableById),
    [query, category, searchableById]
  );

  // Поиск без результата — сигнал, что в карте не хватает темы. Отправляем
  // ТОЛЬКО факт и длину запроса: сам текст ввёл человек, он может содержать
  // что угодно, включая личное.
  useEffect(() => {
    if (!active || matched.size > 0) return;
    const q = (query || '').trim();
    if (q.length < 3) return;                  // случайные одиночные буквы не считаем
    const t = setTimeout(() => track('search_no_results', { query_length: q.length, locale }), 1200);
    return () => clearTimeout(t);
  }, [active, matched.size, query, locale]);

  // Pinned узлы — список id, которые пользователь хочет «увидеть на карте»
  // (например, кликнул на «Закладки: 5» в профиле → подсвечиваются именно они).
  //
  // pinDimActive — флаг затемнения остальных узлов. Сбрасывается при первом
  // клике на любой узел (карта становится полностью интерактивной), но
  // подсветка pinnedIds (.is-matched) при этом сохраняется.
  const [pinnedIds, setPinnedIds] = useState(() => new Set());
  const [pinLabel, setPinLabel] = useState('');
  const [pinDimActive, setPinDimActive] = useState(false);

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

  // При поиске — плавно панируем к первому matched-узлу (с debounce 350мс).
  // Без этого узлы подсвечиваются в DOM, но остаются за пределами вьюпорта.
  useEffect(() => {
    if (!active || matched.size === 0) return;
    const firstId = [...matched][0];
    const timer = setTimeout(() => {
      const xOffset = panelOpen ? -230 : 0;
      let attempts = 0;
      const tryPan = () => {
        attempts++;
        const found = mapRef.current?.panToNode(firstId, { xOffset });
        if (!found && attempts < 8) setTimeout(tryPan, 60);
      };
      tryPan();
    }, 350);
    return () => clearTimeout(timer);
  }, [matched, active, panelOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setPinDimActive(true);
    // Плавно перемещаем карту к первому узлу из списка.
    // Задержка 120мс — панель профиля успевает начать закрываться,
    // поэтому xOffset: 0 (панель уходит, центр — середина экрана).
    let attempts = 0;
    const tryPan = () => {
      attempts++;
      const found = mapRef.current?.panToNode(ids[0], { xOffset: 0 });
      if (!found && attempts < 8) setTimeout(tryPan, 60);
    };
    setTimeout(tryPan, 120);
  }, []);

  const clearPinned = useCallback(() => {
    setPinnedIds(new Set());
    setPinLabel('');
    setPinDimActive(false);
  }, []);

  // Снять затемнение при клике на любой узел — карта становится полностью
  // интерактивной, но подсветка pinnedIds (.is-matched) остаётся видимой.
  const releasePinDim = useCallback(() => {
    if (pinDimActive) setPinDimActive(false);
  }, [pinDimActive]);

  // Esc — полный сброс подсветки pinned-нод.
  useEffect(() => {
    if (!pinnedIds.size && !pinDimActive) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      clearPinned();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinnedIds, pinDimActive, clearPinned]);

  const onToggle = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Если ветка сама помечена как new/updated — сбрасываем лейбл при первом клике
    markSeen(id);
  }, [markSeen]);

  const onSelect = useCallback((node) => {
    setRoute({ type: 'node', id: node.id });
    markSeen(node.id);
    releasePinDim(); // снять затемнение, подсветка pinnedIds остаётся
    setNavStack([]); // клик по карте/поиск/нав. через UI = «свежая» нав., сброс стека
  }, [setRoute, markSeen, releasePinDim]);

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
  const onFit     = () => mapRef.current?.fitToScreen(isMobile ? 20 : undefined);

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
  const tutorialState = useCallback((nodeId) => {
    const tutKey = tutorialByNodeId[nodeId];
    if (!tutKey) return null;
    const p = progressApi.getProgress(tutKey);
    return {
      has: true,
      done: !!p.completedAt,
      started: (p.completedSteps?.length || 0) > 0 || (p.lastStepIndex || 0) > 0
    };
  }, [progressApi]);

  // Сводка для тулбара
  const tutorialsCompleted = tutorialIds.filter(id => progressApi.isCompleted(id)).length;

  // ─── Предложение войти в подходящий момент ───────────────────────────────
  // Не стена и не баннер при входе на сайт: зовём только когда человеку уже
  // есть что терять — прошёл курс или набрал закладки. Правила (один повод —
  // один раз, одно предложение за сеанс, гостю) живут в signInNudge.js.
  const nudgeDeps = { isLoggedIn, toast, t, onSignIn: () => openAuth() };
  const nudgeRef = useRef(nudgeDeps);
  nudgeRef.current = nudgeDeps;

  const completedCountRef = useRef(null);
  useEffect(() => {
    const prev = completedCountRef.current;
    completedCountRef.current = tutorialsCompleted;
    // Первый рендер только запоминает: показывать нечего, ничего не произошло.
    if (prev === null || tutorialsCompleted <= prev) return;
    track('tutorial_done', { total_done: tutorialsCompleted, locale });
    nudgeSignIn('course', nudgeRef.current);
  }, [tutorialsCompleted]);

  const bookmarksCountRef = useRef(null);
  useEffect(() => {
    const prev = bookmarksCountRef.current;
    const count = bookmarksApi.count;
    bookmarksCountRef.current = count;
    if (prev === null || count <= prev) return;
    track('bookmark_add', { total: count, locale });
    // Третья закладка: одна-две могут быть случайными, третья — уже привычка.
    if (count >= 3) nudgeSignIn('bookmarks', nudgeRef.current);
  }, [bookmarksApi.count]);

  // Принимает tutorial KEY (не nodeId). Используется из DetailPanel, WorkflowsModal, WelcomeCard.
  const onStartTutorial = useCallback((tutorialKey) => {
    setRoute({ type: 'tutorial', id: tutorialKey });
    markSeen(tutorialKey); // убираем лейбл ОБНОВЛЕНО/НОВОЕ при старте курса
  }, [setRoute, markSeen]);

  const onOpenCourses  = useCallback(() => setRoute({ type: 'courses' }), [setRoute]);
  const onOpenLibrary  = useCallback(() => setRoute({ type: 'library' }), [setRoute]);
  const onOpenHelp     = useCallback((sectionId) => setRoute({ type: 'help', id: sectionId || null }), [setRoute]);
  const onCloseAll     = useCallback(() => {
    setRoute(null);
    setNavStack([]); // закрытие панели — сброс стека «откуда пришёл»
    setMinimizedWorkflow(null); // и сброс пилюли свёрнутого workflow
  }, [setRoute]);

  // ───── Свёрнутый workflow/tutorial (MinimizedPill) ─────
  // Минимизация: вызывается из WorkflowsModal/TutorialModal когда юзер
  // кликает cross-link [[node:X]]. Сохраняем state и переходим на узел.
  const onMinimizeWorkflow = useCallback((state) => {
    setMinimizedWorkflow(state);
    // Не закрываем route явно — он переключится в navigateToNode/setRoute.
  }, []);

  // Восстановление: пользователь кликнул по пилюле.
  // ВАЖНО: НЕ сбрасываем minimizedWorkflow здесь — иначе на следующем render
  // WorkflowsModal получит initialSelectedTutorial=null (snapshot уже стёрт).
  // Сброс делает useEffect ниже — после фактического mount модалки.
  const onExpandMinimized = useCallback(() => {
    const m = minimizedWorkflow;
    if (!m) return;
    if (m.type === 'workflows') {
      setRoute({ type: 'courses' });
    } else if (m.type === 'tutorial' && m.tutorialId) {
      setRoute({ type: 'tutorial', id: m.tutorialId });
    }
  }, [minimizedWorkflow, setRoute]);

  // Отказ: пользователь нажал × на пилюле — забываем state.
  const onDismissMinimized = useCallback(() => {
    setMinimizedWorkflow(null);
  }, []);

  // Авто-сброс minimizedWorkflow когда соответствующая модалка
  // фактически открылась (после onExpandMinimized). Если оставить snapshot
  // ещё и после открытия — пилюля может «воскреснуть» при следующей
  // навигации к узлу со стейлом.
  useEffect(() => {
    if (!minimizedWorkflow) return;
    if (minimizedWorkflow.type === 'workflows' && coursesOpen) {
      setMinimizedWorkflow(null);
    } else if (minimizedWorkflow.type === 'tutorial'
            && activeTutorial === minimizedWorkflow.tutorialId) {
      setMinimizedWorkflow(null);
    }
  }, [minimizedWorkflow, coursesOpen, activeTutorial]);

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
          searchActive={active || pinDimActive}
          onToggle={onToggle}
          onSelect={onSelect}
          tutorialState={tutorialState}
          nodeStatusOf={nodeProgressApi.getStatus}
          isBookmarkedNode={(id) => bookmarksApi.isBookmarked('node', id)}
          isNewNode={isNew}
          newTypeOf={newType}
          hasNewInside={id => newAncestorIds.get(id) ?? null}
        />

        <DetailPanel
          node={selected}
          onOpenBuilder={(templateId) => setRoute({ type: 'builder', id: templateId })}
          isOpen={panelOpen}
          onClose={onCloseAll}
          onStartTutorial={onStartTutorial}
          onSelectRelated={(id) => {
            releasePinDim();
            // Push текущий узел в стек перед уходом (cap = 5)
            setNavStack(prev => {
              if (!selected?.id || selected.id === id) return prev;
              const next = [...prev, selected.id];
              return next.slice(-5);
            });
            navigateToNode(id);
          }}
          onOpenPrompt={(promptId) => {
            const p = getLocalizedFeaturedPrompt(promptId, locale);
            if (p) setFeaturedPrompt(p);
          }}
          backNode={
            navStack.length
              ? findNodeById(mindmapData, navStack[navStack.length - 1])
              : null
          }
          onBack={() => {
            const last = navStack[navStack.length - 1];
            if (!last) return;
            setNavStack(prev => prev.slice(0, -1));
            navigateToNode(last);
          }}
          progressApi={progressApi}
          bookmarksApi={bookmarksApi}
          nodeProgressApi={nodeProgressApi}
          footer={
            (prevNode || nextNode) ? (
              <DetailNavFooter
                prev={prevNode}
                next={nextNode}
                onGo={navigateToNode}
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
          onOpenBuilder={() => setRoute({ type: 'builder' })}
          route={route}
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
          onOpenAuth={() => setAuthOpen(true)}
          onOpenAccount={() => setRoute({ type: 'account' })}
        />

        <CanvasFilters
          category={category}
          onCategory={setCategory}
          onSelectNode={(id) => setRoute({ type: 'node', id })}
          onOpenTutorial={(id) => setRoute({ type: 'tutorial', id })}
          onOpenArchive={() => setArchiveOpen(true)}
          route={route}
        />

        <WelcomeCard
          progressApi={progressApi}
          onStartTutorial={onStartTutorial}
          onOpenCourses={onOpenCourses}
        />

        {/* Поиск ничего не нашёл. Раньше карта просто тускнела без единого
            слова, и человек не понимал: сломалось или такой темы нет. */}
        {active && matched.size === 0 && (
          <div className="search-empty" role="status">
            <div className="search-empty__text">
              <strong>{t('search.emptyTitle')}</strong>
              <span>{t('search.emptyHint')}</span>
            </div>
            <button type="button" className="btn btn--ghost" onClick={() => { setQuery(''); setCategory('all'); }}>
              {t('search.emptyReset')}
            </button>
          </div>
        )}

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
        <Suspense fallback={null}>
          <WorkflowsModal
            onClose={onCloseAll}
            onOpen={onStartTutorial}
            onNavigate={setRoute}
            progressApi={progressApi}
            nodeProgressApi={nodeProgressApi}
            onOpenPrompt={setFeaturedPrompt}
            onMinimize={onMinimizeWorkflow}
            initialSelectedTutorial={
              minimizedWorkflow?.type === 'workflows' ? minimizedWorkflow.selectedTutorialKey : null
            }
            initialPathId={route?.type === 'path' ? route.id : null}
          />
        </Suspense>
      )}

      {/* Свёрнутая пилюля workflow/tutorial — рядом с DetailPanel */}
      {panelOpen && minimizedWorkflow && (
        <MinimizedPill
          state={minimizedWorkflow}
          onExpand={onExpandMinimized}
          onDismiss={onDismissMinimized}
          isMobile={isMobile}
        />
      )}

      {activeTutorial && (
        <div>
          <Suspense fallback={<div className="modal-loading" role="status"><Loader size="md" /></div>}>
            <TutorialModal
              tutorialId={activeTutorial}
              onClose={onCloseTutorial}
              onOpenTutorial={(id) => setRoute({ type: 'tutorial', id })}
              onOpenLibrary={onOpenLibrary}
              onOpenNode={(id) => setRoute({ type: 'node', id })}
              onMinimize={onMinimizeWorkflow}
              onOpenPrompt={(promptId) => {
                const p = getLocalizedFeaturedPrompt(promptId, locale);
                if (p) setFeaturedPrompt(p);
              }}
              onOpenCourses={onOpenCourses}
              progressApi={progressApi}
            />
          </Suspense>
        </div>
      )}

      {libraryOpen && (
        <Suspense fallback={null}>
          <PromptLibraryModal
            onClose={onCloseAll}
            activePromptId={activePromptId}
            onActivePromptChange={onLibraryPromptChange}
            bookmarksApi={bookmarksApi}
          />
        </Suspense>
      )}

      {helpOpen && (
        <Suspense fallback={null}>
        <HelpModal
          onClose={onCloseAll}
          activeSectionId={activeHelpSection}
          onNavigate={setRoute}
          onOpenNode={(id) => setRoute({ type: 'node', id })}
          onOpenTutorial={(id) => setRoute({ type: 'tutorial', id })}
          onOpenLibrary={onOpenLibrary}
          onOpenCourses={onOpenCourses}
        />
        </Suspense>
      )}

      {paletteOpen && (
      <Suspense fallback={null}>
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(r) => setRoute(r)}
        bookmarksApi={bookmarksApi}
      />
      </Suspense>
      )}

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
        onSelectNode={(id) => setRoute({ type: 'node', id })}
        onOpenArchive={() => setArchiveOpen(true)}
      />

      {featuredPrompt && (
        <PromptModal
          prompt={featuredPrompt}
          onClose={() => setFeaturedPrompt(null)}
        />
      )}

      {archiveOpen && (
        <UpdatesArchiveModal
          onSelectNode={(id) => { setRoute({ type: 'node', id }); setArchiveOpen(false); }}
          onOpenTutorial={(id) => { setArchiveOpen(false); onStartTutorial(id); }}
          onClose={() => setArchiveOpen(false)}
        />
      )}

      {authOpen && (
        <Suspense fallback={null}>
          <AuthModal onClose={handleAuthClose} />
        </Suspense>
      )}

      {accountOpen && (
        <Suspense fallback={<div className="modal-loading" role="status"><Loader size="md" /></div>}>
        <AccountPage
          onClose={() => setRoute(null)}
          progressApi={progressApi}
          identityApi={identityApi}
          nodeProgressApi={nodeProgressApi}
          bookmarksApi={bookmarksApi}
          activityApi={activityApi}
          onStartTutorial={onStartTutorial}
          onShowNodes={(ids, label) => { setRoute(null); onShowNodes(ids, label); }}
          onOpenCourses={onOpenCourses}
          onOpenBuilder={() => setRoute({ type: 'builder' })}
          onRequestAuth={() => {
            setRoute(null);      // закрываем AccountPage (z-index 8000)
            setAuthOpen(true);   // открываем AuthModal поверх
          }}
        />
        </Suspense>
      )}

      {/* Intro — первое знакомство с Atlas (первый визит, до авторизации) */}
      {introOpen && !isNewUser && (
        <IntroModal
          onDone={handleIntroDone}
          onRequestAuth={() => {
            // Прячем интро и открываем вход, НО запоминаем возврат: если пользователь
            // передумал входить — интро снова появится (а не пустой холст).
            // Seen НЕ помечаем — уход на вход ≠ «интро пройдено».
            setIntroOpen(false);
            openAuth(() => setIntroOpen(true));
          }}
        />
      )}

      {/* Welcome онбординг — показывается после первого логина */}
      {isNewUser && (
        <WelcomeOnboarding
          onSelectLevel={(lvl) => {
            setLevel(lvl);
            setExpandedIds(collectIdsForLevel(mindmapData, lvl));
          }}
          onDismiss={dismissOnboarding}
        />
      )}

      {/* Баннер новой версии — показывается после деплоя */}
      {hasUpdate && (
        <UpdateBanner onReload={handleUpdateReload} />
      )}

      {/* Глобальные системы уведомлений и подтверждений */}
      <ToastContainer />
      <ConfirmDialogContainer />
    </div>
  );
}

export default function App() {
  const [consent, setConsent] = useState(() => localStorage.getItem('ca_consent'));

  // Плашка согласия ждёт, пока закроется окно знакомства. Раньше они выходили
  // одновременно, и на телефоне баннер (z-index 9999) перекрывал кнопки интро
  // (9000) — первый экран продукта был физически заблокирован. Отложить показ
  // безопасно: аналитика всё равно грузится только после «Принять».
  const [introDone, setIntroDone] = useState(() => isIntroSeen());
  useEffect(() => {
    if (introDone) return;
    const onDone = () => setIntroDone(true);
    window.addEventListener('atlas:intro-done', onDone);
    return () => window.removeEventListener('atlas:intro-done', onDone);
  }, [introDone]);

  // Если ранее уже принял — загружаем GA сразу при монтировании
  useEffect(() => {
    if (consent === 'yes') loadGA();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = () => {
    localStorage.setItem('ca_consent', 'yes');
    setConsent('yes');
    loadGA();
  };

  const handleDecline = () => {
    localStorage.setItem('ca_consent', 'no');
    setConsent('no');
  };

  return (
    <>
      <AppRouter />
      {consent === null && introDone && (
        <CookieBanner onAccept={handleAccept} onDecline={handleDecline} />
      )}
    </>
  );
}

/**
 * AppRouter — top-level router который решает что рендерить:
 *  • route.type === 'builder' → BuilderApp (lazy-loaded из src/builder/)
 *  • иначе → AppInner (основной Atlas)
 *
 * Изолирует Builder от main Atlas component — hooks AppInner не вызываются,
 * когда пользователь в Builder. И наоборот: при возврате на Atlas,
 * BuilderApp полностью unmount.
 *
 * Builder code загружается через React.lazy() — не affects main bundle index.js.
 * См. docs/agent-builder/02-architecture.md.
 */
function AppRouter() {
  const [route] = useHashRoute();

  if (route?.type === 'builder') {
    // /<lang>/builder/<templateId> — приход из узла карты по кнопке
    // «Собрать в Agent Builder»: конструктор откроется с этим шаблоном.
    return (
      <Suspense fallback={<BuilderSuspenseFallback />}>
        <BuilderApp initialTemplateId={route.id || null} />
      </Suspense>
    );
  }

  // Внутренний эталон компонентов — только в режиме разработки.
  // В публичную сборку не попадает (import.meta.env.DEV === false в prod).
  if (import.meta.env.DEV && route?.type === 'styleguide') {
    return (
      <Suspense fallback={null}>
        <StyleGuide />
      </Suspense>
    );
  }

  return <AppInner />;
}

/**
 * BuilderSuspenseFallback — простой loader пока React Flow chunk грузится.
 * Inline-rendered, без зависимостей от Atlas компонентов.
 */
function BuilderSuspenseFallback() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <BranchLoader label="Agent Builder…" />
    </div>
  );
}
