export function snapshotTreePrefix() {
  function properties(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  return Object.fromEntries(
    [document.querySelector<HTMLElement>('.fixture-tree-prefix')!].map(root => {
      const prefix = [...root.classList].find(value => !/^(?:css-|svelte-|s-|fixture-)/.test(value))!;
      const selector = (suffix: string) => `[class~="${prefix}${suffix}"]`;
      return ['tree', {
        root: properties(root, ['background-color', 'border-radius', 'direction']),
        list: properties(root.querySelector(selector('-list')), font),
        nodes: Object.fromEntries(['Parent', 'Alpha', 'Beta', 'Gamma', 'Other'].map(title => {
          const text = [...root.querySelectorAll(selector('-title'))]
            .find(node => node.textContent === title)!;
          const node = text.closest(selector('-treenode'))!;
          const content = text.closest(selector('-node-content-wrapper'))!;
          return [title, {
            node: properties(node, ['padding-bottom']),
            content: properties(content, [...font, 'min-height', 'padding-left', 'padding-right',
              'background-color', 'border-radius']),
            switcher: properties(node.querySelector(selector('-switcher')), ['width', 'line-height']),
            indent: properties(node.querySelector(selector('-indent-unit')), ['width']),
            checkbox: properties(node.querySelector(selector('-checkbox-inner')),
              ['width', 'height', 'background-color', 'border-color', 'border-width'])
          }];
        }))
      }];
    })
  );
}
