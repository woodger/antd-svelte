export function snapshotRadioPrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !name.startsWith('svelte-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };
  const radio = (node: Element) => {
    const input = node.querySelector<HTMLInputElement>('input')!;

    return {
      classes: classes(node),
      root: style(node, ['color', 'background-color', 'height', 'padding-inline-start',
        'padding-inline-end', 'border-top-color', 'border-inline-start-width',
        'border-radius', 'font-size', 'line-height', 'direction', 'cursor']),
      icon: style(input.parentElement!, ['width', 'height', 'background-color', 'border-top-color',
        'border-top-width', 'border-radius', 'position']),
      label: style(node.querySelector('.fixture-radio-label')!.parentElement!, ['padding-inline-start',
        'padding-inline-end']),
      value: input.value,
      checked: input.checked,
      disabled: input.disabled
    };
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-radio-prefix-scope]')].map(host => [
      host.dataset.radioPrefixScope!, {
        standalone: radio(host.querySelector('.fixture-radio-single')!),
        button: radio(host.querySelector('.fixture-radio-button')!),
        group: [...host.querySelectorAll('.fixture-radio-group label')].map(radio),
        badges: [...host.querySelectorAll('.fixture-radio-group sup')]
          .map(node => style(node, ['z-index']))
      }
    ])
  );
}
