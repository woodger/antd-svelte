import template from './vendor/badge-prefix.css.js';

/** Badge selectors локальны; ScrollNumber следует общему prefix, icon selectors сохраняются. */
export function getBadgePrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-badge' && rootPrefix === 'ant') return undefined;

  return template
    .replace(/\.ant-badge(?!-css-var\b)|\.ant-scroll-number|"ant-badge"|" ant-badge"/g, match => {
      if (match === '.ant-badge') return `.${prefix}`;
      if (match === '.ant-scroll-number') return `.${rootPrefix}-scroll-number`;
      return match === '"ant-badge"' ? `"${prefix}"` : `" ${prefix}"`;
    })
    .replace(/<\/style/gi, '<\\/style');
}
