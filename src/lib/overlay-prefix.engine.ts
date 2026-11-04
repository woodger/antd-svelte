/** Локальный componentCls не меняет CSS variables, marker и внешний Popover у Popconfirm. */
export function getOverlayPrefixCss(
  kind: 'tooltip' | 'popover' | 'popconfirm',
  prefix: string,
  template: string
) {
  const original = `ant-${kind}`;
  if (prefix === original) return undefined;

  return template
    .replace(new RegExp(`\\.${original}(?!-css-var\\b)`, 'g'), () => `.${prefix}`)
    .replace(/<\/style/gi, '<\\/style');
}
