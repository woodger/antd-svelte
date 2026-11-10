export function readTreeNodeRenderers(prefix: string) {
  const host = document.querySelector('[data-tree-renderer-host]')!;
  const nodes = [...host.querySelectorAll(`.${prefix}-node-content-wrapper`)].map(content => {
    const row = content.closest(`.${prefix}-treenode`)!;
    const switcher = row.querySelector(`.${prefix}-switcher`);
    return {
      title: content.querySelector(`.${prefix}-title`)!.textContent,
      expanded: row.getAttribute('aria-expanded'),
      switcher: switcher ? {
        text: switcher.textContent,
        textAlign: getComputedStyle(switcher).textAlign,
        renderers: [...switcher.querySelectorAll('[data-renderer]')].map(node => ({
          kind: node.getAttribute('data-renderer'),
          state: node.getAttribute('data-render-state'),
          fontSize: getComputedStyle(node).fontSize
        })),
        loading: Boolean(switcher.querySelector(`.${prefix}-switcher-loading-icon`)),
        leafLine: Boolean(switcher.querySelector(`.${prefix}-switcher-leaf-line`))
      } : null
    };
  });
  return {
    nodes,
    events: JSON.parse(document.querySelector('[data-tree-renderer-events]')!.textContent || '[]')
  };
}
