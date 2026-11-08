import template from './vendor/layout-prefix.css.js';

type LayoutPrefixPart = 'layout' | 'sider';

const states = {
  layout: new Set(['', '-has-sider', '-rtl']),
  sider: new Set(['', '-has-trigger', '-right', '-zero-width', '-light', '-dark',
    '-collapsed', '-below', '-compact'])
};

/** Generated flat rules сохраняют общий namespace Layout и независимый prefix Sider. */
export function getLayoutPrefixCss(prefix: string, part: LayoutPrefixPart) {
  const original = part === 'sider' ? 'ant-layout-sider' : 'ant-layout';
  if (prefix === original) return undefined;

  const marker = `[data-ant-layout-prefix="${part}"]`;
  const selector = new RegExp(`\\.${original}([-\\w]*)`, 'g');

  return template.split('\n').filter(rule => part === 'sider'
    ? rule.startsWith('.ant-layout-sider')
    : rule.startsWith('.ant-layout') && !rule.startsWith('.ant-layout-sider'))
    .map(rule => {
      const declarations = rule.slice(rule.indexOf('{'));
      if (declarations.startsWith('{--ant-layout-')) {
        return `:where(.ant-layout-css-var${marker})${declarations}`;
      }

      return rule.replace(selector, (_, suffix: string) =>
        part === 'layout' && suffix === '-css-var' ? '.ant-layout-css-var'
          : `.${prefix}${suffix}${states[part].has(suffix) ? `:where(${marker})` : ''}`)
        .replaceAll(`"${original}"`, () => `"${prefix}"`)
        .replaceAll(`" ${original}"`, () => `" ${prefix}"`);
    }).join('\n').replace(/<\/style/gi, '<\\/style');
}

/** Секции сохраняют свою роль; variables внутри Layout наследуются от его корня. */
export function getLayoutSectionPrefixCss(
  prefix: string,
  part: 'header' | 'content' | 'footer',
  standalone: boolean
) {
  const original = `ant-layout-${part}`;
  const custom = prefix !== original;
  if (!custom && !standalone) return undefined;

  const marker = `[data-ant-layout-prefix="${part}"]`;
  const rules: string[] = [];
  for (const rule of template.split('\n')) {
    const boundary = rule.indexOf('{');
    if (boundary < 0) continue;
    const declarations = rule.slice(boundary);

    if (standalone && rule.startsWith('.ant-layout:')
      && declarations.startsWith('{--ant-layout-')) {
      rules.push(`:where(.ant-layout-css-var${marker}[data-ant-layout-standalone])${declarations}`);
    }
    if (!custom) continue;
    const selectors = rule.slice(0, boundary).split(',')
      .filter(selector => selector.includes(`.${original}:`));
    if (!selectors.length) continue;
    rules.push(selectors.join(',').replaceAll(`.${original}`, () => `.${prefix}:where(${marker})`)
      + declarations);
  }
  rules.push(`.${prefix}:where(${marker}){display:block;box-sizing:border-box;}`);

  return rules.join('\n').replace(/<\/style/gi, '<\\/style');
}
