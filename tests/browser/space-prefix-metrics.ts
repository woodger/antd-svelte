export function snapshotSpacePrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);
    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-space-prefix-scope]')].map(host => {
      const space = host.querySelector('.fixture-space-prefix')!;
      const compact = host.querySelector('.fixture-compact-prefix')!;
      const addons = compact.querySelectorAll('.fixture-addon-prefix');
      const badge = space.querySelector('[data-space-prefix-badge]')!;

      return [host.dataset.spacePrefixScope!, {
        space: { classes: classes(space), style: style(space, [
          'display', 'flex-direction', 'direction', 'align-items', 'column-gap', 'row-gap',
          'font-size', 'color'
        ]), children: [...space.children].map(node => ({ classes: classes(node),
          text: node.tagName === 'SPAN' ? node.textContent : null,
          style: style(node, ['display', 'box-sizing']) })) },
        badge: style(badge, ['display']),
        compact: { classes: classes(compact), style: style(compact, [
          'display', 'flex-direction', 'direction', 'width', 'font-size'
        ]) },
        addons: [...addons].map(node => ({ classes: classes(node), style: style(node, [
          'display', 'font-size', 'color', 'background-color',
          'border-top-width', 'border-inline-start-width', 'border-inline-end-width',
          'border-top-color', 'border-start-start-radius', 'border-start-end-radius',
          'border-end-start-radius', 'border-end-end-radius', 'padding-inline-start',
          'margin-inline-end', 'z-index'
        ]) }))
      }];
    })
  );
}
