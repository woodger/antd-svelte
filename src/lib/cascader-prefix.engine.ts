import template from './vendor/cascader-prefix.css.js';

/** Cascader/Panel owner, Select popup и общий Row namespace изолированы друг от друга. */
export function getCascaderPrefixCss(prefix: string, selectPrefix: string, rootPrefix: string) {
  if (prefix === 'ant-cascader' && selectPrefix === 'ant-select' && rootPrefix === 'ant') {
    return undefined;
  }

  const scope = `:where([data-ant-cascader-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-cascader-select-prefix=${JSON.stringify(selectPrefix)}]`
    + `[data-ant-cascader-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set(['', '-dropdown', '-dropdown-rtl', '-rtl', '-panel', '-panel-empty']);

  return template.replace(
    /\.ant-cascader([-\w]*)|\.ant-select-dropdown|\.ant-row([-\w]*)|"ant-cascader"|" ant-cascader"/g,
    (match, suffix: string | undefined, row: string | undefined) => {
      if (row !== undefined) return `.${rootPrefix}-row${row}`;
      // Upstream пропускает local Select override; Native сохраняет прежний padding:0.
      if (match === '.ant-select-dropdown') return `.${selectPrefix}-dropdown${scope}`;
      if (suffix === '-css-var') return `.ant-cascader-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-cascader"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
