/** Title/footer соответствуют Source Panel; caption остаётся нативным именем таблицы. */
export function snapshotTablePanels() {
  const root = document.querySelector('#table-panels-control .ant-table');
  if (!root) throw new Error('Table panels are missing');
  const css = (node: Element | null) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries([
      'font-family', 'font-size', 'font-weight', 'line-height', 'color', 'background-color',
      'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-radius',
      'border-top-width', 'border-top-style', 'border-top-color',
      'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
      'border-left-width', 'border-left-style', 'border-left-color',
      'border-right-width', 'border-right-style', 'border-right-color'
    ].map(key => [key, style.getPropertyValue(key)]));
  };
  const title = root.querySelector(':scope > .ant-table-title');
  const footer = root.querySelector(':scope > .ant-table-footer');

  return {
    title: css(title),
    footer: css(footer),
    children: [...root.children].map(node => node.classList.contains('ant-table-title') ? 'title'
      : node.classList.contains('ant-table-footer') ? 'footer' : 'container'),
    titleData: title?.querySelector('[data-title-data]')?.textContent ?? null,
    footerData: footer?.querySelector('[data-footer-data]')?.textContent ?? null,
    caption: root.querySelector('caption')?.textContent ?? null,
    tableRadius: getComputedStyle(root.querySelector('table')!).borderRadius
  };
}
