export function snapshotTypographyPrefix() {
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
    [...document.querySelectorAll<HTMLElement>('[data-typography-prefix-scope]')].map(host => [
      host.dataset.typographyPrefixScope!,
      Object.fromEntries([...host.querySelectorAll('[data-prefix-part]')].map(part => {
        const root = part.firstElementChild!;

        return [part.getAttribute('data-prefix-part')!, {
          tag: root.tagName,
          classes: classes(root),
          style: style(root, ['font-size', 'font-weight', 'line-height', 'color', 'direction',
            'margin-top', 'margin-bottom', 'text-decoration-line', 'overflow', 'text-overflow',
            'white-space']),
          decorations: [...root.querySelectorAll('strong,mark,code')].map(node => ({
            tag: node.tagName,
            style: style(node, ['font-size', 'font-weight', 'background-color', 'padding-inline-start',
              'border-top-width'])
          })),
          actions: [...root.querySelectorAll('button')].map(node => ({
            classes: classes(node),
            style: style(node, ['color', 'margin-inline-start', 'font-size'])
          })),
          editor: root.querySelector('textarea') ? {
            style: style(root.querySelector('textarea')!, ['font-size', 'line-height', 'font-weight',
              'padding-top', 'padding-inline-start', 'border-top-width'])
          } : null
        }];
      }))
    ])
  );
}
