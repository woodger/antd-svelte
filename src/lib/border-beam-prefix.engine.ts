import template from './vendor/border-beam-prefix.css.js';

/** Local selectors меняются; beam variables и общая keyframe сохраняют исходные имена. */
export function getBorderBeamPrefixCss(prefix: string) {
  if (prefix === 'ant-border-beam') return undefined;

  return template
    .replace(/\.ant-border-beam(?![-\w])/g, () =>
      `.${prefix}:where([data-ant-border-beam-prefix])`)
    .replace(/"ant-border-beam"/g, () => `"${prefix}"`)
    .replace(/" ant-border-beam"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
