import template from './vendor/notification-prefix.css.js';

/** Status backgrounds остаются canonical component tokens; private metrics следуют global prefix. */
export function getNotificationPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-notification' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-notification-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-notification-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const variablePrefix = rootPrefix.replace(/\./g, '');
  const roots = new Set([
    '', '-rtl', '-top', '-topLeft', '-topRight', '-bottom', '-bottomLeft', '-bottomRight'
  ]);

  return template.replace(
    /\.ant-notification([-\w]*)|--ant-notification-(icon-font-size|title-font-size|title-line-height)|"ant-notification"|" ant-notification"/g,
    (match, suffix: string | undefined, metric: string | undefined) => {
      if (metric !== undefined) return `--${variablePrefix}-notification-${metric}`;
      if (suffix === '-css-var') return `.ant-notification-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-notification"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
