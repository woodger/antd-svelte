/** Сопоставляет вычисленные стили Upload, сохраняя различия React/Svelte обёрток. */
export function snapshotUploadTheme() {
  const root = document.querySelector('.ant-upload-wrapper');
  if (!root) throw new Error('Upload root is missing');

  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const box = [
    'width', 'height', 'min-width', 'padding-top', 'padding-right', 'padding-bottom',
    'padding-left', 'border-top-width', 'border-top-color', 'border-top-style',
    'border-radius', 'background-color', 'box-shadow'
  ];
  const css = (node: Element | null, keys: readonly string[]) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const area = root.querySelector('.ant-upload-select, .ant-upload-drag');

  return {
    root: css(root, typography),
    area: css(area, [...typography, ...box, 'cursor']),
    trigger: css(area?.querySelector('.ant-btn') ?? null, [...typography, ...box]),
    dragText: css(root.querySelector('.ant-upload-text'), typography),
    dragHint: css(root.querySelector('.ant-upload-hint'), typography),
    items: [...root.querySelectorAll('.ant-upload-list-item-container')].map(container => {
      const row = container.querySelector('.ant-upload-list-item');
      const filename = row?.querySelector('.ant-upload-list-item-name') ?? null;
      const progress = row?.querySelector('.ant-upload-list-item-progress') ?? null;

      return {
        container: css(container, ['width', 'height', 'margin-bottom']),
        row: css(row ?? null, [...typography, ...box, 'margin-top']),
        backdrop: row ? {
          background: getComputedStyle(row, '::before').backgroundColor,
          opacity: getComputedStyle(row, '::before').opacity
        } : null,
        filename: css(filename, [
          ...typography, 'text-decoration-line', 'text-decoration-color',
          'padding-left', 'padding-right', 'display'
        ]),
        thumbnail: css(row?.querySelector('.ant-upload-list-item-thumbnail') ?? null, [
          ...typography, ...box, 'text-decoration-line'
        ]),
        icon: css(row?.querySelector('.ant-upload-icon .anticon') ?? null, typography),
        actions: [...(row?.querySelectorAll('.ant-upload-list-item-action') ?? [])].map(node => ({
          button: css(node, [...typography, ...box, 'opacity']),
          icon: css(node.querySelector('.anticon'), typography)
        })),
        actionsContainer: css(row?.querySelector('.ant-upload-list-item-actions') ?? null, [
          'opacity', 'color', 'font-size'
        ]),
        preview: css(row?.querySelector('.ant-upload-list-item-actions > a') ?? null, [
          ...typography, 'text-decoration-line', 'opacity'
        ]),
        progress: css(progress, ['bottom', 'padding-left', 'line-height']),
        progressInner: css(progress?.querySelector('.ant-progress-inner') ?? null, [
          'height', 'border-radius', 'background-color'
        ]),
        progressBar: css(progress?.querySelector('.ant-progress-bg') ?? null, [
          'height', 'border-radius', 'background-color'
        ])
      };
    })
  };
}

/** Читает defaults и aliases из исходного CSS registration rule Upload. */
export function snapshotUploadThemeVariables(prefix: string) {
  const root = document.querySelector('.ant-upload-wrapper');
  if (!root) throw new Error('Upload root is missing');
  const declarations: Record<string, string> = {};

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)
        || !root.matches(rule.selectorText)
        || ![...rule.style].some(name => name.startsWith(`--${prefix}-upload-`))) continue;

      for (const name of rule.style) {
        if (name.startsWith(`--${prefix}-`)) {
          declarations[name] = rule.style.getPropertyValue(name).trim();
        }
      }
    }
  }

  return declarations;
}
