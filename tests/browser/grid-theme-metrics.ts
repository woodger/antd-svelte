export function snapshotGridTheme() {
  const row = document.querySelector('#grid-theme-control .ant-row');
  if (!row) throw new Error('Grid row is missing');
  const css = (node: Element) => {
    const style = getComputedStyle(node);
    return Object.fromEntries([
      'font-family', 'font-size', 'line-height', 'color', 'display', 'flex-basis',
      'width', 'max-width', 'margin-left', 'margin-right', 'padding-left', 'padding-right',
      'row-gap', 'align-items', 'justify-content', 'flex-wrap'
    ].map(key => [key, style.getPropertyValue(key)]));
  };

  return { row: css(row), cols: [...row.querySelectorAll('.ant-col')].map(css) };
}
