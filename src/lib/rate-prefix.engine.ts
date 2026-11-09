import template from './vendor/rate-prefix.css.js';

const rootStates = new Set(['', '-small', '-large', '-rtl', '-disabled']);

/** Canonical tokens и native button adapter не зависят от классов Rate. */
export function getRatePrefixCss(prefix: string) {
  if (prefix === 'ant-rate') return undefined;

  const scope = `:where([data-ant-rate-prefix=${JSON.stringify(prefix)}])`;

  return template.replace(
    /\.ant-rate([-\w]*)|"ant-rate"|" ant-rate"/g,
    (match, suffix: string | undefined) => {
      if (suffix === '-css-var') return `.ant-rate-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${rootStates.has(suffix) ? scope : ''}`;

      return match === '"ant-rate"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
