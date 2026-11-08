import template from './vendor/carousel-prefix.css.js';

/** Local wrapper/keyframes и общий prefix Radio/Checkbox selectors независимы. */
export function getCarouselPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-carousel' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-carousel-prefix=${JSON.stringify(prefix)}][data-ant-carousel-global=${JSON.stringify(rootPrefix)}])`;

  return template.replace(
    /\.ant-carousel([-\w]*)|\.ant-(radio-input|checkbox-input)|ant-carousel-dot-(vertical-)?animation|"ant-carousel"|" ant-carousel"/g,
    (
      match,
      suffix: string | undefined,
      control: string | undefined,
      vertical: string | undefined
    ) => {
      if (suffix !== undefined) {
        return suffix === '-css-var' ? `.ant-carousel-css-var${scope}` : `.${prefix}${suffix}`;
      }
      if (control) return `.${rootPrefix}-${control}`;
      if (match.startsWith('ant-carousel-dot-')) {
        return `${prefix}-dot-${vertical ?? ''}animation`;
      }
      return match === '"ant-carousel"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
