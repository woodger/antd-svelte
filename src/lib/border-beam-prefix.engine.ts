import template from './vendor/border-beam-prefix.css.js';

/** Local class и общий namespace variables независимы; marker изолирует обе настройки. */
export function getBorderBeamPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-border-beam' && rootPrefix === 'ant') return undefined;

  const namespace = rootPrefix.replace(/\./g, '');
  const scope = `:where([data-ant-border-beam-prefix][data-ant-border-beam-vars=${JSON.stringify(namespace)}])`;

  return template
    .replace(
      /\.ant-border-beam(?![-\w])|--ant-border-beam-|"ant-border-beam"|" ant-border-beam"/g,
      match => {
        if (match === '.ant-border-beam') return `.${prefix}${scope}`;
        if (match === '--ant-border-beam-') return `--${namespace}-border-beam-`;
        return match === '"ant-border-beam"' ? `"${prefix}"` : `" ${prefix}"`;
      }
    )
    .replace(/<\/style/gi, '<\\/style');
}
