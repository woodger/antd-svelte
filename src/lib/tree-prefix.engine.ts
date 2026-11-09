import template from './vendor/tree-prefix.css.js';

/** Tree/checkbox classes локальны; общий Row selector и canonical tokens независимы. */
export function getTreePrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-tree' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-tree-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-tree-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set(['', '-rtl', '-show-line', '-directory']);

  return template.replace(
    /\.ant-tree([-\w]*)|\.ant-row([-\w]*)|"ant-tree"|" ant-tree"/g,
    (match, suffix: string | undefined, row: string | undefined) => {
      if (row !== undefined) return `.${rootPrefix}-row${row}`;
      if (suffix === '-css-var') return `.ant-tree-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-tree"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
