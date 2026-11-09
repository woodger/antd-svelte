import template from './vendor/color-picker-prefix.css.js';

/** ColorPicker owner и общие namespaces вложенных controls не меняют canonical variables. */
export function getColorPickerPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-color-picker' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-color-picker-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-color-picker-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set(['', '-trigger', '-trigger-disabled', '-rtl', '-compact-item']);

  return template.replace(
    /\.ant-color-picker([-\w]*)|\.ant-(collapse|divider|input|select)([-\w]*)|"ant-color-picker"|" ant-color-picker"/g,
    (match, suffix: string | undefined, child: string | undefined, part: string | undefined) => {
      if (child !== undefined) return `.${rootPrefix}-${child}${part}`;
      if (suffix === '-css-var') return `.ant-color-picker-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-color-picker"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
