import template from './vendor/timeline-prefix.css.js';

const rootStates = new Set(['', '-horizontal', '-layout-alternate', '-rtl']);

/** Root states изолированы; low-specificity fallback сохраняет прежние adaptive theme variables. */
export function getTimelinePrefixCss(prefix: string) {
  if (prefix === 'ant-timeline') return undefined;

  return template
    .replace(/\.ant-timeline([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? ':where(.ant-timeline-css-var[data-ant-timeline-prefix])'
      : `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-timeline-prefix])' : ''}`)
    .replace(/"ant-timeline"/g, () => `"${prefix}"`)
    .replace(/" ant-timeline"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
