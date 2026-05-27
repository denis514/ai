// Lazy-контент EN. Two-stage: loadContent() eager (core + tuts + library);
// loadNodeSection() on-demand (sys, commerce).

export async function loadContent() {
  const [
    nodesCore,
    tutEveryone, tutDevelopers, tutBusiness,
    library,
  ] = await Promise.all([
    import('../locales/en/nodes/core.json'),
    import('../locales/en/tutorials/everyone.json'),
    import('../locales/en/tutorials/developers.json'),
    import('../locales/en/tutorials/business.json'),
    import('../locales/en/prompt-library.json'),
  ]);
  return {
    nodes:     nodesCore.default,
    tutorials: { ...tutEveryone.default, ...tutDevelopers.default, ...tutBusiness.default },
    library:   library.default,
  };
}

const SECTION_LOADERS = {
  sys:      () => import('../locales/en/nodes/sys.json').then(m => m.default),
  commerce: () => import('../locales/en/nodes/commerce.json').then(m => m.default),
};

export async function loadNodeSection(section) {
  const loader = SECTION_LOADERS[section];
  if (!loader) throw new Error(`Unknown node section: ${section}`);
  return loader();
}
