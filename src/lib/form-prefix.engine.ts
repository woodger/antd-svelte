import template from './vendor/form-prefix.css.js';
import { hashTokenString } from './theme-hash.engine';
import type { AliasToken } from './theme-token.types';

const mediaKeys = ['screenXSMax', 'screenSMMax', 'screenMDMax', 'screenLGMax'] as const;
const defaults = [575, 767, 991, 1199] as const;

/** Form и Item разрешают prefix независимо; media scope не зависит от cssVar.key/hashed. */
export function getFormPrefixScope(prefix: string, rootPrefix: string, token: AliasToken) {
  const sizes = mediaKeys.map(key => Number(token[key]));
  if (prefix === 'ant-form' && rootPrefix === 'ant'
    && sizes.every((size, index) => size === defaults[index])) return undefined;

  return `ant-form-scope-${hashTokenString([prefix, rootPrefix, ...sizes].join('\0'))}`;
}

/** Canonical token names сохранены; Col и private variables используют общий namespace. */
export function getFormPrefixCss(prefix: string, rootPrefix: string, token: AliasToken) {
  const scope = getFormPrefixScope(prefix, rootPrefix, token);
  if (!scope) return undefined;

  const owner = `:where([data-ant-form-prefix="${scope}"])`;
  const namespace = rootPrefix.replace(/\./g, '');

  return template.replace(
    /\.ant-form([-\w]*)|\.ant-col([-\w]*)|--ant-grid-display|--ant-form-item-label-margin|"ant-form"|" ant-form"/g,
    (match, suffix: string | undefined, colSuffix: string | undefined) => {
      if (suffix !== undefined) {
        return `${suffix === '-css-var' ? '.ant-form-css-var' : `.${prefix}${suffix}`}${owner}`;
      }
      if (colSuffix !== undefined) return `.${rootPrefix}-col${colSuffix}`;
      if (match === '--ant-grid-display') return `--${namespace}-grid-display`;
      if (match === '--ant-form-item-label-margin') return `--${namespace}-form-item-label-margin`;
      return match === '"ant-form"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/(\[class(?:\^|\*)=")([^"]*ant-col[^"]*)("\])/g,
    (_, start: string, value: string, end: string) =>
      `${start}${value.replace(/ant-col/g, () => `${rootPrefix}-col`)}${end}`
  ).replace(/@media \(max-width: (575|767|991|1199)px\)/g, (_, size: string) => {
    const index = defaults.indexOf(Number(size) as typeof defaults[number]);

    return `@media (max-width: ${Number(token[mediaKeys[index]])}px)`;
  }).replace(/<\/style/gi, '<\\/style');
}
