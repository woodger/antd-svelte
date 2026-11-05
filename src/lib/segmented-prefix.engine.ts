import template from './vendor/segmented-prefix.css.js';

const rootStates = new Set([
  '', '-rtl', '-vertical', '-block', '-sm', '-lg', '-shape-round', '-disabled'
]);

/** Имена variables/marker сохраняются; defaults и root states ограничены своим control. */
export function getSegmentedPrefixCss(prefix: string) {
  if (prefix === 'ant-segmented') return undefined;

  return template
    .replace(/\.ant-segmented([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? '.ant-segmented-css-var:where([data-ant-segmented-prefix])'
      : `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-segmented-prefix])' : ''}`)
    .replace(/"ant-segmented"/g, () => `"${prefix}"`)
    .replace(/" ant-segmented"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
