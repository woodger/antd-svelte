import template from './vendor/qrcode-prefix.css.js';

/** Root/borderless и CSS-variable defaults изолированы от соседних QRCode. */
export function getQRCodePrefixCss(prefix: string) {
  if (prefix === 'ant-qrcode') return undefined;

  return template
    .replace(/\.ant-qrcode([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      // Legacy theme.css сохраняет адаптивный color-mix; fallback module не перекрывает его.
      ? ':where(.ant-qrcode-css-var[data-ant-qrcode-prefix])'
      : `.${prefix}${suffix}${!suffix || suffix === '-borderless'
        ? ':where([data-ant-qrcode-prefix])' : ''}`)
    .replace(/"ant-qrcode"/g, () => `"${prefix}"`)
    .replace(/" ant-qrcode"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
