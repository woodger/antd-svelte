import template from './vendor/descriptions-prefix.css.js';

/** Все cells наследуют owner prefix; canonical marker сохраняет component theme variables. */
export function getDescriptionsPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-descriptions' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-descriptions-prefix=${JSON.stringify(prefix)}][data-ant-descriptions-global=${JSON.stringify(rootPrefix)}])`;

  return template.replace(
    /\.ant-descriptions([-\w]*)|\.ant-(table-wrapper|table-expanded-row)|"ant-descriptions"|" ant-descriptions"/g,
    (match, suffix: string | undefined, table: string | undefined) => {
      if (suffix !== undefined) {
        return suffix === '-css-var' ? `.ant-descriptions-css-var${scope}` : `.${prefix}${suffix}`;
      }
      if (table) return `.${rootPrefix}-${table}`;
      return match === '"ant-descriptions"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replaceAll(
    `tr.${rootPrefix}-table-expanded-row .${prefix}-view`,
    `tr.${rootPrefix}-table-expanded-row ${scope} .${prefix}-view`
  ).replace(/<\/style/gi, '<\\/style');
}
