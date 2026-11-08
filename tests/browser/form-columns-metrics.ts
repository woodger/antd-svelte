export function formColumnsMetrics() {
  function properties(node: Element, names: string[]) {
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map((key) => [key, style.getPropertyValue(key)]));
  }

  return [...document.querySelectorAll('.columns-root,.columns-inner')].map((item) => {
    const row = item.querySelector(':scope > .ant-form-item-row')!;
    const label = row.querySelector(':scope > .ant-form-item-label')!;
    const control = row.querySelector(':scope > .ant-form-item-control')!;
    const rect = row.getBoundingClientRect();

    function metrics(node: Element) {
      const bounds = node.getBoundingClientRect();

      return {
        classes: [...node.classList].filter((name) =>
          /^ant-col(?:$|-(?:[0-9]|(?:xs|sm|md|lg|xl|xxl|xxxl|order|offset|push|pull)-|rtl$))/.test(name)
        ).sort(),
        box: node.getClientRects().length ? {
          x: Math.round((bounds.x - rect.x) * 100) / 100,
          y: Math.round((bounds.y - rect.y) * 100) / 100,
          width: Math.round(bounds.width * 100) / 100,
          height: Math.round(bounds.height * 100) / 100
        } : null,
        style: properties(node, [
          'display', 'flex', 'max-width', 'margin-inline-start', 'order',
          'padding-inline-start', 'padding-inline-end'
        ])
      };
    }

    return {
      name: item.classList.contains('columns-root') ? 'root' : 'inner',
      label: metrics(label), control: metrics(control),
      row: properties(row, ['display', 'flex-wrap', 'direction']), text: label.textContent
    };
  });
}
