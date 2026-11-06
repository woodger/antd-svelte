import template from './vendor/affix-prefix.css.js';

/** Variables и marker сохраняют имена; default rules ограничены своим fixed-узлом. */
export function getAffixPrefixCss(prefix: string) {
  if (prefix === 'ant-affix') return undefined;

  return template
    .replace(/\.ant-affix-css-var/g, '.ant-affix-css-var:where([data-ant-affix-prefix])')
    .replace(/\.ant-affix(?![-\w])/g, () => `.${prefix}:where([data-ant-affix-prefix])`)
    .replace(/"ant-affix"/g, () => `"${prefix}"`)
    .replace(/" ant-affix"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
