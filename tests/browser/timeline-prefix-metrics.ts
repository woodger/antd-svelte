export function snapshotTimelinePrefix() {


  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-timeline-prefix]')]
    .map(host => {
      const root = host.querySelector('ol')!;
      const prefix = host.dataset.prefix!;
      const item = root.querySelector(`.${prefix}-item`)!;
      const selectors: Record<string, string | null> = { root: null };
      for (const key of ['item', 'itemWrapper', 'itemIcon', 'itemSection', 'itemHeader', 'itemTitle', 'itemContent', 'itemRail']) {
        selectors[key] = `.${prefix}${key === 'item' ? '-item' : `-item-${key.slice(4).toLowerCase()}`}`;
      }

      return [host.dataset.timelinePrefix, {
        direction: getComputedStyle(root).direction,
        hasPrefix: root.classList.contains(prefix),
        hasDefaultPrefix: root.classList.contains('ant-timeline'),
        slots: Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
          const node = key === 'root' ? root : key === 'item' ? item : item.querySelector(selector!);
          if (!node) return [key, null];
          const css = getComputedStyle(node);

          return [key, {
            classes: [...node.classList].filter(name => /^(ctx-|local-|inner-|item-local-)/.test(name))
              .sort(),
            color: css.color, fontWeight: css.fontWeight,
            paddingTop: css.paddingTop, borderTopWidth: css.borderTopWidth,
            fontSize: css.fontSize, lineHeight: css.lineHeight, background: css.backgroundColor,
            borderColor: css.borderColor, iconBox: key === 'itemIcon'
              ? [node.getBoundingClientRect().width, node.getBoundingClientRect().height] : null
          }];
        }))
      }];
    }));
}
