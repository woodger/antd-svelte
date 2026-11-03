import template from './vendor/avatar-prefix.css.js';

/** Меняет только Avatar componentCls; CSS variables, marker, Image и anticon остаются общими. */
export function getAvatarPrefixCss(prefix: string) {
  if (prefix === 'ant-avatar') return undefined;

  return template
    // Общий marker не должен сбрасывать font-size и aliases соседних стандартных Avatar.
    .replace(
      /(^|[\n,])\.ant-avatar-css-var(?=[\s{:.#>+~[]|$)/g,
      (_, separator: string) =>
        `${separator}:is(.ant-avatar,.ant-avatar-group):where(.ant-avatar-css-var)`
    )
    .replace(/\.ant-avatar(?!-css-var\b)/g, () => `.${prefix}`)
    .replace(/"ant-avatar"/g, () => `"${prefix}"`)
    .replace(/" ant-avatar"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
