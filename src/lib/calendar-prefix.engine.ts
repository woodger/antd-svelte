import template from './vendor/calendar-prefix.css.js';

/** Calendar строит owner из picker prefix; variables и theme marker остаются canonical. */
export function getCalendarPrefixCss(prefix: string) {
  if (prefix === 'ant-picker') return undefined;

  const scope = `:where([data-ant-calendar-prefix=${JSON.stringify(prefix)}])`;
  const roots = new Set(['-calendar', '-calendar-full', '-calendar-mini', '-calendar-rtl']);

  return template.replace(/\.ant-picker([-\w]*)|"ant-picker"|" ant-picker"/g,
    (match, suffix: string | undefined) => {
      if (suffix === '-calendar-css-var') return `.ant-picker-calendar-css-var${scope}`;
      if (suffix !== undefined) return `.${prefix}${suffix}${roots.has(suffix) ? scope : ''}`;

      return match === '"ant-picker"' ? `"${prefix}"` : `" ${prefix}"`;
    }).replace(/<\/style/gi, '<\\/style');
}
