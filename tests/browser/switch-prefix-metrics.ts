export function snapshotSwitchPrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !name.startsWith('svelte-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();
  const style = (node: Element, properties: string[], pseudo?: string) => {
    const computed = getComputedStyle(node, pseudo);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-switch-prefix-scope]')].map(host => {
      const root = host.querySelector<HTMLButtonElement>('.fixture-switch-prefix')!;
      const handle = root.querySelector('.fixture-switch-handle')!;
      const inner = handle.nextElementSibling!;

      return [host.dataset.switchPrefixScope!, {
        classes: classes(root),
        checked: root.getAttribute('aria-checked'),
        disabled: root.disabled,
        root: style(root, ['height', 'min-width', 'width', 'line-height', 'direction',
          'background-color', 'border-radius', 'opacity', 'cursor']),
        handle: style(handle, ['width', 'height', 'inset-inline-start', 'top', 'color']),
        thumb: style(handle, ['background-color', 'border-radius', 'box-shadow'], '::before'),
        inner: style(inner, ['height', 'padding-inline-start', 'padding-inline-end']),
        captions: [...inner.children].map(node => ({
          text: node.textContent,
          style: style(node, ['font-size', 'color', 'margin-inline-start', 'margin-inline-end',
            'margin-top'])
        }))
      }];
    })
  );
}
