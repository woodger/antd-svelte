/** Сверяет панель Drawer при одинаковом фокусе в поле, сохраняя native dialog семантику. */
export function snapshotDrawerTheme() {
  const root = document.querySelector('.ant-drawer');
  if (!root) throw new Error('Drawer root is missing');
  const css = (node: Element | null, keys: readonly string[]) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const box = [
    'width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-top-color', 'border-bottom-width', 'border-bottom-color',
    'border-radius', 'background-color', 'box-shadow'
  ];
  const input = root.querySelector('input[aria-label="Drawer draft"]');

  return {
    root: css(root, [...typography, 'z-index', 'direction']),
    mask: css(root.querySelector('.ant-drawer-mask'), [
      'z-index', 'background-color', 'backdrop-filter'
    ]),
    wrapper: css(root.querySelector('.ant-drawer-content-wrapper'), ['width', 'height', 'box-shadow']),
    section: css(root.querySelector('.ant-drawer-section'), [...typography, 'background-color']),
    header: css(root.querySelector('.ant-drawer-header'), [...typography, ...box]),
    title: css(root.querySelector('.ant-drawer-title'), [...typography, 'margin-top', 'margin-bottom']),
    close: css(root.querySelector('.ant-drawer-close'), [
      ...typography, ...box, 'margin-left', 'margin-right'
    ]),
    extra: css(root.querySelector('.ant-drawer-extra .ant-btn'), [...typography, ...box]),
    body: css(root.querySelector('.ant-drawer-body'), [...typography, ...box, 'overflow-y']),
    input: css(input, [...typography, ...box]),
    footer: css(root.querySelector('.ant-drawer-footer'), [...typography, ...box]),
    footerButton: css(root.querySelector('.ant-drawer-footer .ant-btn'), [...typography, ...box])
  };
}

/** Все объявления из component registration rule, включая component aliases. */
export function snapshotDrawerThemeVariables(prefix: string) {
  const root = document.querySelector('.ant-drawer');
  if (!root) throw new Error('Drawer root is missing');
  const declarations: Record<string, string> = {};

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)
        || !root.matches(rule.selectorText)
        || ![...rule.style].some(name => name.startsWith(`--${prefix}-drawer-`))) continue;

      for (const name of rule.style) {
        if (name.startsWith(`--${prefix}-`)) {
          declarations[name] = rule.style.getPropertyValue(name).trim();
        }
      }
    }
  }

  return declarations;
}
