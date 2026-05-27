// Lazy-контент RU: nodes (split into 3 dynamic chunks) + tutorials + library.
// Импортируется только через loadLocaleContent('ru') — не в main bundle.
//
// Каждый import() в loadContent() — отдельный Vite chunk + параллельная загрузка.
// nodes.json раздроблен на nodes/{core,sys,commerce}.json через split-nodes.mjs.

export async function loadContent() {
  const [core, sys, commerce, tutorials, library] = await Promise.all([
    import('../locales/ru/nodes/core.json'),
    import('../locales/ru/nodes/sys.json'),
    import('../locales/ru/nodes/commerce.json'),
    import('../locales/ru/tutorials.json'),
    import('../locales/ru/prompt-library.json'),
  ]);
  return {
    nodes: { ...core.default, ...sys.default, ...commerce.default },
    tutorials: tutorials.default,
    library: library.default,
  };
}
