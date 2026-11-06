/** Сравнивает theme-owned CSS, сохраняя нативные controls и expanded-row viewport. */
export function snapshotTableTheme() {
  const root = document.querySelector('#table-theme-control .ant-table-wrapper');
  if (!root) throw new Error('Table theme root is missing');
  const css = (node: Element | null, keys: readonly string[], pseudo?: string) => {
    if (!node) return null;
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const cell = [...typography, 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background-color', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color'];
  const row = root.querySelector('tbody tr.ant-table-row');
  const head = root.querySelector('thead');
  const expanded = root.querySelector('.ant-table-expanded-row > td');
  const expandedContent = expanded?.querySelector('.expanded-content') ?? expanded;
  const expandIcon = root.querySelector('.ant-table-row-expand-icon');
  const candidate = document.querySelector('.ant-table-filter-dropdown');
  const filter = candidate?.getClientRects().length ? candidate : null;

  return {
    root: css(root, ['direction']),
    table: css(root.querySelector('.ant-table'), [...typography, 'background-color']),
    headers: [...(head?.querySelectorAll('th:not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell)') ?? [])]
      .map(node => css(node, cell)),
    cells: [...(row?.querySelectorAll('td:not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell)') ?? [])]
      .map(node => css(node, cell)),
    split: css(head?.querySelector('th:not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell)') ?? null,
      ['background-color', 'width', 'height'], '::before'),
    sorter: css(root.querySelector('.ant-table-column-sorter'), ['color', 'font-size']),
    selectionCol: css(root.querySelector('col.ant-table-selection-col'), ['width']),
    selection: css(row?.querySelector('.ant-table-selection-column') ?? null,
      ['padding-inline-start', 'padding-inline-end', 'background-color']),
    expandCol: css(root.querySelector('col.ant-table-expand-icon-col'), ['width']),
    expandIcon: css(expandIcon, ['width', 'height', 'color', 'background-color', 'border-top-width',
      'border-top-style', 'border-top-color', 'border-radius', 'transform', 'line-height']),
    expandBefore: css(expandIcon, ['top', 'inset-inline-start', 'inset-inline-end', 'height',
      'background-color', 'transform'], '::before'),
    expandAfter: css(expandIcon, ['top', 'bottom', 'inset-inline-start', 'width',
      'background-color', 'transform'], '::after'),
    expandedBackground: css(expanded, ['background-color']),
    expandedPadding: css(expandedContent ?? null,
      ['padding-top', 'padding-right', 'padding-bottom', 'padding-left']),
    filterTrigger: css(root.querySelector('.ant-table-filter-trigger'), ['color', 'background-color']),
    filterPanel: css(filter, ['background-color', 'color', 'font-family', 'font-size', 'line-height']),
    filterMenu: css(filter?.querySelector('.ant-dropdown-menu, .filter-options') ?? null,
      ['background-color'])
  };
}
