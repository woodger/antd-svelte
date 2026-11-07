export function snapshotDescriptionsConfiguration() {
  const root = document.querySelector('#descriptions-config-fixture .ant-descriptions')!;

  return Object.fromEntries(['root', 'header', 'title', 'extra', 'label', 'content'].map(key => {
    const nodes = key === 'root' ? [root] : [...root.querySelectorAll(
      key === 'label' || key === 'content' ? `.ant-descriptions-item-${key}`
        : `.ant-descriptions-${key}`)];

    return [key, nodes.map(node => {
      const css = getComputedStyle(node);
      const cell = node.closest<HTMLTableCellElement>('th,td');

      return {
        tag: node.tagName.toLowerCase(),
        colspan: cell?.colSpan ?? null,
        classes: [...node.classList].filter(name => /^(context|local|item)-/.test(name)),
        styles: Object.fromEntries(['color', 'background-color', 'padding-top', 'margin-top',
          'margin-bottom', 'opacity'].map(name => [name, css.getPropertyValue(name)]))
      };
    })];
  }));
}
