import template from './vendor/transfer-prefix.css.js';

/** Transfer owner classes и общие Button/Input/Pagination/Table namespaces независимы. */
export function getTransferPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-transfer' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-transfer-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-transfer-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set(['', '-customize-list', '-status-error', '-status-warning', '-rtl']);

  return template.replace(
    /\.ant-transfer([-\w]*)|\.ant-(btn|input|pagination|table)([-\w]*)|"ant-transfer"|" ant-transfer"/g,
    (match, suffix: string | undefined, common: string | undefined, part: string | undefined) => {
      if (common !== undefined) return `.${rootPrefix}-${common}${part ?? ''}`;
      if (suffix === '-css-var') return `.ant-transfer-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-transfer"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
