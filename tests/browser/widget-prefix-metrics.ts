export function snapshotWidgetPrefix() {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-feedback-prefix-scope]')]
    .map(scope => [scope.dataset.feedbackPrefixScope,
      Object.fromEntries([...scope.querySelectorAll<HTMLElement>('[data-prefix-widget]')]
        .map(host => {
          const root = host.firstElementChild!;
          const css = getComputedStyle(root);
          const value = root.querySelector('[class*="-content-value"]');
          const icon = root.querySelector('[class*="-item-icon"]');
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
            valueFontSize: value ? getComputedStyle(value).fontSize : null,
            iconBox: icon ? [
              icon.getBoundingClientRect().width,
              icon.getBoundingClientRect().height
            ]
              : null
          }];
        }))
    ]));
}
