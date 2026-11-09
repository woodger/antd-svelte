import template from './vendor/table-prefix.css.js';

/** Table owner и private nested border независимы от общих Checkbox/Pagination namespaces. */
export function getTablePrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-table' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-table-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-table-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set(['', '-wrapper', '-wrapper-rtl', '-filter-dropdown', '-medium',
    '-small', '-large', '-bordered', '-empty', '-no-header']);
  const namespace = rootPrefix.replaceAll('.', '');

  return template.replace(
    /\.ant-table([-\w]*)|\.ant-(pagination|checkbox|radio|descriptions)([-\w]*)|--ant-table-nested-border-top|"ant-table"|" ant-table"/g,
    (match, suffix: string | undefined, child: string | undefined, part: string | undefined) => {
      if (child !== undefined) return `.${rootPrefix}-${child}${part}`;
      if (match === '--ant-table-nested-border-top') return `--${namespace}-table-nested-border-top`;
      if (suffix === '-css-var') return `.ant-table-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-table"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
