import template from './vendor/radio-prefix.css.js';

/** Local Radio/Button/Group classes и общий Badge namespace независимы. */
export function getRadioPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-radio' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-radio-prefix=${JSON.stringify(prefix)}][data-ant-radio-global=${JSON.stringify(rootPrefix)}])`;

  return template.replace(
    /\.ant-radio([-\w]*)|\.ant-(badge[-\w]*)(?![-\w])|"ant-radio"|" ant-radio"/g,
    (match, suffix: string | undefined, delegated: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-radio-css-var${scope}`;

        const root = suffix.startsWith('-group') || suffix.startsWith('-wrapper')
          || suffix.startsWith('-button-wrapper');

        return `.${prefix}${suffix}${root ? scope : ''}`;
      }
      if (delegated) return `.${rootPrefix}-${delegated}`;
      return match === '"ant-radio"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
