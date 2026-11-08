export function snapshotDescriptionsPrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();
  const style = (node: Element, properties: string[], pseudo?: string) => {
    const computed = getComputedStyle(node, pseudo);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-descriptions-prefix-scope]')].map(host => {
      const root = host.querySelector('[data-prefix-desc-root]')!;
      const table = root.querySelector('table')!;
      const label = root.querySelector('.fixture-label')!;
      const content = root.querySelector('.fixture-content')!;

      return [host.dataset.descriptionsPrefixScope!, {
        classes: classes(root),
        root: style(root, ['font-size', 'line-height', 'color', 'direction']),
        header: style(root.querySelector('.fixture-header')!, ['margin-bottom', 'display']),
        title: style(root.querySelector('.fixture-title')!, ['font-size', 'font-weight', 'color']),
        extra: style(root.querySelector('.fixture-extra')!, ['font-size', 'color']),
        view: style(table.parentElement!, ['display', 'border-top-width', 'border-radius']),
        table: style(table, ['width', 'flex', 'table-layout']),
        label: { classes: classes(label), style: style(label, ['color', 'background-color']) },
        content: { classes: classes(content), style: style(content, ['color', 'display']) },
        colon: style(label, ['content', 'display', 'margin-inline-start', 'margin-inline-end'], '::after'),
        rows: [...table.tBodies[0].rows].map(row => ({
          classes: classes(row),
          cells: [...row.cells].map(cell => ({
            tag: cell.tagName,
            classes: classes(cell),
            span: cell.colSpan,
            style: style(cell, ['padding-top', 'padding-bottom', 'padding-inline-start',
              'padding-inline-end', 'border-inline-end-width', 'vertical-align'])
          }))
        }))
      }];
    })
  );
}
