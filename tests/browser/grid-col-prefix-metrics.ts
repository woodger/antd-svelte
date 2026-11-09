export function snapshotGridColPrefix() {
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };
  const metrics = (node: Element, parent: Element) => {
    const bounds = node.getBoundingClientRect();
    const origin = parent.getBoundingClientRect();
    const round = (value: number) => Math.round(value * 100) / 100;

    return {
      box: node.getClientRects().length ? {
        x: round(bounds.x - origin.x), y: round(bounds.y - origin.y),
        width: round(bounds.width), height: round(bounds.height)
      } : null,
      style: style(node, ['display', 'flex', 'max-width', 'order', 'margin-inline-start',
        'padding-inline-start', 'padding-inline-end', 'inset-inline-start', 'inset-inline-end',
        'font-size', 'direction'])
    };
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-col-prefix-scope]')].map(host => {
      const row = host.querySelector('.fixture-col-row')!;

      return [host.dataset.colPrefixScope!, {
        columns: [...row.querySelectorAll(':scope > [data-fixture-col]')]
          .map(node => metrics(node, row)),
        form: [...host.querySelectorAll('.fixture-col-form-item')].map(item => {
          const label = item.querySelector('.fixture-col-label')!;
          const control = item.querySelector('.fixture-col-control')!;

          return {
            label: metrics(label, item), control: metrics(control, item),
            labelStyle: style(label, ['padding-top', 'padding-bottom', 'text-align', 'white-space'])
          };
        })
      }];
    })
  );
}
