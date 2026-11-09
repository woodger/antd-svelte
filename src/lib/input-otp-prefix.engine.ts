import template from './vendor/input-otp-prefix.css.js';

/** OTP descendants используют prefix владельца; вложенный Input сохраняет свой namespace. */
export function getInputOTPPrefixCss(prefix: string) {
  if (prefix === 'ant-otp') return undefined;

  const scope = `:where([data-ant-otp-prefix=${JSON.stringify(prefix)}])`;
  const children = new Set(['-input', '-input-wrapper', '-mask-icon', '-mask-input', '-separator']);

  return template.replace(
    /\.ant-otp([-\w]*)|"ant-otp"|" ant-otp"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-otp-css-var${scope}`;

        return `.${prefix}${suffix}${children.has(suffix) ? '' : scope}`;
      }
      return match === '"ant-otp"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
