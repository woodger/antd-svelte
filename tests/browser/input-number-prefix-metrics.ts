export function snapshotInputNumberPrefix() {
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-number-prefix-scope]')].map(host => {
      const root = host.querySelector('.fixture-number-root')!;
      const input = root.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
      const actions = root.querySelector('.fixture-number-actions');

      return [host.dataset.numberPrefixScope!, {
        root: style(root, ['width', 'height', 'display', 'padding-top', 'padding-bottom',
          'padding-inline-start', 'padding-inline-end', 'border-top-color',
          'border-radius', 'background-color', 'color', 'font-size', 'direction']),
        input: style(input, ['height', 'padding-top', 'padding-bottom', 'padding-inline-start',
          'padding-inline-end', 'text-align', 'font-size', 'line-height', 'color']),
        actions: actions ? style(actions, ['width', 'height', 'opacity', 'position',
          'background-color', 'border-inline-start-width']) : null,
        prefix: root.querySelector('.fixture-number-prefix')?.textContent ?? null,
        suffix: root.querySelector('.fixture-number-suffix')?.textContent ?? null,
        value: input.value
      }];
    })
  );
}
