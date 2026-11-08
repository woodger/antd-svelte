export function snapshotBreadcrumbPrefix() {
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
    [...document.querySelectorAll<HTMLElement>('[data-breadcrumb-prefix-scope]')].map(host => {
      const root = host.querySelector('nav')!;
      const bounds = root.getBoundingClientRect();
      const entries = [...root.querySelector('ol')!.children];

      return [host.dataset.breadcrumbPrefixScope!, {
        classes: classes(root),
        root: style(root, ['font-size', 'line-height', 'color', 'direction']),
        items: entries.filter(node => !node.hasAttribute('aria-hidden')).map(node => {
          const label = node.querySelector<HTMLElement>('[data-prefix-label]')!;
          const text = label.getBoundingClientRect();
          const link = label.closest('a, button') ?? label.parentElement!;
          const overlay = node.querySelector('[data-prefix-arrow]')?.parentElement;

          return {
            classes: classes(node),
            text: label.textContent,
            href: link.getAttribute('href'),
            linkClasses: classes(link).filter(name => !name.endsWith('-overlay-link')),
            x: text.x - bounds.x,
            y: text.y - bounds.y,
            label: style(label, ['font-size', 'color', 'line-height']),
            link: style(link, ['padding-inline-start', 'margin-inline-start', 'text-decoration-line']),
            overlay: overlay ? style(overlay, ['height', 'padding-inline-start', 'color']) : null
          };
        }),
        // Source semantic workaround добавляет второй separator class; owner classes проверяет SSR.
        separators: entries.filter(node => node.hasAttribute('aria-hidden')).map(node => ({
          text: node.textContent,
          style: style(node, ['margin-inline-start', 'margin-inline-end', 'color'])
        }))
      }];
    })
  );
}
