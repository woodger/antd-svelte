export function readTreeSelectNodes(treePrefix: string) {
  const root = document.querySelector('[data-tree-select-node-control]')!;
  const input = root.querySelector<HTMLInputElement>('[role="combobox"]')!;
  const open = input.getAttribute('aria-expanded') === 'true';
  const popup = [...document.querySelectorAll<HTMLElement>('.ant-select-dropdown')]
    .find(node => !node.hidden && getComputedStyle(node).display !== 'none');
  const rows = open && popup
    ? [...popup.querySelectorAll<HTMLElement>(`.${treePrefix}-list-holder .${treePrefix}-treenode`)] : [];
  const rich = root.querySelector('.single-snippet');
  const selected = root.querySelector('.ant-select-selection-item');
  const content = root.querySelector('.ant-select-content');
  return {
    open,
    selected: open ? null : rich?.textContent ?? selected?.textContent
      ?? (input.hasAttribute('data-ant-tree-choice-input') ? input.value : content?.textContent ?? input.value),
    tags: [...root.querySelectorAll('.ant-select-selection-item-content')].map(node => node.textContent),
    rows: rows.map(row => ({
      title: row.querySelector(`.${treePrefix}-title`)?.textContent ?? null,
      marker: row.getAttribute('data-node-marker'),
      ariaLabel: row.getAttribute('aria-label'),
      expanded: row.getAttribute('aria-expanded') === 'true',
      selected: row.classList.contains(`${treePrefix}-treenode-selected`),
      ariaSelected: row.getAttribute('aria-selected'),
      checked: Boolean(row.querySelector(`.${treePrefix}-checkbox-checked`)),
      checkbox: Boolean(row.querySelector(`.${treePrefix}-checkbox`)),
      disabled: row.classList.contains(`${treePrefix}-treenode-disabled`),
      className: row.classList.contains('node-source-class'),
      margin: row.style.marginBottom,
      icon: row.querySelector(`.${treePrefix}-iconEle`)?.textContent ?? null,
      customIcon: Boolean(row.querySelector(`.${treePrefix}-icon__customize`)),
      switcher: row.querySelector('[data-node-switcher]')?.textContent
        ?? row.querySelector('[data-global-switcher]')?.textContent
        ?? row.querySelector(`.${treePrefix}-switcher`)?.textContent ?? null
    })),
    changeLabels: document.querySelector('[data-node-change-labels]')?.textContent ?? '',
    events: JSON.parse(document.querySelector('[data-node-events]')?.textContent ?? '[]'),
    globalIconCalled: Boolean(document.querySelector('[data-unused-tree-icon]'))
  };
}
