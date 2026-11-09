export function snapshotCheckboxPrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !name.startsWith('svelte-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();
  const style = (node: Element, properties: string[], pseudo?: string) => {
    const computed = getComputedStyle(node, pseudo);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };
  const checkbox = (node: Element) => {
    const input = node.querySelector<HTMLInputElement>('input')!;
    const icon = input.parentElement!;

    return {
      classes: classes(node),
      root: style(node, ['color', 'font-size', 'line-height', 'direction', 'cursor', 'column-gap']),
      icon: style(icon, ['width', 'height', 'background-color', 'border-top-color',
        'border-top-width', 'border-radius']),
      mark: style(icon, ['width', 'height', 'border-top-color', 'opacity', 'transform'], '::after'),
      label: style(node.querySelector('.fixture-checkbox-label')!.parentElement!, [
        'padding-inline-start', 'padding-inline-end'
      ]),
      value: input.value,
      checked: input.checked,
      disabled: input.disabled
    };
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-checkbox-prefix-scope]')].map(host => {
      const row = host.querySelector('.fixture-checkbox-row');

      return [host.dataset.checkboxPrefixScope!, {
        standalone: checkbox(host.querySelector('.fixture-checkbox-single')!),
        group: [...host.querySelectorAll('.fixture-checkbox-group label')].map(checkbox),
        row: row ? { classes: classes(row), style: style(row, ['display', 'flex-grow', 'flex-basis']) }
          : null
      }];
    })
  );
}
