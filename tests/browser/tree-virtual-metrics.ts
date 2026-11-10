export function readTreeVirtual(prefix: string) {
  const host = document.querySelector('[data-tree-virtual-host]')!;
  const tree = host.querySelector('[role="tree"]')!;
  const holder = host.querySelector<HTMLDivElement>(`.${prefix}-list-holder`)!;
  const inner = host.querySelector(`.${prefix}-list-holder-inner`)!;
  const filler = holder.firstElementChild!;
  const css = getComputedStyle(holder);
  const innerCss = getComputedStyle(inner);
  const rect = holder.getBoundingClientRect();
  const active = tree.getAttribute('aria-activedescendant');
  const target = active ? document.getElementById(active) : null;
  const round = (value: number) => Math.round(value * 1000) / 1000;
  return {
    viewport: {
      clientHeight: holder.clientHeight, scrollHeight: holder.scrollHeight,
      scrollTop: holder.scrollTop, height: round(rect.height), width: round(rect.width),
      overflowY: css.overflowY, overflowX: css.overflowX, maxHeight: css.maxHeight
    },
    content: {
      height: getComputedStyle(filler).height, position: getComputedStyle(filler).position,
      transform: innerCss.transform, marginLeft: innerCss.marginLeft, marginRight: innerCss.marginRight
    },
    nodes: [...inner.querySelectorAll(`.${prefix}-treenode`)].map(row => ({
      title: row.querySelector(`.${prefix}-title`)!.textContent,
      top: round(row.getBoundingClientRect().top - rect.top),
      height: round(row.getBoundingClientRect().height)
    })),
    scrollbars: [...host.querySelectorAll(`.${prefix}-list-scrollbar`)].map(bar => {
      const style = getComputedStyle(bar.querySelector(`.${prefix}-list-scrollbar-thumb`)!);
      return {
        axis: bar.classList.contains(`${prefix}-list-scrollbar-horizontal`) ? 'x' : 'y',
        height: style.height, width: style.width, top: style.top, left: style.left, right: style.right
      };
    }),
    active: { set: Boolean(active), exists: Boolean(target),
      title: target?.querySelector(`.${prefix}-title`)?.textContent ?? null },
    offsetCalls: JSON.parse(document.querySelector('[data-tree-virtual-offset-calls]')!.textContent || '[]')
  };
}
