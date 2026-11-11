export function readTreeScrollbar(source: boolean) {
  const host = document.querySelector<HTMLElement>('[data-tree-scrollbar-host]')!;
  const kind = host.dataset.treeScrollbarKind!;
  const prefix = kind === 'select' ? 'ant-select-dropdown-list' : source ? 'ant-select-tree-list' : 'ant-tree-list';
  const holder = document.querySelector<HTMLElement>('.' + prefix + '-holder');
  const bar = document.querySelector<HTMLElement>('.' + prefix + '-scrollbar');
  const thumb = bar?.querySelector<HTMLElement>('.' + prefix + '-scrollbar-thumb');
  const field = document.querySelector('[aria-label="Scrollbar field"]');
  const css = bar ? getComputedStyle(bar) : null;
  const thumbCss = thumb ? getComputedStyle(thumb) : null;
  return {
    top: holder?.scrollTop ?? null,
    height: holder?.clientHeight ?? null,
    overflow: holder ? getComputedStyle(holder).overflowY : null,
    bar: bar ? { visible: css!.visibility, classVisible: bar.classList.contains(prefix + '-scrollbar-visible'),
      height: bar.getBoundingClientRect().height, width: bar.getBoundingClientRect().width,
      thumbHeight: thumbCss!.height, thumbTop: thumbCss!.top } : null,
    focused: document.activeElement === field,
    rows: [...document.querySelectorAll(kind === 'select' ? '.ant-select-item-option-content'
      : source ? '.ant-select-tree-title' : '.ant-tree-title')].map(node => node.textContent),
    propLeaked: Boolean(field?.hasAttribute('showscrollbar'))
  };
}
