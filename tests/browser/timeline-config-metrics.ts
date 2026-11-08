export function snapshotTimelineConfig() {
  const selectors = {
    root: null, item: '.ant-timeline-item', itemWrapper: '.ant-timeline-item-wrapper',
    itemIcon: '.ant-timeline-item-icon', itemSection: '.ant-timeline-item-section',
    itemHeader: '.ant-timeline-item-header', itemTitle: '.ant-timeline-item-title',
    itemContent: '.ant-timeline-item-content', itemRail: '.ant-timeline-item-rail'
  };

  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-timeline-config]')]
    .map(host => {
      const root = host.querySelector('ol')!;
      const item = root.querySelector('.ant-timeline-item')!;

      return [host.dataset.timelineConfig, {
        direction: getComputedStyle(root).direction,
        slots: Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
          const node = key === 'root' ? root : key === 'item' ? item : item.querySelector(selector!);
          if (!node) return [key, null];
          const css = getComputedStyle(node);

          return [key, {
            classes: [...node.classList].filter(name => /^(ctx-|local-|inner-|item-local-)/.test(name))
              .sort(),
            color: css.color, fontWeight: css.fontWeight,
            paddingTop: css.paddingTop, borderTopWidth: css.borderTopWidth
          }];
        }))
      }];
    }));
}
