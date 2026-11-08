import template from './vendor/space-prefix.css.js';

/** Badge selector использует общий prefix независимо от локального Space. */
export function getSpacePrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-space' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-space-prefix=${JSON.stringify(prefix)}][data-ant-space-global=${JSON.stringify(rootPrefix)}])`;

  return template.replace(
    /\.ant-space([-\w]*)|\.ant-badge-not-a-wrapper/g,
    (_, suffix: string | undefined) => {
      if (suffix === undefined) return `.${rootPrefix}-badge-not-a-wrapper`;
      if (suffix === '-css-var') return '.ant-space-css-var';
      const root = suffix !== '-item' && suffix !== '-item-separator';
      return `.${prefix}${suffix}${root ? scope : ''}`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
