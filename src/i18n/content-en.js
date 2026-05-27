// Lazy-контент EN: nodes (split into 3 dynamic chunks) + tutorials + library.
export async function loadContent() {
  const [core, sys, commerce, tutorials, library] = await Promise.all([
    import('../locales/en/nodes/core.json'),
    import('../locales/en/nodes/sys.json'),
    import('../locales/en/nodes/commerce.json'),
    import('../locales/en/tutorials.json'),
    import('../locales/en/prompt-library.json'),
  ]);
  return {
    nodes: { ...core.default, ...sys.default, ...commerce.default },
    tutorials: tutorials.default,
    library: library.default,
  };
}
