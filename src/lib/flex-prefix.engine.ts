import template from './vendor/flex-prefix.css.js';

/** Все Flex selectors относятся к корню; CSS variables и marker сохраняют имена. */
export function getFlexPrefixCss(prefix: string) {
  if (prefix === 'ant-flex') return undefined;

  return template
    .replace(/\.ant-flex(?!-css-var\b)([-\w]*)/g, (_, suffix: string) =>
      `.${prefix}${suffix}:where([data-ant-flex-prefix])`)
    .replace(/<\/style/gi, '<\\/style');
}
