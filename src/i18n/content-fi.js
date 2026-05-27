// Lazy-контент FI: nodes (split into 3 dynamic chunks) + tutorials + library.
export async function loadContent() {
  const [core, sys, commerce, tutorials, library] = await Promise.all([
    import('../locales/fi/nodes/core.json'),
    import('../locales/fi/nodes/sys.json'),
    import('../locales/fi/nodes/commerce.json'),
    import('../locales/fi/tutorials.json'),
    import('../locales/fi/prompt-library.json'),
  ]);
  return {
    nodes: { ...core.default, ...sys.default, ...commerce.default },
    tutorials: tutorials.default,
    library: library.default,
  };
}
