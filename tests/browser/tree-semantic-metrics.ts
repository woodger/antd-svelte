export function readTreeSemantics(prefix: string) {
  function metric(node: Element | null) {
    if (!node) return null;
    const css = getComputedStyle(node);
    return {
      classes: [...node.classList].filter(name =>
        /^(?:context-|local-|inner-|component-|root-extra|node-class|initial-|updated-)/.test(name)),
      color: css.color,
      backgroundColor: css.backgroundColor,
      fontSize: css.fontSize,
      letterSpacing: css.letterSpacing,
      paddingLeft: css.paddingLeft
    };
  }
  function treeMetric(container: Element) {
    return {
      root: metric(container.querySelector(`.${prefix}`)),
      list: metric(container.querySelector(`.${prefix}-list`)),
      nodes: [...container.querySelectorAll(`.${prefix}-treenode`)]
        .filter(node => node.querySelector(`.${prefix}-title`)).map(node => ({
          item: metric(node),
          icon: metric(node.querySelector(`.${prefix}-iconEle`)),
          title: metric(node.querySelector(`.${prefix}-title`)),
          switcher: metric(node.querySelector(`.${prefix}-switcher`))
        }))
    };
  }
  return {
    ...treeMetric(document.querySelector('[data-tree-semantic-host]')!),
    peer: treeMetric(document.querySelector('[data-tree-semantic-peer]')!)
  };
}
