export function snapshotCorePrefix() {
  const style = (node: Element) => {
    const css = getComputedStyle(node);
    return Object.fromEntries([
      'display',
      'font-size',
      'line-height',
      'color',
      'direction',
      'background-color',
      'padding',
      'gap',
      'flex-direction',
      'border-top-width',
      'margin-block-start',
      'margin-block-end'
    ].map(key => [key, css.getPropertyValue(key)]));
  };
  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^(css-|s-[\w-]{12}$)/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();

  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-core-prefix-scope]')]
    .map(scope => [scope.dataset.corePrefixScope,
      Object.fromEntries([...scope.querySelectorAll<HTMLElement>('[data-prefix-widget]')]
        .map(host => {
          const root = host.firstElementChild!;
          return [host.dataset.prefixWidget, {
            classes: classes(root),
            style: style(root),
            items: host.dataset.prefixWidget === 'segmented'
              ? [...root.querySelectorAll('label')].map(label => ({
                classes: classes(label),
                checked: label.querySelector('input')!.checked,
                value: label.querySelector('input')!.value,
                style: style(label)
              })) : null,
            content: host.dataset.prefixWidget === 'divider'
              ? style(root.querySelector('[class*="-inner-text"]')!) : null
          }];
        }))
    ]));
}
