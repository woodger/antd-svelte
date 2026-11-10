export function readTreeFields(prefix: string) {
  const host = document.querySelector('[data-tree-fields-host]')!;
  const nodes = [...host.querySelectorAll(`.${prefix}-node-content-wrapper`)].map(content => {
    const row = content.closest(`.${prefix}-treenode`)!;
    return {
      title: content.querySelector(`.${prefix}-title`)!.textContent,
      expanded: row.getAttribute('aria-expanded'),
      selected: row.getAttribute('aria-selected'),
      checked: row.querySelector(`.${prefix}-checkbox`)?.getAttribute('aria-checked') ?? null,
      iconPaths: [...content.querySelectorAll(`.${prefix}-iconEle svg path`)]
        .map(path => path.getAttribute('d'))
    };
  });
  return {
    nodes,
    events: JSON.parse(document.querySelector('[data-tree-fields-events]')!.textContent || '[]')
  };
}
