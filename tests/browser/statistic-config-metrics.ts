export function snapshotStatisticConfig() {
  const selectors = {
    root: null, header: '.ant-statistic-header', title: '.ant-statistic-title',
    content: '.ant-statistic-content', value: '.ant-statistic-content-value',
    prefix: '.ant-statistic-content-prefix', suffix: '.ant-statistic-content-suffix'
  };

  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-statistic-config]')]
    .map(root => [root.dataset.statisticConfig, {
      direction: getComputedStyle(root).direction,
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
    }]));
}
