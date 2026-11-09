import template from './vendor/date-picker-prefix.css.js';

/** Date/Time single/range разделяют owner, общий private affix namespace и canonical tokens. */
export function getPickerPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-picker' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-picker-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-picker-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set(['', '-borderless', '-compact-item', '-disabled', '-dropdown',
    '-dropdown-range', '-dropdown-range-hidden', '-dropdown-rtl', '-filled', '-focused',
    '-large', '-multiple', '-outlined', '-range', '-rtl', '-small', '-underlined']);
  const namespace = rootPrefix.replaceAll('.', '');

  return template.replace(
    /\.ant-picker([-\w]*)|\.ant-tag-blue|--ant-date-picker-affix-color|"ant-picker"|" ant-picker"/g,
    (match, suffix: string | undefined) => {
      if (match === '.ant-tag-blue') return `.${rootPrefix}-tag-blue`;
      if (match === '--ant-date-picker-affix-color') return `--${namespace}-date-picker-affix-color`;
      if (suffix === '-css-var') return `.ant-picker-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-picker"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
