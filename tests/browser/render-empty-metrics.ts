export function snapshotRenderEmpty(component: string) {
  const frame = document.querySelector('[data-render-empty-frame]')!;
  const selectors: Record<string, string> = {
    Select: '.ant-select-item-empty',
    AutoComplete: '.ant-select-item-empty',
    TreeSelect: '.ant-select-empty,.ant-select-item-empty',
    Cascader: '.ant-cascader-menu-empty',
    CascaderPanel: '.ant-cascader-panel-empty,.ant-cascader-menu-empty',
    Transfer: '.ant-transfer-list-body-not-found',
    Mentions: '.ant-mentions-dropdown-menu-item-disabled',
    Table: '.ant-table-placeholder .ant-table-cell',
    'Table.filter': '.filter-options,.ant-table-filter-dropdown'
  };
  const slots = [...frame.querySelectorAll<HTMLElement>(selectors[component])].filter(node =>
    node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden'
      && !node.closest('[hidden],[inert]')
  );
  const outer = slots.filter(node => !slots.some(other => other !== node && other.contains(node)));

  return outer.map(node => {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('svg,style,.ant-table-filter-dropdown-btns').forEach(child => child.remove());
    const text = clone.textContent!.trim().replace(/\s+/g, ' ');
    const empty = [...node.querySelectorAll<HTMLElement>('.ant-empty')].map(root => ({
      normal: root.classList.contains('ant-empty-normal'),
      small: root.classList.contains('ant-empty-small'),
      description: root.querySelector('.ant-empty-description')?.textContent ?? null,
      imageHeight: getComputedStyle(root.querySelector('.ant-empty-image')!).height
    }));

    return text || empty.length ? { text, empty } : null;
  }).filter(value => value !== null);
}
