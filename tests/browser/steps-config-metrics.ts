export function snapshotStepsConfig() {
  const selectors = {
    root: null, item: '.ant-steps-item', itemWrapper: '.ant-steps-item-wrapper',
    itemIcon: '.ant-steps-item-icon', itemSection: '.ant-steps-item-section',
    itemHeader: '.ant-steps-item-header', itemTitle: '.ant-steps-item-title',
    itemSubtitle: '.ant-steps-item-subtitle', itemContent: '.ant-steps-item-content', itemRail: '.ant-steps-item-rail'
  };

  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-steps-config]')]
    .map(host => {
      const root = host.firstElementChild!;
      const item = root.querySelector('.ant-steps-item')!;

      return [host.dataset.stepsConfig, {
        direction: getComputedStyle(root).direction,
        slots: Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
          const node = key === 'root' ? root : key === 'item' ? item : item.querySelector(selector!);
          if (!node) return [key, null];
          const css = getComputedStyle(node);

          return [key, {
            classes: [...node.classList].filter(name => /^(ctx-|local-|inner-|item-local-|timeline-)/.test(name))
              .sort(),
            color: css.color, fontWeight: css.fontWeight,
            paddingTop: css.paddingTop, borderTopWidth: css.borderTopWidth
          }];
        }))
      }];
    }));
}
