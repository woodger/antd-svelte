import template from './vendor/divider-prefix.css.js';

const rootStates = new Set(['', '-horizontal', '-vertical', '-with-text', '-with-text-start',
  '-with-text-end', '-dashed', '-dotted', '-plain', '-rtl', '-sm', '-md',
  '-no-default-orientation-margin-start', '-no-default-orientation-margin-end']);

/** Меняет componentCls и descendant resets; marker и CSS variables остаются общими. */
export function getDividerPrefixCss(prefix: string) {
  if (prefix === 'ant-divider') return undefined;

  return template
    .replace(/\.ant-divider(?!-css-var\b)([-\w]*)/g, (_, suffix: string) =>
      `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-divider-prefix])' : ''}`)
    .replace(/"ant-divider"/g, () => `"${prefix}"`)
    .replace(/" ant-divider"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
