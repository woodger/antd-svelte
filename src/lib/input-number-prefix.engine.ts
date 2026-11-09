import template from './vendor/input-number-prefix.css.js';

/** InputNumber сохраняет token namespace и native geometry adapters при смене prefix. */
export function getInputNumberPrefixCss(prefix: string) {
  if (prefix === 'ant-input-number') return undefined;

  const scope = `:where([data-ant-input-number-prefix=${JSON.stringify(prefix)}])`;
  const children = new Set([
    '-input', '-actions', '-action', '-action-up', '-action-down',
    '-action-up-disabled', '-action-down-disabled', '-prefix', '-suffix'
  ]);

  return template.replace(
    /\.ant-input-number([-\w]*)|"ant-input-number"|" ant-input-number"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-input-number-css-var${scope}`;

        return `.${prefix}${suffix}${children.has(suffix) ? '' : scope}`;
      }
      return match === '"ant-input-number"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
