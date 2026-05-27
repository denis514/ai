// Lazy-контент RU.
// Two-stage load:
//   loadContent()      — core nodes + ALL tutorials + library (initial, eager)
//   loadNodeSection(s) — sys / commerce — on-demand
//
// Tutorials остаются eager (по audience уже разнесены — total < 200 KB gzip).
// Nodes secondary sections (sys, commerce) — lazy для уменьшения initial paint.

export async function loadContent() {
  const [
    nodesCore,
    tutEveryone, tutDevelopers, tutBusiness,
    library,
  ] = await Promise.all([
    import('../locales/ru/nodes/core.json'),
    import('../locales/ru/tutorials/everyone.json'),
    import('../locales/ru/tutorials/developers.json'),
    import('../locales/ru/tutorials/business.json'),
    import('../locales/ru/prompt-library.json'),
  ]);
  return {
    nodes:     nodesCore.default,
    tutorials: { ...tutEveryone.default, ...tutDevelopers.default, ...tutBusiness.default },
    library:   library.default,
  };
}

// On-demand node-section loaders. Возвращают plain JSON объект.
const SECTION_LOADERS = {
  sys:      () => import('../locales/ru/nodes/sys.json').then(m => m.default),
  commerce: () => import('../locales/ru/nodes/commerce.json').then(m => m.default),
};

export async function loadNodeSection(section) {
  const loader = SECTION_LOADERS[section];
  if (!loader) throw new Error(`Unknown node section: ${section}`);
  return loader();
}
