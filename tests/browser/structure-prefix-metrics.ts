export function snapshotStructurePrefix() {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-structure-prefix-scope]')]
      .map(scope => [scope.dataset.structurePrefixScope,
        Object.fromEntries([...scope.querySelectorAll<HTMLElement>('[data-prefix-widget]')]
          .map(host => {
            const root = host.dataset.prefixWidget === 'affix'
              ? host.querySelector('[class*="-affix"]')! : host.firstElementChild!;
            const css = getComputedStyle(root);
            return [host.dataset.prefixWidget, {
              classes: [...root.classList].filter(name => !/^(css-|s-[\w-]{12}$)/.test(name)
                && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort(),
              color: css.color,
              fontSize: css.fontSize,
              lineHeight: css.lineHeight,
              direction: css.direction,
              background: css.backgroundColor,
              borderWidth: css.borderTopWidth,
              padding: css.padding,
              position: css.position,
              expanded: host.dataset.prefixWidget === 'collapse'
                ? [...root.querySelectorAll('[aria-expanded]')]
                  .map(node => node.getAttribute('aria-expanded')) : null
            }];
          }))
      ]));
}
