import template from './vendor/alert-prefix.css.js';

const rootStates = new Set([
  '', '-success', '-info', '-warning', '-error', '-filled', '-outlined', '-with-description',
  '-no-icon', '-banner', '-rtl'
]);

/** Variables/marker общие; reset и state rules принадлежат своему Alert. */
export function getAlertPrefixCss(prefix: string) {
  if (prefix === 'ant-alert') return undefined;

  return template
    .replace(/\.ant-alert([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? '.ant-alert-css-var:where([data-ant-alert-prefix])'
      : `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-alert-prefix])' : ''}`)
    .replace(/"ant-alert"/g, () => `"${prefix}"`)
    .replace(/" ant-alert"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
