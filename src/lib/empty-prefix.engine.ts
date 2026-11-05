import template from './vendor/empty-prefix.css.js';

const rootStates = new Set(['', '-normal', '-small', '-rtl']);

/** Variables/marker общие; reset и state rules ограничены своим Empty root. */
export function getEmptyPrefixCss(prefix: string) {
  if (prefix === 'ant-empty') return undefined;

  return template
    .replace(/\.ant-empty([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? '.ant-empty-css-var:where([data-ant-empty-prefix])'
      : `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-empty-prefix])' : ''}`)
    .replace(/"ant-empty"/g, () => `"${prefix}"`)
    .replace(/" ant-empty"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
