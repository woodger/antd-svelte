import base from './vendor/menu-prefix.css.js';
import theme from './vendor/menu-theme-prefix.css.js';

/** Menu/popup сохраняют canonical variables и scoped темы, Typography использует общий prefix. */
export function getMenuPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-menu' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-menu-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-menu-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set(['', '-light', '-dark', '-inline', '-vertical', '-horizontal',
    '-inline-collapsed', '-root', '-rtl', '-submenu', '-submenu-popup']);

  return `${base}\n${theme}`.replace(
    /\.ant-menu([-\w]*)|\.ant-(layout-header|typography[-\w]*)|"ant-menu"|" ant-menu"/g,
    (match, suffix: string | undefined, shared: string | undefined) => {
      if (shared !== undefined) return `.${rootPrefix}-${shared}`;
      if (suffix === '-css-var') return `.ant-menu-css-var${scope}`;
      if (suffix !== undefined) {
        return `.${prefix}${suffix}${roots.has(suffix) || suffix.startsWith('-submenu-placement-') ? scope : ''}`;
      }

      return match === '"ant-menu"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
