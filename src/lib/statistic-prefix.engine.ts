import template from './vendor/statistic-prefix.css.js';

/** Root marker изолирует alias prefixes от соседних Statistic и CSS-variable roots. */
export function getStatisticPrefixCss(prefix: string) {
  if (prefix === 'ant-statistic') return undefined;

  const css = template
    .replace(/\.ant-statistic([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? '.ant-statistic-css-var:where([data-ant-statistic-prefix])'
      : `.${prefix}${suffix}${suffix ? '' : ':where([data-ant-statistic-prefix])'}`)
    .replace(/"ant-statistic"/g, () => `"${prefix}"`)
    .replace(/" ant-statistic"/g, () => `" ${prefix}"`)
    // Прежние native title/compact defaults сохраняются и без design-token context.
    + `\n.${prefix}:where([data-ant-statistic-prefix]){--ant-statistic-title-font-size:var(--ant-font-size);}`
    + `\n.${prefix}.ant-statistic-compact:where([data-ant-statistic-prefix]){--ant-statistic-content-font-size:20px;}`;

  return css.replace(/<\/style/gi, '<\\/style');
}
