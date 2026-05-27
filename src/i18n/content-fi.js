// Lazy-контент FI. Two-stage: loadContent() eager (core + tuts + library);
// loadNodeSection() on-demand (sys, commerce).

export async function loadContent() {
  const [
    nodesCore,
    tutEveryone, tutDevelopers, tutBusiness,
    library,
  ] = await Promise.all([
    import('../locales/fi/nodes/core.json'),
    import('../locales/fi/tutorials/everyone.json'),
    import('../locales/fi/tutorials/developers.json'),
    import('../locales/fi/tutorials/business.json'),
    import('../locales/fi/prompt-library.json'),
  ]);
  return {
    nodes:     nodesCore.default,
    tutorials: { ...tutEveryone.default, ...tutDevelopers.default, ...tutBusiness.default },
    library:   library.default,
  };
}

const SECTION_LOADERS = {
  sys:      () => import('../locales/fi/nodes/sys.json').then(m => m.default),
  commerce: () => import('../locales/fi/nodes/commerce.json').then(m => m.default),
};

export async function loadNodeSection(section) {
  const loader = SECTION_LOADERS[section];
  if (!loader) throw new Error(`Unknown node section: ${section}`);
  return loader();
}
