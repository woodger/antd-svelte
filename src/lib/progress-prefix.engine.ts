import template from './vendor/progress-prefix.css.js';

const rootStates = new Set(['', '-rtl', '-line', '-circle', '-inline-circle', '-small', '-steps',
  '-show-info', '-status-normal', '-status-exception', '-status-active', '-status-success',
  '-line-align-start', '-line-align-center', '-line-align-end', '-line-position-inner',
  '-line-position-outer']);

/** Имена variables/marker/anticon остаются общими; root defaults ограничены своим host. */
export function getProgressPrefixCss(prefix: string) {
  if (prefix === 'ant-progress') return undefined;

  return template
    .replace(/\.ant-progress([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? '.ant-progress-css-var:where([data-ant-progress-prefix])'
      : `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-progress-prefix])' : ''}`)
    .replace(/"ant-progress"/g, () => `"${prefix}"`)
    .replace(/" ant-progress"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
