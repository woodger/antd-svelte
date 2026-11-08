import template from './vendor/card-prefix.css.js';

const rootStates = new Set([
  '-bordered', '-hoverable', '-contain-grid', '-contain-tabs', '-loading', '-small',
  '-type-inner', '-rtl'
]);

/** Owner Card/Grid/Meta prefix и общий prefix делегированных Typography/Tabs независимы. */
export function getCardPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-card' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-card-prefix=${JSON.stringify(prefix)}][data-ant-card-global=${JSON.stringify(rootPrefix)}])`;

  return template.replace(
    /\.ant-card([-\w]*)|\.ant-(typography|tabs-top)(?![-\w])|"ant-card"|" ant-card"/g,
    (match, suffix: string | undefined, delegated: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-card-css-var${scope}`;
        return `.${prefix}${suffix}${rootStates.has(suffix) ? scope : ''}`;
      }
      if (delegated) return `.${rootPrefix}-${delegated}`;
      return match === '"ant-card"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
