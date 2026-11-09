import template from './vendor/modal-prefix.css.js';

/** Modal/Confirm разделяют local classes и общий Button prefix; token marker остаётся canonical. */
export function getModalPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-modal' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-modal-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-modal-root-prefix=${JSON.stringify(rootPrefix)}])`;
  const roots = new Set([
    '', '-root', '-wrap', '-wrap-rtl', '-centered', '-confirm', '-confirm-rtl',
    '-confirm-info', '-confirm-success', '-confirm-error', '-confirm-warning', '-confirm-confirm'
  ]);

  return template.replace(
    /\.ant-modal([-\w]*)|\.ant-btn([-\w]*)|--ant-modal-(xs|sm|md|lg|xl|xxl)-width|"ant-modal"|" ant-modal"/g,
    (
      match,
      suffix: string | undefined,
      button: string | undefined,
      breakpoint: string | undefined
    ) => {
      if (breakpoint !== undefined) return `--${prefix}-${breakpoint}-width`;
      if (button !== undefined) return `.${rootPrefix}-btn${button}`;
      if (suffix === '-css-var') return `.ant-modal-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-modal"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
