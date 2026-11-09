import template from './vendor/mentions-prefix.css.js';

/** Text triggers/IDs не зависят от CSS prefix; private input variables используют общий namespace. */
export function getMentionsPrefixCss(prefix: string, rootPrefix: string) {
  if (prefix === 'ant-mentions' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-mentions-prefix=${JSON.stringify(prefix)}][data-ant-mentions-global=${JSON.stringify(rootPrefix)}])`;
  const namespace = rootPrefix.replace(/\./g, '');

  return template.replace(
    /\.ant-mentions([-\w]*)|\.ant-form-item-feedback-icon(?![-\w])|--ant-cmp-mentions-|"ant-mentions"|" ant-mentions"/g,
    (match, suffix: string | undefined) => {
      if (suffix === '-css-var') return `.ant-mentions-css-var${scope}`;
      if (suffix !== undefined) {
        const child = suffix === '-measure' || suffix === '-suffix'
          || suffix.startsWith('-clear-icon') || suffix.startsWith('-dropdown-menu');

        return `.${prefix}${suffix}${child ? '' : scope}`;
      }
      if (match === '.ant-form-item-feedback-icon') return `.${rootPrefix}-form-item-feedback-icon`;
      if (match === '--ant-cmp-mentions-') return `--${namespace}-cmp-mentions-`;

      return match === '"ant-mentions"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
