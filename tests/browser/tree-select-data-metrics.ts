/** Source/Native DOM без чтения внутреннего store или вычисления ожидаемых значений. */
export function readTreeSelectData(options: { treePrefix: string; }) {
  const root = document.querySelector('[data-tree-select-data-control]')!;
  const input = root.querySelector<HTMLInputElement>('[role="combobox"]')!;
  const opened = input.getAttribute('aria-expanded') === 'true';
  const popup = [...document.querySelectorAll<HTMLElement>('.ant-select-dropdown')]
    .find(node => !node.hidden && getComputedStyle(node).display !== 'none');
  const { treePrefix } = options;
  const rows = opened && popup ? [...popup.querySelectorAll<HTMLElement>('[role="treeitem"]')] : [];
  const rich = root.querySelector('.single-snippet');
  const selected = root.querySelector('.ant-select-selection-item');
  const content = root.querySelector('.ant-select-content');
  return {
    opened,
    selected: opened ? null : rich?.textContent ?? selected?.textContent
      ?? (input.hasAttribute('data-ant-tree-choice-input') ? input.value : content?.textContent ?? input.value),
    tags: [...root.querySelectorAll('.ant-select-selection-item-content')].map(node => node.textContent),
    nodes: rows.map(node => ({
      value: /-(0|1|2|3|4|tail|existing)$/.exec(node.id)?.[1] ?? null,
      title: node.querySelector(`.${treePrefix}-title`)?.textContent,
      expanded: node.getAttribute('aria-expanded') === 'true',
      selected: node.classList.contains(`${treePrefix}-treenode-selected`),
      checked: Boolean(node.querySelector(`.${treePrefix}-checkbox-checked`)),
      halfChecked: Boolean(node.querySelector(`.${treePrefix}-checkbox-indeterminate`)),
      disabled: node.classList.contains(`${treePrefix}-treenode-disabled`),
      filtered: node.classList.contains('filter-node')
    }))
  };
}
