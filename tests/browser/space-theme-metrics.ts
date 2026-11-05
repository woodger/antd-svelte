export function snapshotSpaceTheme() {
  const styles = (node: Element, names: string[]) => {
    const css = getComputedStyle(node);

    return Object.fromEntries(names.map(name => [name, css.getPropertyValue(name)]));
  };
  const classes = (node: Element) => [...node.classList].filter(
    name => /^(context-|local-|ctx-)/.test(name)
  ).sort();
  const output: Record<string, unknown> = {};

  for (const host of document.querySelectorAll<HTMLElement>('[data-space-theme]')) {
    const root = host.querySelector('.ant-space, .ant-space-compact')!;
    const item = root.querySelector('.ant-space-item');
    const separator = root.querySelector('.ant-space-item-separator');
    const probe = root.querySelector('[data-space-alias]')!;
    output[host.dataset.spaceTheme!] = {
      root: styles(root, [
        'display', 'flex-direction', 'direction', 'align-items', 'flex-wrap',
        'column-gap', 'row-gap', 'font-size', 'line-height', 'color', 'padding', 'background-color'
      ]),
      rootClasses: classes(root),
      item: item ? {
        styles: styles(item, ['color', 'padding', 'background-color']),
        classes: classes(item)
      } : null,
      separator: separator ? {
        styles: styles(separator, ['color', 'padding']),
        classes: classes(separator)
      } : null,
      alias: root.classList.contains('ant-space-compact')
        ? null : styles(probe, ['font-size', 'padding', 'color'])
    };
  }

  return output;
}
