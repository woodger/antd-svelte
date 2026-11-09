export function snapshotInputOTPPrefix() {
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-otp-prefix-scope]')].map(host => {
      const root = host.querySelector('.fixture-otp-root')!;
      const inputs = [...root.querySelectorAll('input')];

      return [host.dataset.otpPrefixScope!, {
        root: style(root, ['width', 'height', 'display', 'column-gap', 'font-size', 'direction']),
        inputs: inputs.map(input => ({
          value: input.value,
          type: input.type,
          style: style(input, ['width', 'height', 'padding-top', 'padding-bottom',
            'padding-inline-start', 'padding-inline-end', 'text-align', 'background-color',
            'border-top-color', 'border-radius', 'font-size', 'line-height', 'color', 'caret-color']),
          wrapper: style(input.parentElement!, ['position', 'width', 'height']),
          mask: input.parentElement!.querySelector('[aria-hidden="true"]')
            ? style(input.parentElement!.querySelector('[aria-hidden="true"]')!,
              ['position', 'z-index', 'top', 'right', 'color', 'pointer-events']) : null
        })),
        separators: [...root.querySelectorAll('.fixture-otp-separator')]
          .map(node => node.textContent)
      }];
    })
  );
}
