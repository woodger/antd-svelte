export function snapshotListyPrefix() {
  function properties(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'font-weight', 'color', 'direction'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-listy-prefix-scope]')].map(host => [
      host.dataset.listyPrefixScope!,
      Object.fromEntries(
        [...host.querySelectorAll<HTMLElement>('[data-listy-prefix-part]')].map(part => {
          const root = part.querySelector<HTMLElement>('.fixture-listy-prefix')!;
          const prefix = root.classList[0];
          const item = root.querySelector('.fixture-listy-row');
          const headers = [...root.querySelectorAll<HTMLElement>('.fixture-listy-header')];
          const header = headers.find(node => !node.classList.contains(`${prefix}-group-header-fixed`));

          return [part.dataset.listyPrefixPart!, {
            prefix,
            root: properties(root, [...font, 'position', 'max-height', 'overflow-y']),
            item: properties(item, [...font, ...padding, 'height', 'border-bottom-width',
              'border-bottom-style', 'border-bottom-color']),
            header: properties(header ?? null, [...font, ...padding, 'position', 'background-color',
              'background-image']),
            holder: properties(root.querySelector(`[class~="${prefix}-holder"]`),
              ['max-height', 'overflow-y']),
            scrollbar: properties(root.querySelector(`[class~="${prefix}-scrollbar"]`),
              ['z-index', 'cursor']),
            records: [...root.querySelectorAll<HTMLElement>('[data-record]')]
              .map(node => node.dataset.record!),
            character: item?.querySelector('a') ? properties(item.querySelector('a'),
              ['color', 'text-decoration-line', 'outline-style']) : null
          }];
        })
      )
    ])
  );
}
