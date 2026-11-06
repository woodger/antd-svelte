export function snapshotListTheme() {
  function properties(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'color', 'direction'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  const margin = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'];

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-list-theme]')].map(host => [
      host.dataset.listTheme!,
      Object.fromEntries(
        [...host.querySelectorAll<HTMLElement>('[data-list-part]')].map(part => {
          const root = part.querySelector('.ant-list')!;
          const item = root.querySelector('.ant-list-item');
          return [part.dataset.listPart!, {
            root: properties(root, [...font, ...padding, 'background-color', 'border-radius']),
            header: properties(root.querySelector('.ant-list-header'), [...font, ...padding,
              'background-color', 'border-top-left-radius']),
            footer: properties(root.querySelector('.ant-list-footer'), [...font, ...padding,
              'background-color', 'border-bottom-left-radius']),
            container: properties(root.querySelector('.ant-list-container'), [...font]),
            item: properties(item, [...font, ...padding, 'flex-wrap', 'border-bottom-width']),
            main: properties(item?.querySelector('.ant-list-item-main') ?? null, ['min-width']),
            meta: properties(item?.querySelector('.ant-list-item-meta') ?? null, margin),
            avatar: properties(item?.querySelector('.ant-list-item-meta-avatar') ?? null, margin),
            title: properties(item?.querySelector('.ant-list-item-meta-title') ?? null,
              [...font, ...margin]),
            titleLink: properties(item?.querySelector('.ant-list-item-meta-title a') ?? null,
              [...font]),
            description: properties(item?.querySelector('.ant-list-item-meta-description') ?? null,
              [...font]),
            actions: properties(item?.querySelector('.ant-list-item-action') ?? null,
              [...font, ...margin]),
            actionItem: properties(item?.querySelector('.ant-list-item-action > li') ?? null,
              [...font, ...padding]),
            extra: properties(item?.querySelector('.ant-list-item-extra') ?? null, [...font, ...margin]),
            empty: properties(root.querySelector('.ant-list-empty-text'), [...font, ...padding]),
            pagination: properties(root.querySelector('.ant-list-pagination'), margin)
          }];
        })
      )
    ])
  );
}
