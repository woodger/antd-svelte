export function readTreeDrag(prefix: string) {
  const root = document.querySelector(`.${prefix}`);
  return [...root?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []].map(row => {
    const content = row.querySelector<HTMLElement>(`.${prefix}-node-content-wrapper`)!;
    const handle = row.querySelector<HTMLElement>(`.${prefix}-draggable-icon`);
    const indicator = row.querySelector<HTMLElement>(`.${prefix}-drop-indicator`);
    return {
      key: row.querySelector('[data-tree-drag-key]')?.getAttribute('data-tree-drag-key'),
      draggable: row.draggable,
      expanded: row.getAttribute('aria-expanded'),
      dragging: row.classList.contains('dragging'),
      target: row.classList.contains('drop-target'),
      container: row.classList.contains('drop-container'),
      over: ['drag-over', 'drag-over-gap-top', 'drag-over-gap-bottom']
        .map(name => row.classList.contains(name)),
      highlighted: content.classList.contains(`${prefix}-node-selected`),
      handle: handle ? {
        width: handle.getBoundingClientRect().width,
        visibility: getComputedStyle(handle).visibility,
        text: handle.textContent,
        defaultIcon: Boolean(handle.querySelector('svg'))
      } : null,
      indicator: indicator ? {
        left: indicator.style.left,
        right: indicator.style.right,
        top: indicator.style.top,
        bottom: indicator.style.bottom,
        height: getComputedStyle(indicator).height,
        color: getComputedStyle(indicator).backgroundColor
      } : null
    };
  });
}

export function treeDragView(nodes: ReturnType<typeof readTreeDrag>) {
  return {
    keys: nodes.map(node => node.key),
    expanded: nodes.filter(node => node.expanded === 'true').map(node => node.key),
    draggable: nodes.filter(node => node.draggable).map(node => node.key),
    handles: nodes.filter(node => node.handle).map(node => node.key),
    highlighted: nodes.filter(node => node.highlighted).map(node => node.key),
    dragging: nodes.filter(node => node.dragging).map(node => node.key),
    targets: nodes.filter(node => node.target).map(node => node.key),
    containers: nodes.filter(node => node.container).map(node => node.key),
    over: nodes.filter(node => node.over.some(Boolean)).map(node => ({ key: node.key, flags: node.over })),
    indicators: nodes.flatMap(node => node.indicator ? [{ key: node.key, ...node.indicator }] : [])
  };
}
