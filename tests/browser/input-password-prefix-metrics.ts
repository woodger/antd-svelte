export function snapshotInputPasswordPrefix() {
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-password-prefix-scope]')].map(host => {
      const root = host.querySelector('.fixture-password-root')!;
      const leaf = root.querySelector('input')!;
      const toggle = root.querySelector('[aria-pressed]');

      return [host.dataset.passwordPrefixScope!, {
        root: style(root, ['width', 'height', 'padding-top', 'padding-bottom',
          'padding-inline-start', 'padding-inline-end', 'border-top-color',
          'border-radius', 'background-color', 'color', 'font-size', 'direction']),
        input: style(leaf, ['height', 'padding-top', 'padding-inline-start',
          'background-color', 'color', 'font-size', 'line-height']),
        type: leaf.type,
        value: leaf.value,
        toggle: toggle ? {
          style: style(toggle, ['display', 'color', 'cursor', 'font-size', 'line-height']),
          pressed: toggle.getAttribute('aria-pressed'),
          disabled: toggle.getAttribute('aria-disabled'),
          tabIndex: toggle.getAttribute('tabindex')
        } : null
      }];
    })
  );
}
