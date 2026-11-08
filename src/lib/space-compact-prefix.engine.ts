import template from './vendor/space-compact-prefix.css.js';

/** Layout Compact не меняет prefixes собственных controls. */
export function getSpaceCompactPrefixCss(prefix: string) {
  if (prefix === 'ant-space-compact') return undefined;

  const scope = `:where([data-ant-space-compact-prefix=${JSON.stringify(prefix)}])`;

  return template.replace(/\.ant-space-compact([-\w]*)/g, (_, suffix: string) =>
    suffix === '-css-var' ? '.ant-space-compact-css-var' : `.${prefix}${suffix}${scope}`
  ).replace(/<\/style/gi, '<\\/style');
}
