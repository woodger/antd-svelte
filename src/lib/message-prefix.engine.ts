import template from './vendor/message-prefix.css.js';

/** Canonical Message tokens и private Notification metrics используют разные namespaces. */
export function getMessagePrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-message' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-message-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-message-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const variablePrefix = rootPrefix.replace(/\./g, '');
  const roots = new Set(['', '-rtl', '-top']);

  return template.replace(
    /\.ant-message([-\w]*)|--ant-notification-(icon-font-size|title-font-size|title-line-height)|"ant-message"|" ant-message"/g,
    (match, suffix: string | undefined, metric: string | undefined) => {
      if (metric !== undefined) return `--${variablePrefix}-notification-${metric}`;
      if (suffix === '-css-var') return `.ant-message-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-message"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
