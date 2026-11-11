export function readTreeSelectVirtual(implementation: string) {
  const source = implementation === 'source';
  const tree = source ? 'ant-select-tree' : 'ant-tree';
  const input = document.querySelector('[role="combobox"][aria-label="Virtual tree selection"]');
  const popup = document.querySelector(source ? '.ant-select-dropdown' : '[popover].ant-tree-select-dropdown');
  const visible = Boolean(popup?.getClientRects().length);
  const holder = visible ? popup?.querySelector(`.${tree}-list-holder`) : undefined;
  const rows = [...holder?.querySelectorAll<HTMLElement>(`.${tree}-treenode`) ?? []];
  const title = (row?: HTMLElement) => row?.querySelector(`.${tree}-title`)?.textContent ?? null;

  return {
    open: input?.getAttribute('aria-expanded') === 'true',
    width: visible ? Math.round(popup!.getBoundingClientRect().width) : null,
    viewport: holder ? {
      count: rows.length,
      first: title(rows[0]),
      last: title(rows.at(-1)),
      active: title(rows.find(row => row.classList.contains(`${tree}-treenode-active`))),
      height: holder.clientHeight,
      top: holder.scrollTop,
      overflowY: getComputedStyle(holder).overflowY,
      rowHeight: rows[0] ? rows[0].offsetHeight + parseFloat(getComputedStyle(rows[0]).marginBottom) : null
    } : null
  };
}
