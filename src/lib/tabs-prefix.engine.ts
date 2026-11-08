import template from './vendor/tabs-prefix.css.js';

const rootStates = new Set([
  '-top', '-bottom', '-left', '-right', '-small', '-large', '-card', '-editable',
  '-editable-card', '-centered', '-rtl', '-mobile'
]);

/** Local Tabs/switch и общий slide prefix независимы; token bridge и shared keyframes сохранены. */
export function getTabsPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-tabs' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-tabs-prefix=${JSON.stringify(prefix)}][data-ant-tabs-global=${JSON.stringify(rootPrefix)}])`;

  return template.replace(
    /\.ant-tabs([-\w]*)|\.ant-slide-(up|down)([-\w]*)|"ant-tabs"|" ant-tabs"/g,
    (
      match,
      suffix: string | undefined,
      slide: string | undefined,
      phase: string | undefined
    ) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-tabs-css-var${scope}`;
        return `.${prefix}${suffix}${rootStates.has(suffix) ? scope : ''}`;
      }
      if (slide) return `.${rootPrefix}-slide-${slide}${phase}`;
      return match === '"ant-tabs"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
