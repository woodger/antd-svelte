export function snapshotCardPrefix() {
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
    [...document.querySelectorAll<HTMLElement>('[data-card-prefix-scope]')].map(host => {
      const root = host.querySelector('.fixture-card-prefix')!;
      const header = root.querySelector('.fixture-card-header')!;
      const body = root.querySelector('.fixture-card-body')!;
      const meta = root.querySelector('.fixture-card-meta');
      const title = root.querySelector('h4')!;

      return [host.dataset.cardPrefixScope!, {
        classes: classes(root),
        root: style(root, ['font-size', 'line-height', 'color', 'direction', 'border-top-width']),
        header: style(header, ['padding-inline-start', 'padding-inline-end', 'min-height',
          'background-color', 'border-bottom-width', 'margin-bottom']),
        title: { classes: classes(title), style: style(title, ['font-size', 'margin-top',
          'margin-bottom', 'color']) },
        body: style(body, ['padding-top', 'padding-bottom', 'padding-inline-start', 'padding-inline-end']),
        meta: meta ? {
          classes: classes(meta),
          root: style(meta, ['display', 'margin-top', 'margin-bottom']),
          title: style(meta.querySelector('.fixture-meta-title')!, ['font-size', 'font-weight', 'color']),
          description: style(meta.querySelector('.fixture-meta-description')!, ['color'])
        } : null,
        grids: [...root.querySelectorAll('.fixture-card-grid')].map(grid => ({
          classes: classes(grid),
          style: style(grid, ['width', 'padding-top', 'padding-inline-start', 'float', 'box-sizing'])
        })),
        tabs: [...header.querySelectorAll('[role="tab"]')].map(tab => ({
          selected: tab.getAttribute('aria-selected'),
          label: style(tab.querySelector('.fixture-card-tab-label')!, ['font-size', 'color'])
        })),
        actions: root.querySelector('.fixture-card-actions')
          ? style(root.querySelector('.fixture-card-actions')!, ['background-color', 'border-top-width'])
          : null
      }];
    })
  );
}
