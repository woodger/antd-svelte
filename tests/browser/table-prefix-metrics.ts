/** Измеряет Table paint с независимыми owner/shared namespaces. */
export function snapshotTablePrefix() {
  const host = document.querySelector<HTMLElement>('[data-table-prefix-host]');
  const prefix = host?.dataset.tablePrefix;
  if (!host || !prefix) throw new Error('Table prefix host is missing');
  const root = host.querySelector(`.${prefix}-wrapper`);
  if (!root) throw new Error('Table prefix root is missing');
  const css = (node: Element | null, keys: readonly string[], pseudo?: string) => {
    if (!node) return null;
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const cell = [...typography, 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background-color', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color'];
  const row = root.querySelector(`tbody tr.${prefix}-row`);
  const head = root.querySelector('thead');
  const expanded = root.querySelector(`.${prefix}-expanded-row > td`);
  const expandedContent = expanded?.querySelector('.expanded-content') ?? expanded;
  const expandIcon = root.querySelector(`.${prefix}-row-expand-icon`);
  const candidate = document.querySelector(`.${prefix}-filter-dropdown`);
  const filter = candidate?.getClientRects().length ? candidate : null;

  return {
    root: css(root, ['direction']),
    table: css(root.querySelector(`.${prefix}`), [...typography, 'background-color']),
    headers: [...(head?.querySelectorAll(`th:not(.${prefix}-selection-column):not(.${prefix}-row-expand-icon-cell)`) ?? [])]
      .map(node => css(node, cell)),
    cells: [...(row?.querySelectorAll(`td:not(.${prefix}-selection-column):not(.${prefix}-row-expand-icon-cell)`) ?? [])]
      .map(node => css(node, cell)),
    split: css(head?.querySelector(`th:not(.${prefix}-selection-column):not(.${prefix}-row-expand-icon-cell)`) ?? null,
      ['background-color', 'width', 'height'], '::before'),
    sorter: css(root.querySelector(`.${prefix}-column-sorter`), ['color', 'font-size']),
    selectionCol: css(root.querySelector(`col.${prefix}-selection-col`), ['width']),
    selection: css(row?.querySelector(`.${prefix}-selection-column`) ?? null,
      ['padding-inline-start', 'padding-inline-end', 'background-color']),
    expandCol: css(root.querySelector(`col.${prefix}-expand-icon-col`), ['width']),
    expandIcon: css(expandIcon, ['width', 'height', 'color', 'background-color', 'border-top-width',
      'border-top-style', 'border-top-color', 'border-radius', 'transform', 'line-height']),
    expandBefore: css(expandIcon, ['top', 'inset-inline-start', 'inset-inline-end', 'height',
      'background-color', 'transform'], '::before'),
    expandAfter: css(expandIcon, ['top', 'bottom', 'inset-inline-start', 'width',
      'background-color', 'transform'], '::after'),
    expandedBackground: css(expanded, ['background-color']),
    expandedPadding: css(expandedContent ?? null,
      ['padding-top', 'padding-right', 'padding-bottom', 'padding-left']),
    filterTrigger: css(root.querySelector(`.${prefix}-filter-trigger`), ['color', 'background-color']),
    filterPanel: css(filter, ['background-color', 'color', 'font-family', 'font-size', 'line-height']),
    filterMenu: css(filter?.querySelector('[role=menu], .filter-options') ?? null,
      ['background-color'])
  };
}
