import template from './vendor/upload-prefix.css.js';

/** Upload classes следуют владельцу; canonical tokens и общий link reset сохраняются. */
export function getUploadPrefixCss(prefix: string) {
  if (prefix === 'ant-upload') return undefined;

  const scope = `:where([data-ant-upload-prefix=${JSON.stringify(prefix)}])`;
  const roots = new Set(['-wrapper', '-picture-card-wrapper', '-picture-circle-wrapper', '-rtl']);

  return template.replace(
    /\.ant-upload([-\w]*)|"ant-upload"|" ant-upload"/g,
    (match, suffix: string | undefined) => {
      if (suffix === '-css-var') return `.ant-upload-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-upload"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
