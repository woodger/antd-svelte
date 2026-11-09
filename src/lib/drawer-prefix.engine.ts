import template from './vendor/drawer-prefix.css.js';

/** Native dialog/motion selectors независимы от публичного namespace; tokens остаются canonical. */
export function getDrawerPrefixCss(prefix: string) {
  if (prefix === 'ant-drawer') return undefined;

  const scope = `:where([data-ant-drawer-prefix=${JSON.stringify(prefix)}])`;
  const roots = new Set(['', '-left', '-right', '-top', '-bottom', '-rtl']);

  return template.replace(/\.ant-drawer([-\w]*)|"ant-drawer"|" ant-drawer"/g,
    (match, suffix: string | undefined) => {
      if (suffix === '-css-var') return `.ant-drawer-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-drawer"' ? `"${prefix}"` : `" ${prefix}"`;
    }).replace(/<\/style/gi, '<\\/style');
}
