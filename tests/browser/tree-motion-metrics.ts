/** Независимая проекция реального Source/Native DOM; CSS heights читаются из inline phases. */
export function readTreeMotion(prefix: string) {
  const root = document.querySelector(`.${prefix}`);
  const group = root?.querySelector<HTMLElement>(`.${prefix}-treenode-motion`);
  const keys = (node: Element | null | undefined) => node
    ? [...node.querySelectorAll<HTMLElement>('[data-tree-motion-key]')].map(n => n.dataset.treeMotionKey)
    : [];
  return {
    keys: keys(root),
    expanded: root ? [...root.querySelectorAll(`[aria-expanded="true"]`)]
      .filter(n => n.classList.contains(`${prefix}-treenode`))
      .map(n => n.querySelector<HTMLElement>('[data-tree-motion-key]')?.dataset.treeMotionKey) : [],
    group: group ? {
      keys: keys(group),
      className: group.className,
      height: group.style.height,
      opacity: group.style.opacity,
      transition: group.style.transition,
      cssTransition: getComputedStyle(group).transition,
      scrollHeight: group.scrollHeight
    } : null
  };
}
