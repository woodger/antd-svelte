export function snapshotTourTheme() {
  const root = document.querySelector('.ant-tour')!;
  function css(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'font-family', 'line-height', 'color'];
  const box = ['width', 'height', 'padding-top', 'padding-right', 'padding-bottom',
    'padding-left', 'background-color', 'border-radius', 'border-top-color',
    'border-top-width', 'box-shadow'];
  const arrow = root.querySelector('.ant-tour-arrow');
  return {
    root: css(root, [...font, 'width', 'z-index']),
    section: css(root.querySelector('.ant-tour-section'), [...font, ...box]),
    header: css(root.querySelector('.ant-tour-header'), [...font, 'margin-bottom']),
    title: css(root.querySelector('.ant-tour-title'), [...font, 'font-weight']),
    description: css(root.querySelector('.ant-tour-description'), font),
    close: css(root.querySelector('.ant-tour-close'), [...font, 'width', 'height', 'top', 'right']),
    footer: css(root.querySelector('.ant-tour-footer'), ['margin-top', 'text-align', 'height']),
    indicators: [...root.querySelectorAll('.ant-tour-indicator')].map(node => css(node,
      ['width', 'height', 'margin-right', 'background-color', 'border-radius'])),
    previous: css(root.querySelector('.ant-tour-prev-btn'), [...font, ...box]),
    next: css(root.querySelector('.ant-tour-next-btn'), [...font, ...box]),
    arrow: css(arrow, ['width', 'height', 'background-color']),
    arrowBefore: arrow ? css(arrow, ['--ant-tooltip-arrow-background-color']) : null,
    arrowClip: arrow ? getComputedStyle(arrow, '::before').clipPath : null
  };
}
export function snapshotTourThemeVariables(prefix: string) {
  const root = document.querySelector('.ant-tour')!;
  const declarations: Record<string, string> = {};
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (rule instanceof CSSStyleRule && root.matches(rule.selectorText)
        && [...rule.style].some(name => name.startsWith(`--${prefix}-tour-`))) {
        for (const name of rule.style) {
          if (name.startsWith(`--${prefix}-`)) {
            declarations[name] = rule.style.getPropertyValue(name).trim();
          }
        }
      }
    }
  }
  return declarations;
}
