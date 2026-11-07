export function snapshotGridBreakpoints() {
  const root = document.querySelector('#grid-breakpoints-control');
  if (!root) throw new Error('Grid breakpoint control is missing');
  const css = (node: Element) => {
    const style = getComputedStyle(node);
    return Object.fromEntries([
      'display', 'flex', 'max-width', 'width', 'order', 'inset-inline-start',
      'inset-inline-end', 'margin-inline-start', 'margin-inline-end',
      'padding-inline-start', 'padding-inline-end', 'row-gap',
      'align-items', 'justify-content', 'flex-wrap', 'min-width'
    ].map(key => [key, style.getPropertyValue(key)]));
  };

  return [...root.querySelectorAll('.ant-row')].map(row => ({
    row: css(row), cols: [...row.children].map(css)
  }));
}
