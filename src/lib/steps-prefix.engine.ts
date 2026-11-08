import template from './vendor/steps-prefix.css.js';

const rootStates = new Set([
  '', '-filled', '-outlined', '-title-horizontal', '-title-vertical', '-horizontal', '-vertical',
  '-small', '-default', '-dot', '-inline', '-navigation', '-panel', '-ellipsis', '-max-count',
  '-with-progress', '-rtl'
]);

/** Root states изолированы; token namespaces и adaptive defaults сохраняют владельца. */
export function getStepsPrefixCss(prefix: string) {
  if (prefix === 'ant-steps') return undefined;

  return template
    .replace(/\.ant-steps([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? ':where(.ant-steps-css-var[data-ant-steps-prefix])'
      : `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-steps-prefix])' : ''}`)
    .replace(/"ant-steps"/g, () => `"${prefix}"`)
    .replace(/" ant-steps"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
