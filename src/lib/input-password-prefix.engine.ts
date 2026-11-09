import template from './vendor/input-password-prefix.css.js';

/** Password и вложенный Input имеют независимые namespaces; tokens остаются общими. */
export function getInputPasswordPrefixCss(inputPrefix: string, passwordPrefix: string) {
  if (inputPrefix === 'ant-input' && passwordPrefix === 'ant-input-password') return undefined;

  return template.replace(
    /\.ant-input-password-icon|\.ant-input-affix-wrapper(-disabled)?/g,
    (match, suffix: string | undefined) => match === '.ant-input-password-icon'
      ? `.${passwordPrefix}-icon`
      : `.${inputPrefix}-affix-wrapper${suffix ?? ''}:where(.${passwordPrefix})`
  ).replace(/<\/style/gi, '<\\/style');
}
