import template from './vendor/badge-prefix.css.js';

/** Badge componentCls меняется локально; глобальные ScrollNumber/icon selectors сохраняются. */
export function getBadgePrefixCss(prefix: string) {
  if (prefix === 'ant-badge') return undefined;

  return template
    .replace(/\.ant-badge(?!-css-var\b)/g, () => `.${prefix}`)
    .replace(/"ant-badge"/g, () => `"${prefix}"`)
    .replace(/" ant-badge"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
