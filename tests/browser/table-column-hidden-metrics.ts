export function snapshotTableColumnHidden() {
  const root = document.querySelector('#table-column-hidden-control')!;
  const cell = (node: Element) => ({
    tagName: node.tagName,
    text: (node as HTMLElement).innerText.trim(),
    textContent: node.textContent!.trim(),
    scope: node.getAttribute('scope'),
    colspan: node.getAttribute('colspan'),
    colSpan: (node as HTMLTableCellElement).colSpan,
    name: node.classList.contains('user-name-cell'),
    score: node.classList.contains('user-score-cell')
  });

  return {
    head: Array.from(root.querySelectorAll('thead th'), cell),
    rows: Array.from(root.querySelectorAll('tbody tr.ant-table-row'), row =>
      Array.from(row.children, cell)),
    expanded: Array.from(root.querySelectorAll('tbody tr.ant-table-expanded-row > td'), cell),
    empty: Array.from(root.querySelectorAll('tbody tr.ant-table-placeholder > td'), cell),
    colgroup: Array.from(root.querySelectorAll<HTMLTableColElement>('colgroup col'), node =>
      node.style.width),
    colgroups: root.querySelectorAll('colgroup').length,
    selectionCheckboxes: root.querySelectorAll('.ant-table-selection-column input[type="checkbox"]').length,
    checkboxes: root.querySelectorAll('table input[type="checkbox"]').length
  };
}
