export function snapshotTableColumnClasses() {
  const root = document.querySelector('#table-column-classes-control');
  if (!root) throw new Error('Table column class control is missing');
  const cells = (nodes: Iterable<Element>) => [...nodes].map(node => {
    const css = getComputedStyle(node);

    return {
      userClasses: [...node.classList].filter(name => name.startsWith('user-col-')),
      textTransform: css.textTransform,
      letterSpacing: css.letterSpacing
    };
  });

  return {
    head: cells(root.querySelectorAll('thead th')),
    rows: [...root.querySelectorAll('tbody tr.ant-table-row')].map(row => cells(row.children))
  };
}
