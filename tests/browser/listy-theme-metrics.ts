export function snapshotListyTheme() {
  function properties(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'font-weight', 'color', 'direction'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-listy-theme]')].map(host => [
      host.dataset.listyTheme!,
      Object.fromEntries(
        [...host.querySelectorAll<HTMLElement>('[data-listy-part]')].map(part => {
          const root = part.querySelector('.ant-listy')!;
          const item = root.querySelector('.ant-listy-item');
          const header = root.querySelector('.ant-listy-group-header:not(.ant-listy-group-header-fixed)');
          return [part.dataset.listyPart!, {
            root: properties(root, [...font, 'position', 'max-height', 'overflow-y']),
            item: properties(item, [...font, ...padding, 'height', 'border-bottom-width',
              'border-bottom-style', 'border-bottom-color']),
            header: properties(header, [...font, ...padding, 'position', 'background-color',
              'background-image']),
            holder: properties(root.querySelector('.ant-listy-holder'), ['max-height', 'overflow-y'])
          }];
        })
      )
    ])
  );
}

export function snapshotListyVirtualSizes() {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-listy-theme]')].map(host => [
      host.dataset.listyTheme!,
      Object.fromEntries(
        [...host.querySelectorAll<HTMLElement>('[data-listy-part^="virtual"]')].map(part => {
          const holder = part.querySelector('.ant-listy-holder')!;
          const filler = holder.firstElementChild!;
          return [part.dataset.listyPart!, {
            fillerHeight: getComputedStyle(filler).height,
            keys: [...part.querySelectorAll<HTMLElement>('[data-record]')]
              .map(node => node.dataset.record!)
          }];
        })
      )
    ])
  );
}
