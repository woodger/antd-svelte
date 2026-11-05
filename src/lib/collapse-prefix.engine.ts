import template from './vendor/collapse-prefix.css.js';

const rootStates = new Set([
  '', '-rtl', '-small', '-large', '-borderless', '-ghost',
  '-icon-placement-start', '-icon-placement-end'
]);

/** Общие variables/marker; native heading/button используют тот же prefix через data parts. */
export function getCollapsePrefixCss(prefix: string) {
  if (prefix === 'ant-collapse') return undefined;

  return template
    .replace(/\.ant-collapse([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? '.ant-collapse-css-var:where([data-ant-collapse-prefix])'
      : `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-collapse-prefix])' : ''}`)
    .replace(/"ant-collapse"/g, () => `"${prefix}"`)
    .replace(/" ant-collapse"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
