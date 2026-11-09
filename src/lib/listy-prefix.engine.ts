import template from './vendor/listy-prefix.css.js';

/** Scoped CSS работает с raw/virtual parts; scrollbar variable принадлежит rc-virtual-list. */
export function getListyPrefixCss(prefix: string) {
  if (prefix === 'ant-listy') return undefined;

  const scope = `:where([data-ant-listy-prefix=${JSON.stringify(prefix)}])`;

  return template.replace(
    /\.ant-listy([-\w]*)|"ant-listy"|" ant-listy"/g,
    (match, suffix: string | undefined) => {
      if (suffix === '-css-var') return `.ant-listy-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${!suffix || suffix === '-rtl' ? scope : ''}`;

      return match === '"ant-listy"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
