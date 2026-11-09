import template from './vendor/checkbox-prefix.css.js';

/** Local Checkbox/Group classes и общий Row namespace независимы. */
export function getCheckboxPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-checkbox' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-checkbox-prefix=${JSON.stringify(prefix)}][data-ant-checkbox-global=${JSON.stringify(rootPrefix)}])`;

  return template.replace(
    /\.ant-checkbox([-\w]*)|\.ant-row(?![-\w])|"ant-checkbox"|" ant-checkbox"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-checkbox-css-var${scope}`;

        const root = suffix.startsWith('-wrapper') || suffix.startsWith('-group')
          || suffix === '-rtl';

        return `.${prefix}${suffix}${root ? scope : ''}`;
      }
      if (match === '.ant-row') return `.${rootPrefix}-row`;
      return match === '"ant-checkbox"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
