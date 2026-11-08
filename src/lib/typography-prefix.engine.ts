import template from './vendor/typography-prefix.css.js';

/** Общий marker сохраняется для aliases и Native compact; local classes охватывают editing/actions. */
export function getTypographyPrefixCss(prefix: string) {
  if (prefix === 'ant-typography') return undefined;

  const scope = `:where([data-ant-typography-prefix=${JSON.stringify(prefix)}])`;

  return template.replace(
    /\.ant-typography([-\w]*)|"ant-typography"|" ant-typography"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        return suffix === '-css-var' ? `.ant-typography-css-var${scope}` : `.${prefix}${suffix}`;
      }
      return match === '"ant-typography"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
