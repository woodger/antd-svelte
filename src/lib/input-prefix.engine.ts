import template from './vendor/input-prefix.css.js';

/** Input/TextArea разделяют базовый prefix; token variables и semantic styles сохраняются. */
export function getInputPrefixCss(prefix: string) {
  if (prefix === 'ant-input') return undefined;

  const scope = `:where([data-ant-input-prefix=${JSON.stringify(prefix)}])`;
  const children = new Set([
    '-prefix', '-suffix', '-clear-icon', '-clear-icon-hidden', '-clear-icon-has-suffix',
    '-data-count', '-show-count-suffix', '-show-count-has-suffix', '-password-icon',
    '-textarea-suffix'
  ]);

  return template.replace(
    /\.ant-input([-\w]*)|"ant-input"|" ant-input"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-input-css-var${scope}`;
        return `.${prefix}${suffix}${children.has(suffix) ? '' : scope}`;
      }
      return match === '"ant-input"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
