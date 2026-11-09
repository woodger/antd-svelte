export function snapshotInputSearchPrefix() {
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-search-prefix-scope]')].map(host => {
      const root = host.querySelector('.fixture-search-root')!;
      const leaf = root.querySelector('input')!;
      const field = [...root.children].find(node => node === leaf || node.contains(leaf))!;
      const button = root.lastElementChild!;
      const global = host.dataset.searchGlobal || 'ant';

      return [host.dataset.searchPrefixScope!, {
        root: style(root, ['width', 'height', 'display', 'font-size', 'direction',
          `--${global.replace(/\./g, '')}-input-search-btn-height`]),
        field: style(field, ['width', 'height', 'padding-top', 'padding-bottom',
          'padding-inline-start', 'border-start-start-radius', 'border-end-end-radius',
          'border-top-color', 'background-color', 'color', 'font-size']),
        input: style(leaf, ['height', 'font-size', 'line-height', 'background-color', 'color']),
        button: style(button, ['width', 'height', 'min-width', 'min-height', 'padding-inline-start',
          'border-start-start-radius', 'border-end-end-radius', 'background-color',
          'border-top-color', 'color', 'font-size']),
        value: leaf.value
      }];
    })
  );
}
