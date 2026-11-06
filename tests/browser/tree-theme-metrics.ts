export function snapshotTreeTheme() {
  function properties(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-tree-theme]')].map(host => {
      const root = host.querySelector('.ant-tree')!;
      return [host.dataset.treeTheme!, {
        root: properties(root, ['background-color', 'border-radius', 'direction']),
        list: properties(root.querySelector('.ant-tree-list'), font),
        nodes: Object.fromEntries(['Parent', 'Alpha', 'Beta', 'Gamma', 'Other'].map(title => {
          const text = [...root.querySelectorAll('.ant-tree-title')]
            .find(node => node.textContent === title)!;
          const node = text.closest('.ant-tree-treenode')!;
          const content = text.closest('.ant-tree-node-content-wrapper')!;
          return [title, {
            node: properties(node, ['padding-bottom']),
            content: properties(content, [...font, 'min-height', 'padding-left', 'padding-right',
              'background-color', 'border-radius']),
            switcher: properties(node.querySelector('.ant-tree-switcher'), ['width', 'line-height']),
            indent: properties(node.querySelector('.ant-tree-indent-unit'), ['width']),
            checkbox: properties(node.querySelector('.ant-tree-checkbox-inner'),
              ['width', 'height', 'background-color', 'border-color', 'border-width'])
          }];
        }))
      }];
    })
  );
}

export function snapshotTreeThemeComposition() {
  const popup = document.querySelector('.ant-tree-select-dropdown')!;
  const prefix = popup.querySelector('.ant-select-tree') ? 'ant-select-tree' : 'ant-tree';
  const row = [...popup.querySelectorAll(`.${prefix}-treenode`)]
    .find(node => node.querySelector(`.${prefix}-title`)?.textContent === 'Alpha')!;
  const names = ['font-size', 'line-height', 'font-family', 'color', 'background-color',
    'width', 'height', 'padding-left', 'padding-right', 'border-width'];
  const parts = {
    select: document.querySelector('.tree-theme-composition'),
    tree: popup.querySelector(`.${prefix}`),
    content: row.querySelector(`.${prefix}-node-content-wrapper`),
    switcher: row.querySelector(`.${prefix}-switcher`),
    indent: row.querySelector(`.${prefix}-indent-unit`),
    checkbox: row.querySelector(`.${prefix}-checkbox`)
  };

  return Object.fromEntries(Object.entries(parts).map(([name, node]) => {
    const style = getComputedStyle(node!);
    const keys = name === 'content' ? [...names, 'min-height'] : names;
    return [name, Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]))];
  }));
}
