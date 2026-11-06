/** Сверяет оформление Message, сохраняя native popover и управление viewport в DOM-controller. */
export function snapshotMessageTheme() {
  const root = document.querySelector('.ant-message');
  if (!root) throw new Error('Message root is missing');
  const css = (node: Element | null, keys: readonly string[]) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const box = [
    'width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-top-color', 'border-radius', 'background-color', 'box-shadow'
  ];

  return {
    root: css(root, [...typography, 'z-index', 'direction']),
    notice: css(root.querySelector('.ant-message-notice'), [...typography, ...box]),
    wrapper: css(root.querySelector('.ant-message-notice-wrapper'), [
      ...typography, 'width', 'height', 'gap', 'align-items'
    ]),
    title: css(root.querySelector('.ant-message-notice-title'), [
      ...typography, 'width', 'height', 'overflow-wrap'
    ]),
    icon: css(root.querySelector('.ant-message-notice-icon'), [
      ...typography, 'width', 'height'
    ]),
    svg: css(root.querySelector('.ant-message-notice-icon svg'), ['width', 'height', 'color'])
  };
}

/** Все объявления component registration rule из официального UMD. */
export function snapshotMessageThemeVariables(prefix: string) {
  const root = document.querySelector('.ant-message');
  if (!root) throw new Error('Message source scope is missing');
  const declarations: Record<string, string> = {};

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)
        || !root.matches(rule.selectorText)
        || ![...rule.style].some(name => name.startsWith(`--${prefix}-message-`))) continue;

      for (const name of rule.style) {
        if (name.startsWith(`--${prefix}-`)) {
          declarations[name] = rule.style.getPropertyValue(name).trim();
        }
      }
    }
  }

  return declarations;
}
