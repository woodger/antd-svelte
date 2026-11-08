export function snapshotAnchorPrefix() {
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
    [...document.querySelectorAll<HTMLElement>('[data-anchor-prefix-scope]')].map(host => {
      const root = host.querySelector('.fixture-anchor-prefix-root')!;
      const content = root.firstElementChild!;
      const ink = content.firstElementChild as HTMLElement;

      return [host.dataset.anchorPrefixScope!, {
        classes: classes(root),
        root: style(root, ['margin-block-start', 'padding-block-start', 'direction', 'max-height']),
        content: { classes: classes(content), style: style(content, [
          'display', 'position', 'padding-inline-start', 'font-size', 'line-height', 'color'
        ]) },
        links: [...root.querySelectorAll('a')].map(link => ({
          classes: classes(link),
          itemClasses: classes(link.parentElement!),
          href: link.getAttribute('href'),
          title: link.title,
          item: style(link.parentElement!, ['padding-block-start', 'padding-inline-start']),
          style: style(link, [
            'display', 'font-size', 'color', 'margin-block-end', 'text-decoration-line'
          ])
        })),
        ink: { classes: classes(ink), top: ink.style.top, left: ink.style.left,
          width: ink.style.width, height: ink.style.height,
          style: style(ink, ['display', 'position', 'width', 'height', 'background-color']) }
      }];
    })
  );
}
