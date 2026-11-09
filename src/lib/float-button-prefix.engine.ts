import template from './vendor/float-button-prefix.css.js';

const rootStates = new Set([
  '-rtl', '-individual', '-pure', '-progress', '-icon-only', '-square', '-circle',
  '-group', '-group-rtl', '-group-individual', '-group-menu-mode', '-group-top',
  '-group-bottom', '-group-left', '-group-right'
]);

/** Служебные переменные и Button selectors используют общий prefix, parts — local. */
export function getFloatButtonPrefixCss(prefix: string, rootPrefix = 'ant') {
  if (prefix === 'ant-float-btn' && rootPrefix === 'ant') return undefined;

  const scope = `:where([data-ant-float-prefix=${JSON.stringify(prefix)}][data-ant-float-global=${JSON.stringify(rootPrefix)}])`;
  const namespace = rootPrefix.replace(/\./g, '');

  // Повышаем приоритет геометрии над Button, сохраняя margin ниже Compact edge selectors.
  const stylesheet = template.replace(
    /^(\.ant-float-btn:where\(\.ant-float-btn-css-var\))\{([^}]+)\}/gm,
    (rule, selector: string, declarations: string) =>
      `${rule}\n${selector}[data-ant-float-root]{${declarations.replace('margin:0;', '')}}`
  );

  return stylesheet.replace(
    /\.ant-float-btn([-\w]*)|\.ant-btn([-\w]*)|--ant-(float-btn|btn)-|"ant-float-btn"|" ant-float-btn"/g,
    (match, suffix: string | undefined, button: string | undefined, variable: string | undefined) => {
      if (suffix !== undefined) {
        if (suffix === '-css-var') {
          return `.ant-float-btn-css-var:is([data-ant-float-root],[data-ant-float-group])${scope}`;
        }
        if (suffix === '') return `.${prefix}${scope}`;
        return `.${prefix}${suffix}${rootStates.has(suffix) ? scope : ''}`;
      }
      if (button !== undefined) return `.${rootPrefix}-btn${button}`;
      if (variable) return `--${namespace}-${variable}-`;
      return match === '"ant-float-btn"' ? `"${prefix}"` : `" ${prefix}"`;
    }
  ).replace(/<\/style/gi, '<\\/style');
}
