import template from './vendor/image-prefix.css.js';

/** Image и viewer сохраняют canonical tokens; независимые preview namespaces изолируются по корню. */
export function getImagePrefixCss(prefix: string, previewPrefix = `${prefix}-preview`) {
  if (prefix === 'ant-image' && previewPrefix === 'ant-image-preview') return undefined;

  const scope = `:where([data-ant-image-prefix=${JSON.stringify(prefix)}])`;
  const previewScope = `:where([data-ant-image-prefix=${JSON.stringify(prefix)}]`
    + `[data-ant-image-preview-prefix=${JSON.stringify(previewPrefix)}])`;
  const previewRoot = previewPrefix ? `.${previewPrefix}` : '[data-ant-image-preview-prefix=""]';
  const independent = previewPrefix !== `${prefix}-preview`;

  return template.replace(
    /\.ant-image([-\w]*)|\[class(\^|\*)="( ?)ant-image"\]/g,
    (_match, suffix: string | undefined, operator: string, space: string) => {
      if (suffix === '-css-var') return `.ant-image-css-var${scope}`;
      if (suffix?.startsWith('-preview')) {
        const part = suffix.slice('-preview'.length);

        if (!part) return `${previewRoot}${previewScope}`;
        if (part === '-movable' || part === '-moving') return `.${previewPrefix}${part}${previewScope}`;

        return `.${previewPrefix}${part}`;
      }
      if (suffix !== undefined) return `.${prefix}${suffix}${!suffix || suffix === '-error' ? scope : ''}`;

      const reset = (namespace: string) => `[class${operator}=${JSON.stringify(space + namespace)}]`;

      return independent ? `:is(${reset(prefix)},${reset(previewPrefix || '-')})` : reset(prefix);
    }
  ).replace(/<\/style/gi, '<\\/style');
}
