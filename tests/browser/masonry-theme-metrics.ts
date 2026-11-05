export function snapshotMasonryTheme() {
  const css = (node: Element, properties: string[]) => {
    const style = getComputedStyle(node);

    return Object.fromEntries(properties.map(name => [name, style.getPropertyValue(name)]));
  };
  const output: Record<string, unknown> = {};

  for (const host of document.querySelectorAll<HTMLElement>('[data-masonry-theme]')) {
    const root = host.querySelector('.ant-masonry')!;
    output[host.dataset.masonryTheme!] = {
      root: css(root, [
        'height', 'width', 'font-family', 'font-size', 'line-height', 'color',
        'position', 'box-sizing', 'direction', 'flex-direction', 'flex-wrap'
      ]),
      items: [...root.querySelectorAll(':scope > .ant-masonry-item')].map(item => {
        const tile = item.querySelector<HTMLElement>('[data-key]')!;

        return {
          key: tile.dataset.key,
          column: Number(tile.dataset.column),
          styles: css(item, [
            'width', 'height', 'top', 'inset-inline-start', 'padding',
            'box-sizing', 'position', 'transition-property', 'transition-duration'
          ]),
          color: css(tile.querySelector('[data-masonry-alias]')!, ['color'])
        };
      })
    };
  }

  return output;
}
