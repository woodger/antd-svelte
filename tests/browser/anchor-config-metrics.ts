export function snapshotAnchorConfiguration() {
  const root = document.querySelector('#anchor-config-fixture .anchor-config-main .ant-anchor-wrapper')!;

  return Object.fromEntries(['root', 'item', 'itemTitle', 'indicator'].map(key => {
    const nodes = key === 'root' ? [root] : [...root.querySelectorAll<HTMLElement>(
      key === 'item' ? '.ant-anchor-link' : key === 'itemTitle' ? '.ant-anchor-link-title'
        : '.ant-anchor-ink')];

    return [key, nodes.map(node => {
      const css = getComputedStyle(node);

      return {
        tag: node.tagName.toLowerCase(),
        href: node.getAttribute('href'),
        classes: [...node.classList].filter(name => /^(context|local)-/.test(name)),
        styles: Object.fromEntries(['color', 'background-color', 'padding-top', 'padding-bottom',
          'padding-left', 'padding-right', 'margin-top', 'max-height', 'opacity', 'font-size']
          .map(name => [name, css.getPropertyValue(name)])),
        ...(key === 'indicator' ? { position: Object.fromEntries(
          (['top', 'height', 'left', 'width'] as const).map(name =>
            [name, (node as HTMLElement).style[name]])
        ) } : {})
      };
    })];
  }));
}
