export function snapshotTableHeader() {
  const root = document.querySelector('#table-header-control .ant-table');
  if (!root) throw new Error('Table header fixture is missing');
  const css = (node: Element | null) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries([
      'font-size', 'line-height', 'color', 'background-color',
      'padding-top', 'padding-left', 'padding-bottom', 'padding-right',
      'border-top-width', 'border-top-color', 'border-bottom-width', 'border-bottom-color',
      'border-top-left-radius', 'border-top-right-radius',
      'border-bottom-left-radius', 'border-bottom-right-radius'
    ].map(key => [key, style.getPropertyValue(key)]));
  };
  const row = root.querySelector('tbody tr');
  return {
    headerCells: root.querySelectorAll('thead th').length,
    noHeader: root.classList.contains('ant-table-no-header'),
    title: css(root.querySelector(':scope > .ant-table-title')),
    container: css(root.querySelector('.ant-table-container')),
    cells: [...(row?.children ?? [])].map(node => css(node)),
    caption: root.querySelector('caption')?.textContent,
    bodyRows: root.querySelectorAll('tbody tr.ant-table-row').length
  };
}
