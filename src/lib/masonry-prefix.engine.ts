import template from './vendor/masonry-prefix.css.js';

/** Root/RTL aliases ограничены владельцем; геометрия и motion остаются исходными. */
export function getMasonryPrefixCss(prefix: string) {
  if (prefix === 'ant-masonry') return undefined;

  const scope = `:where([data-ant-masonry-prefix=${JSON.stringify(prefix)}])`;
  const css = `.${prefix}${scope}{direction:inherit;}\n` + template.replace(
    /\.ant-masonry([-\w]*)|"ant-masonry"|" ant-masonry"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-masonry-css-var${scope}`;
        return `.${prefix}${suffix}${suffix === '' || suffix === '-rtl' ? scope : ''}`;
      }
      return match === '"ant-masonry"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  );
  return css.replace(/<\/style/gi, '<\\/style');
}
