export function snapshotButtonPrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !name.startsWith('svelte-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-button-prefix-scope]')].map(host => [
      host.dataset.buttonPrefixScope!,
      [...host.querySelectorAll('.fixture-button-prefix')].map(root => ({
        classes: classes(root),
        tag: root.tagName,
        root: style(root, ['height', 'padding-top', 'padding-inline-start', 'padding-inline-end',
          'font-size', 'line-height', 'font-weight', 'color', 'background-color', 'border-top-color',
          'border-top-width', 'border-top-style', 'border-radius', 'box-shadow', 'gap',
          'opacity', 'cursor', 'flex-direction', 'direction']),
        content: style(root.querySelector('.fixture-button-content')!, ['letter-spacing',
          'margin-inline-end']),
        icon: root.querySelector('.fixture-button-icon')
          ? style(root.querySelector('.fixture-button-icon')!, ['display', 'align-items']) : null
      }))
    ])
  );
}
