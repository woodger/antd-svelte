export function snapshotInputPrefix() {
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };
  const control = (root: Element, leafSelector: string) => {
    const leaf = root.matches(leafSelector) ? root : root.querySelector(leafSelector)!;
    const clear = root.querySelector('.fixture-input-clear');
    const count = root.querySelector('.fixture-input-count');

    return {
      root: style(root, ['width', 'height', 'box-sizing', 'padding-top', 'padding-bottom',
        'padding-inline-start', 'padding-inline-end', 'border-top-width', 'border-top-color',
        'border-radius', 'background-color', 'color', 'font-size', 'line-height', 'direction']),
      leaf: style(leaf, ['height', 'padding-top', 'padding-bottom', 'padding-inline-start',
        'padding-inline-end', 'border-top-width', 'background-color', 'color', 'font-size',
        'line-height', 'resize']),
      value: (leaf as HTMLInputElement).value,
      clear: clear ? style(clear, ['visibility', 'border-top-width', 'background-color',
        'font-size', 'position']) : null,
      count: count ? { text: count.textContent?.trim(), style: style(count, ['position',
        'font-size', 'color', 'inset-inline-end', 'bottom']) } : null
    };
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-input-prefix-scope]')].map(host => [
      host.dataset.inputPrefixScope!, {
        input: control(host.querySelector('.fixture-input-root')!, 'input'),
        textarea: control(host.querySelector('.fixture-textarea-root')!, 'textarea')
      }
    ])
  );
}
