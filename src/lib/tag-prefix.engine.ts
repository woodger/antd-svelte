import template from './vendor/tag-prefix.css.js';

/** Меняет componentCls; marker, иконки и исходные имена CSS variables остаются общими. */
export function getTagPrefixCss(prefix: string) {
  if (prefix === 'ant-tag') return undefined;

  // Runtime stylesheet следует scoped styles; равная specificity сохраняет native font.
  const nativeFont = '\n.ant-tag:where(.ant-tag-css-var) [data-ant-tag-close]{font:inherit;letter-spacing:inherit;}';
  return `${template}${nativeFont}`
    .replace(/\.ant-tag(?!-css-var\b)/g, () => `.${prefix}`)
    .replace(/"ant-tag"/g, () => `"${prefix}"`)
    .replace(/" ant-tag"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
