export function snapshotLayoutConfig() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-layout-config]')]
    .map(host => [host.dataset.layoutConfig, Object.fromEntries(
      [...host.querySelectorAll<HTMLElement>('[data-layout-part]')].map(node => {
        const css = getComputedStyle(node);

        return [node.dataset.layoutPart, {
          classes: [...node.classList].filter(name => /^(ctx-|local-|inner-)/.test(name)).sort(),
          direction: css.direction, color: css.color,
          paddingTop: css.paddingTop, paddingRight: css.paddingRight,
          borderTopWidth: css.borderTopWidth, borderTopColor: css.borderTopColor,
          background: css.backgroundColor, flexDirection: css.flexDirection
        }];
      })
    )]));
}
