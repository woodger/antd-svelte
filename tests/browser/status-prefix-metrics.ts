export function snapshotStatusPrefix() {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-status-prefix-scope]')]
    .map(scope => [scope.dataset.statusPrefixScope,
      Object.fromEntries([...scope.querySelectorAll<HTMLElement>('[data-prefix-widget]')]
        .map(host => {
          // Основной Skeleton сохраняет native host/status вокруг декоративного каркаса.
          const root = host.querySelector('[data-ant-skeleton-main]') ?? host.firstElementChild!;
          const css = getComputedStyle(root);
          const indicator = host.dataset.prefixWidget === 'badge'
            ? root.querySelector('sup') : null;
          const ribbon = host.dataset.prefixWidget === 'ribbon'
            ? root.querySelector('[class*="-ribbon"]') : null;
          const digit = indicator?.querySelector('[class*="-scroll-number-only"]');
          const partStyle = (node: Element) => {
            const css = getComputedStyle(node);
            return Object.fromEntries([
              'position',
              'height',
              'min-width',
              'font-size',
              'line-height',
              'display',
              'overflow',
              'transform'
            ].map(key => [key, css.getPropertyValue(key)]));
          };
          return [host.dataset.prefixWidget, {
            classes: [...root.classList].filter(name => !/^(css-|s-[\w-]{12}$)/.test(name)
              && !name.endsWith('-css-var') && !name.endsWith('-source-theme')
              && name !== 'ant-badge-source-tokens' && name !== 'ant-badge-source-count').sort(),
            color: css.color,
            fontSize: css.fontSize,
            lineHeight: css.lineHeight,
            direction: css.direction,
            background: css.backgroundColor,
            borderWidth: css.borderTopWidth,
            padding: css.padding,
            numbers: indicator ? {
              classes: [...indicator.classList].filter(name => !/^(css-|s-[\w-]{12}$)/.test(name)
                && name !== 'ant-badge-indicator').sort(),
              style: partStyle(indicator),
              digitClasses: [...digit!.classList]
                .filter(name => !/^s-[\w-]{12}$/.test(name)).sort(),
              digitStyle: partStyle(digit!)
            } : null,
            ribbon: ribbon ? {
              wrapper: partStyle(root),
              classes: [...ribbon.classList].filter(name => !/^(css-|s-[\w-]{12}$)/.test(name)
                && !name.endsWith('-css-var')).sort(),
              style: partStyle(ribbon),
              content: partStyle(ribbon.querySelector('[class*="-content"]')!),
              corner: partStyle(ribbon.querySelector('[class*="-corner"]')!)
            } : null
          }];
        }))
    ]));
}
