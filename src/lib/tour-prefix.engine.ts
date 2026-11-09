import template from './vendor/tour-prefix.css.js';

/** Button selectors и private Tooltip variables используют общий prefix отдельно от Tour. */
export function getTourPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-tour' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-tour-prefix=${JSON.stringify(prefix)}][data-ant-tour-global=${JSON.stringify(rootPrefix)}])`;
  const namespace = rootPrefix.replace(/\./g, '');

  return template.replace(
    /\.ant-tour([-\w]*)|\.ant-btn(?![-\w])|--ant-tooltip-arrow-|"ant-tour"|" ant-tour"/g,
    (match, suffix: string | undefined) => {
      if (suffix === '-css-var') return `.ant-tour-css-var${scope}`;
      if (suffix !== undefined) {
        const root = !suffix || suffix === '-mask' || suffix === '-pure'
          || suffix.startsWith('-placement-');

        return `.${prefix}${suffix}${root ? scope : ''}`;
      }
      if (match === '.ant-btn') return `.${rootPrefix}-btn`;
      if (match === '--ant-tooltip-arrow-') return `--${namespace}-tooltip-arrow-`;

      return match === '"ant-tour"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
