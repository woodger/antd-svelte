import template from './vendor/tree-select-prefix.css.js';

/** Owner dropdown scope отделён от сохранённого Native Tree adapter и общего Row namespace. */
export function getTreeSelectPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-tree-select' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-tree-select-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-tree-select-root-prefix=${JSON.stringify(rootPrefix)}])`;

  return template.replace(
    /\.ant-tree-select([-\w]*)|\.ant-row([-\w]*)|"ant-tree-select"|" ant-tree-select"/g,
    (match, suffix: string | undefined, row: string | undefined) => {
      if (row !== undefined) return `.${rootPrefix}-row${row}`;
      if (suffix === '-css-var') return `.ant-tree-select-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${scope}`;

      return match === '"ant-tree-select"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
