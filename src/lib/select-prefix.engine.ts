import template from './vendor/select-prefix.css.js';

/** Select owner classes и общий private variable/Typography namespace независимы. */
export function getSelectPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-select' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-select-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-select-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const namespace = rootPrefix.replaceAll('.', '');
  const roots = new Set(['', '-dropdown', '-dropdown-rtl', '-rtl', '-in-form-item',
    '-status-error', '-status-warning', '-status-success', '-status-validating', '-has-feedback',
    '-focused', '-disabled', '-sm', '-lg', '-single', '-multiple', '-show-search', '-allow-clear',
    '-show-arrow', '-open', '-customize', '-customize-input', '-outlined', '-filled', '-borderless',
    '-underlined', '-compact-item', '-compact-first-item', '-compact-last-item']);
  const privateNames = new Set(['border-radius', 'border-color', 'border-size', 'background-color',
    'font-size', 'line-height', 'font-height', 'color', 'affix-color', 'height', 'padding-horizontal',
    'padding-vertical', 'multi-item-background', 'multi-item-border-color', 'multi-item-border-radius',
    'multi-item-height', 'multi-padding-base', 'multi-padding-vertical', 'multi-item-padding-horizontal']);
  const css = template.replace(
    /\.ant-select([-\w]*)|\.ant-typography|--ant-select-([-\w]+)|"ant-select"|" ant-select"/g,
    (match, suffix: string | undefined, variable: string | undefined) => {
      if (variable !== undefined) {
        return privateNames.has(variable) ? `--${namespace}-select-${variable}` : match;
      }
      if (match === '.ant-typography') return `.${rootPrefix}-typography`;
      if (suffix === '-css-var') return `.ant-select-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-select"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  );
  // Native container владеет compact geometry; значения совпадают с canonical theme bridge.
  const native = `.${prefix}-compact-item${scope}{border-radius:var(--ant-border-radius);}`
    + `.${prefix}-compact-item.${prefix}-lg${scope}{border-radius:var(--ant-border-radius-lg);}`
    + `.${prefix}-compact-item.${prefix}-sm${scope}{border-radius:var(--ant-border-radius-sm);}`
    + `.${prefix}-compact-item${scope}:focus-within:not(:hover){z-index:3;}`
    + `.${prefix}-compact-item.${prefix}-disabled${scope}{z-index:0;}`;

  return (css + native).replace(/<\/style/gi, '<\\/style');
}
