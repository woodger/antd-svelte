export function snapshotFormPrefix() {
  const style = (node: Element, properties: string[], pseudo?: string) => {
    const computed = getComputedStyle(node, pseudo);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-form-prefix-scope]')].map(host => {
      const form = host.querySelector('.fixture-prefix-form');
      const origin = host.getBoundingClientRect();
      const box = (node: Element) => {
        const bounds = node.getBoundingClientRect();
        const round = (value: number) => Math.round(value * 100) / 100;

        return node.getClientRects().length ? {
          x: round(bounds.x - origin.x), y: round(bounds.y - origin.y),
          width: round(bounds.width), height: round(bounds.height)
        } : null;
      };

      return [host.dataset.formPrefixScope!, {
        root: form ? style(form, ['display', 'flex-wrap', 'font-size', 'line-height', 'direction'])
          : null,
        items: [...host.querySelectorAll('.fixture-prefix-item')].map(item => {
          const labelBox = item.querySelector('.fixture-prefix-label')!;
          const label = labelBox.querySelector('label')!;
          const control = item.querySelector('.fixture-prefix-control')!;
          const input = item.querySelector('input')!;

          return {
            box: box(item),
            item: style(item, ['margin-bottom', 'margin-inline-end', 'font-size', 'direction']),
            label: { box: box(labelBox), style: style(labelBox, ['display', 'flex', 'padding-top',
              'padding-bottom', 'margin', 'text-align', 'white-space']),
            content: style(label, ['color', 'height', 'font-size']),
            colon: style(label, ['visibility', 'margin-inline-start', 'margin-inline-end'], '::after') },
            control: { box: box(control), style: style(control, ['display', 'flex', 'max-width']) },
            input: style(input, ['height', 'font-size', 'line-height', 'color', 'background-color']),
            value: (input as HTMLInputElement).value
          };
        })
      }];
    })
  );
}
