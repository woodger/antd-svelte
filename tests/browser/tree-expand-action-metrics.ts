export function readTreeExpandAction(prefix: string) {
  const host = document.querySelector('[data-tree-expand-host]')!;
  const contents = [...host.querySelectorAll(`.${prefix}-node-content-wrapper`)];
  const title = (node: Element) => node.querySelector(`.${prefix}-title`)?.textContent;
  const root = contents.find(node => title(node) === 'Root')!;

  return {
    expanded: root.closest(`.${prefix}-treenode`)!.getAttribute('aria-expanded'),
    visible: contents.map(title),
    selected: contents.filter(node => node.classList.contains(`${prefix}-node-selected`))
      .map(title),
    events: JSON.parse(document.querySelector('[data-tree-expand-events]')!.textContent || '[]')
  };
}
