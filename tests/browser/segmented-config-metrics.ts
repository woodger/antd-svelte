export function snapshotSegmentedConfig() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-segmented-config]')]
    .map(host => {
      const root = host.querySelector<HTMLElement>('.ant-segmented')!;
      const item = root.querySelector('label')!;
      const label = item.querySelector('.ant-segmented-item-label')!;
      const icon = item.querySelector('.ant-segmented-item-icon')!;
      const classes = (node: Element) => [...node.classList]
        .filter(name => name.startsWith('segcfg-') || name.startsWith('meta-'));
      const style = (node: Element) => getComputedStyle(node);

      return [host.dataset.segmentedConfig, {
        classes: { root: classes(root), item: classes(item), label: classes(label), icon: classes(icon) },
        root: {
          padding: style(root).padding,
          background: style(root).backgroundColor,
          direction: style(root).direction
        },
        itemColor: style(item).color,
        label: {
          padding: style(label).padding,
          minHeight: style(label).minHeight,
          width: label.getBoundingClientRect().width
        },
        icon: {
          fontSize: style(icon).fontSize,
          display: style(icon.querySelector('svg')!).display,
          marginEnd: style(icon.querySelector('svg')!).marginBlockEnd
        }
      }];
    }));
}
