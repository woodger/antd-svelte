import template from './vendor/space-addon-prefix.css.js';

/** Variant/status variables принадлежат global prefix, классы — local prefix. */
export function getSpaceAddonPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-space-addon' && rootPrefix === 'ant') return undefined;

  const namespace = rootPrefix.replace(/\./g, '');
  const scope = `:where([data-ant-space-addon-prefix=${JSON.stringify(prefix)}][data-ant-space-addon-vars=${JSON.stringify(namespace)}])`;

  return template.replace(
    /\.ant-space-addon([-\w]*)|--ant-space-addon-|"ant-space-addon"|" ant-space-addon"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        return suffix === '-css-var'
          ? '.ant-space-addon-css-var' : `.${prefix}${suffix}${scope}`;
      }
      if (match === '--ant-space-addon-') return `--${namespace}-space-addon-`;
      return match === '"ant-space-addon"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
