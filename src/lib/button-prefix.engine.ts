import template from './vendor/button-prefix.css.js';

/** Варианты Button используют общий namespace; icon/loading classes следуют local prefix. */
export function getButtonPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-btn' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-button-prefix=${JSON.stringify(prefix)}][data-ant-button-global=${JSON.stringify(rootPrefix)}])`;
  const namespace = rootPrefix.replace(/\./g, '');

  return template.replace(
    /\.ant-btn([-\w]*)|--ant-btn-|"ant-btn"|" ant-btn"/g,
    (match, suffix: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') return `.ant-btn-css-var${scope}`;

        const child = suffix === '-icon' || suffix.startsWith('-loading-icon');

        return `.${prefix}${suffix}${child ? '' : scope}`;
      }
      if (match === '--ant-btn-') return `--${namespace}-btn-`;
      return match === '"ant-btn"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
