export function snapshotTableRowScope() {
  const root = document.querySelector('#table-row-scope-control')!;
  const cells = (nodes: HTMLCollection) => Array.from(nodes, node => {
    const css = getComputedStyle(node);
    return { tagName: node.tagName, scope: node.getAttribute('scope'),
      text: node.textContent!.trim(), fontWeight: css.fontWeight,
      textAlign: css.textAlign, color: css.color, backgroundColor: css.backgroundColor,
      paddingBlock: css.paddingBlock, paddingInline: css.paddingInline,
      borderBottomWidth: css.borderBottomWidth, borderBottomStyle: css.borderBottomStyle,
      borderBottomColor: css.borderBottomColor };
  });

  return { head: Array.from(root.querySelectorAll('thead th'), node => ({
    tagName: node.tagName, scope: node.getAttribute('scope')
  })), rows: Array.from(root.querySelectorAll('tbody tr.ant-table-row'), row => cells(row.children)) };
}
