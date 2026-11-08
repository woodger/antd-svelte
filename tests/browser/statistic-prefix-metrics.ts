export function snapshotStatisticPrefix() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-statistic-config]')]
    .map(root => {
      const prefix = root.dataset.prefix!;
      const selectors: Record<string, string | null> = { root: null };
      for (const key of ['header', 'title', 'content', 'value', 'prefix', 'suffix']) {
        selectors[key] = `.${prefix}${['value', 'prefix', 'suffix'].includes(key)
          ? `-content-${key}` : `-${key}`}`;
      }

      return [root.dataset.statisticConfig, {
        direction: getComputedStyle(root).direction,
        hasPrefix: root.classList.contains(prefix),
        hasDefaultPrefix: root.classList.contains('ant-statistic'),
        integer: Boolean(root.querySelector(`.${prefix}-content-value-int`)),
        decimal: Boolean(root.querySelector(`.${prefix}-content-value-decimal`)),
        slots: Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
          const node = selector ? root.querySelector<HTMLElement>(selector) : root;
          if (!node) return [key, null];
          const style = getComputedStyle(node);

          return [key, {
            classes: [...node.classList].filter(name => /^(ctx-|local-|inner-)/.test(name)).sort(),
            color: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight,
            paddingTop: style.paddingTop, borderTopWidth: style.borderTopWidth
          }];
        }))
      }];
    }));
}
