import template from './vendor/image-prefix.css.js';

/** Image и его preview сохраняют canonical tokens, Group не меняет классы дочерних Image. */
export function getImagePrefixCss(prefix: string) {
  if (prefix === 'ant-image') return undefined;

  const scope = `:where([data-ant-image-prefix=${JSON.stringify(prefix)}])`;
  const roots = new Set(['', '-error', '-preview', '-preview-movable', '-preview-moving']);

  return template.replace(
    /\.ant-image([-\w]*)|"ant-image"|" ant-image"/g,
    (match, suffix: string | undefined) => {
      if (suffix === '-css-var') return `.ant-image-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-image"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
