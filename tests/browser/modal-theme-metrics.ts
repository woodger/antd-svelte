/** Сверяет оформление Modal, сохраняя нативное центрирование и резерв места под close. */
export function snapshotModalTheme() {
  const root = document.querySelector('.ant-modal');
  if (!root) throw new Error('Modal root is missing');
  const css = (node: Element | null, keys: readonly string[]) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const box = [
    'width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-top-style', 'border-top-color',
    'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
    'border-radius', 'background-color', 'box-shadow'
  ];
  const mask = document.querySelector('.ant-modal-mask');
  const dialog = document.querySelector('dialog.ant-svelte-dialog');
  const maskStyle = mask ? getComputedStyle(mask) : dialog ? getComputedStyle(dialog, '::backdrop')
    : undefined;

  return {
    root: css(root, [...typography, 'width', 'direction']),
    mask: maskStyle ? { background: maskStyle.backgroundColor } : null,
    container: css(root.querySelector('.ant-modal-container'), [...typography, ...box]),
    header: css(root.querySelector('.ant-modal-header'), [...typography, ...box, 'margin-bottom']),
    title: css(root.querySelector('.ant-modal-title'), [...typography, 'margin-top', 'margin-bottom']),
    close: css(root.querySelector('.ant-modal-close'), [
      ...typography, ...box, 'top', 'inset-inline-end', 'z-index'
    ]),
    closeIcon: css(root.querySelector('.ant-modal-close svg'), ['width', 'height', 'color']),
    body: css(root.querySelector('.ant-modal-body'), [...typography, ...box]),
    input: css(root.querySelector('input[aria-label="Modal draft"]'), [...typography, ...box]),
    footer: css(root.querySelector('.ant-modal-footer'), [...typography, ...box, 'margin-top']),
    buttons: [...root.querySelectorAll('.ant-modal-footer .ant-btn')].map(node =>
      css(node, [...typography, ...box, 'margin-inline-start']))
  };
}

/** Все объявления component registration rule из официального UMD. */
export function snapshotModalThemeVariables(prefix: string) {
  const root = document.querySelector('.ant-modal-root');
  if (!root) throw new Error('Modal source scope is missing');
  const declarations: Record<string, string> = {};

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)
        || !root.matches(rule.selectorText)
        || ![...rule.style].some(name => name.startsWith(`--${prefix}-modal-`))) continue;

      for (const name of rule.style) {
        if (name.startsWith(`--${prefix}-`)) {
          declarations[name] = rule.style.getPropertyValue(name).trim();
        }
      }
    }
  }

  if (Object.keys(declarations).length === 0) throw new Error('Modal declarations are missing');
  return declarations;
}
