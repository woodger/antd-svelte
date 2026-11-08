export function snapshotSplitterPrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();
  const style = (node: Element, properties: string[], pseudo?: string) => {
    const computed = getComputedStyle(node, pseudo);
    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };
  const surface = ['width', 'height', 'display', 'background-color'];

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-splitter-prefix-scope]')].map(host => {
      const root = host.firstElementChild!;
      const dragger = root.querySelector('[role="separator"]')!;
      const bar = dragger.parentElement!;
      const preview = [...bar.children].find(node => [...node.classList]
        .some(name => name.endsWith('-bar-preview')));
      const panels = [...root.children].filter(node => node !== bar
        && !node.hasAttribute('aria-hidden'));

      return [host.dataset.splitterPrefixScope!, {
        classes: classes(root),
        root: style(root, [
          'width', 'height', 'display', 'flex-direction', 'direction', 'font-size', 'color'
        ]),
        panels: panels.map(panel => ({
          classes: classes(panel),
          style: style(panel, ['width', 'height', 'flex-basis', 'flex-grow', 'overflow'])
        })),
        bar: { classes: classes(bar), style: style(bar, ['width', 'height', 'position']) },
        dragger: { classes: classes(dragger), style: style(dragger, [
          'width', 'height', 'cursor', 'transform'
        ]), aria: ['aria-orientation', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax']
          .map(name => dragger.getAttribute(name)) },
        before: style(dragger, surface, '::before'),
        after: style(dragger, surface, '::after'),
        collapse: [...bar.querySelectorAll('[aria-label^="Toggle "]')].map(button => ({
          classes: classes(button),
          style: style(button, [
            'width', 'height', 'left', 'right', 'background-color', 'color',
            'display', 'opacity', 'border-top-width', 'padding-left'
          ])
        })),
        preview: preview ? { classes: classes(preview), style: style(preview, [
          ...surface, 'opacity', 'pointer-events', 'transform'
        ]), variables: [...(preview as HTMLElement).style]
          .filter(name => name.endsWith('-splitter-bar-preview-offset'))
          .map(name => [name, (preview as HTMLElement).style.getPropertyValue(name)]) } : null
      }];
    })
  );
}
