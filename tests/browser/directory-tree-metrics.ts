export function readDirectoryTree(prefix: string) {
  const host = document.querySelector('[data-directory-host]')!;
  const tree = host.querySelector(`.${prefix}`)!;
  const nodes = [...host.querySelectorAll(`.${prefix}-node-content-wrapper`)].map(content => {
    const row = content.closest(`.${prefix}-treenode`)!;
    return {
      title: content.querySelector(`.${prefix}-title`)?.textContent,
      selected: content.classList.contains(`${prefix}-node-selected`),
      expanded: row.getAttribute('aria-expanded'),
      iconPaths: [...content.querySelectorAll(`.${prefix}-iconEle svg path`)]
        .map(path => path.getAttribute('d')),
      color: getComputedStyle(content).color,
      background: getComputedStyle(row).backgroundColor
    };
  });
  return {
    directory: tree.classList.contains(`${prefix}-directory`),
    block: tree.classList.contains(`${prefix}-block-node`),
    nodes,
    events: JSON.parse(document.querySelector('[data-directory-events]')!.textContent || '[]')
  };
}
