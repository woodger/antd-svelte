import template from './vendor/input-search-prefix.css.js';

/** Search classes локальны; Button и служебные переменные используют общий namespace. */
export function getInputSearchPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-input-search' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-input-search-prefix=${JSON.stringify(prefix)}][data-ant-input-search-global=${JSON.stringify(rootPrefix)}])`;
  const namespace = rootPrefix.replace(/\./g, '');

  return template.replace(
    /\.ant-input-search([-\w]*)|\.ant-btn([-\w]*)|--ant-input-search-|"ant-input-search"|" ant-input-search"/g,
    (match, suffix: string | undefined, buttonSuffix: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-input-search-css-var${scope}`;

        return `.${prefix}${suffix}${suffix.startsWith('-btn') ? '' : scope}`;
      }
      if (buttonSuffix !== undefined) return `.${rootPrefix}-btn${buttonSuffix}`;
      if (match === '--ant-input-search-') return `--${namespace}-input-search-`;
      return match === '"ant-input-search"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
