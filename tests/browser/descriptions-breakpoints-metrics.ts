/** Снимает раскладку responsive column/span, не привязываясь к Svelte wrappers. */
export function snapshotDescriptionsBreakpoints() {
  const root = document.querySelector('[data-descriptions-breakpoints-host] > div');
  if (!root) throw new Error('Descriptions breakpoint root is missing');

  const text = (cell: Element, part: string) => {
    const selector = `.ant-descriptions-item-${part}`;
    const nodes = cell.matches(selector) ? [cell] : [...cell.querySelectorAll(selector)];

    return nodes.map(node => node.textContent?.trim());
  };

  return [...root.querySelectorAll('tbody > tr')].map(row =>
    [...row.querySelectorAll<HTMLTableCellElement>(':scope > th, :scope > td')].map(cell => ({
      tag: cell.tagName.toLowerCase(),
      span: cell.colSpan,
      labels: text(cell, 'label'),
      contents: text(cell, 'content'),
      input: cell.querySelector('input') !== null
    }))
  );
}
