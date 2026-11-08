import template from './vendor/anchor-prefix.css.js';

/** Общий token marker сохраняется; wrapper/alias reset ограничен владельцем prefix. */
export function getAnchorPrefixCss(prefix: string) {
  if (prefix === 'ant-anchor') return undefined;

  const scope = `:where([data-ant-anchor-prefix=${JSON.stringify(prefix)}])`;

  return template.replace(
    /\.ant-anchor([-\w]*)|"ant-anchor"|" ant-anchor"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        return suffix === '-css-var' ? `.ant-anchor-css-var${scope}` : `.${prefix}${suffix}`;
      }
      return match === '"ant-anchor"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
