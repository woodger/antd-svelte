import template from './vendor/pagination-prefix.css.js';

/** Native Select сохраняет собственный namespace; приватные actual metrics следуют общему prefix. */
export function getPaginationPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-pagination' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-pagination-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-pagination-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set(['', '-small', '-large', '-mini', '-simple', '-rtl', '-bordered',
    '-start', '-center', '-end', '-filled', '-borderless', '-underlined']);

  return template.replace(/--ant-pagination-(item-size-actual|item-spacing-actual)|\.ant-pagination([-\w]*)/g,
    (_match, metric: string | undefined, suffix: string | undefined) => {
      if (metric !== undefined) return `--${rootPrefix.replaceAll('.', '')}-pagination-${metric}`;
      if (suffix === '-css-var') return `.ant-pagination-css-var${scope}`;
      const part = suffix ?? '';

      return `.${prefix}${part}${roots.has(part) ? scope : ''}`;
    }).replace(/<\/style/gi, '<\\/style');
}
