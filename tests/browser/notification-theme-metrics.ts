/** Сверяет тему Notification с сохранением native close target и top-layer поверхности. */
export function snapshotNotificationTheme() {
  const root = document.querySelector('.ant-notification');
  if (!root) throw new Error('Notification root is missing');
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
    notice: css(root.querySelector('.ant-notification-notice'), [...typography, ...box]),
    wrapper: css(root.querySelector('.ant-notification-notice-wrapper'), [
      ...typography, 'width', 'height', 'gap', 'align-items'
    ]),
    section: css(root.querySelector('.ant-notification-notice-section'), [
      ...typography, 'width', 'height', 'gap'
    ]),
    title: css(root.querySelector('.ant-notification-notice-title'), [
      ...typography, 'width', 'height', 'padding-inline-end'
    ]),
    description: css(root.querySelector('.ant-notification-notice-description'), [
      ...typography, 'width', 'height', 'padding-inline-end'
    ]),
    icon: css(root.querySelector('.ant-notification-notice-icon'), [
      ...typography, 'width', 'height'
    ]),
    svg: css(root.querySelector('.ant-notification-notice-icon svg'), ['width', 'height', 'color']),
    close: css(root.querySelector('.ant-notification-notice-close'), [
      ...typography, ...box, 'top', 'inset-inline-end'
    ]),
    closeIcon: css(root.querySelector('.ant-notification-notice-close svg'), ['width', 'height', 'color']),
    actions: css(root.querySelector('.ant-notification-notice-actions'), ['width', 'height', 'margin-top']),
    action: css(root.querySelector('.ant-notification-notice-actions .ant-btn'), [...typography, ...box])
  };
}

/** Все объявления component registration rule из официального UMD. */
export function snapshotNotificationThemeVariables(prefix: string) {
  const root = document.querySelector('.ant-notification');
  if (!root) throw new Error('Notification source scope is missing');
  const declarations: Record<string, string> = {};

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)
        || !root.matches(rule.selectorText)
        || ![...rule.style].some(name => name.startsWith(`--${prefix}-notification-`))) continue;

      for (const name of rule.style) {
        if (name.startsWith(`--${prefix}-`)) {
          declarations[name] = rule.style.getPropertyValue(name).trim();
        }
      }
    }
  }

  return declarations;
}
