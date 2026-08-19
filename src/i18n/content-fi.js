// Lazy-контент FI.
// Три ступени загрузки:
//   loadContent()             — core-узлы + ИНДЕКС туториалов + библиотека (сразу)
//   loadNodeSection(s)        — sys / commerce — по требованию
//   loadTutorialAudience(a)   — тексты туториалов everyone / developers / business
//                               — по требованию, при открытии курса
//
// Индекс туториалов (title/subtitle/totalTime) весит десятки КБ и покрывает списки
// и поиск. Полные тексты — около 4 MB на язык, поэтому едут только когда нужны.
// Индекс собирается скриптом scripts/build-tutorial-index.mjs (npm prebuild).

export async function loadContent() {
  const [nodesCore, tutIndex, library] = await Promise.all([
    import('../locales/fi/nodes/core.json'),
    import('../locales/fi/tutorials/titles.json'),
    import('../locales/fi/prompt-library.json'),
  ]);
  return {
    nodes:     nodesCore.default,
    tutorials: tutIndex.default,
    library:   library.default,
  };
}

// On-demand node-section loaders. Возвращают plain JSON объект.
const SECTION_LOADERS = {
  sys:      () => import('../locales/fi/nodes/sys.json').then(m => m.default),
  commerce: () => import('../locales/fi/nodes/commerce.json').then(m => m.default),
};

export async function loadNodeSection(section) {
  const loader = SECTION_LOADERS[section];
  if (!loader) throw new Error(`Unknown node section: ${section}`);
  return loader();
}

// On-demand tutorial bodies по audience (поле audience в src/data/tutorials.js).
const TUTORIAL_LOADERS = {
  everyone:   () => import('../locales/fi/tutorials/everyone.json').then(m => m.default),
  developers: () => import('../locales/fi/tutorials/developers.json').then(m => m.default),
  business:   () => import('../locales/fi/tutorials/business.json').then(m => m.default),
};

export async function loadTutorialAudience(audience) {
  const loader = TUTORIAL_LOADERS[audience];
  if (!loader) throw new Error(`Unknown tutorial audience: ${audience}`);
  return loader();
}
