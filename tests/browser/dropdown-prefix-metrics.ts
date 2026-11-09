export function snapshotDropdownPrefix() {
  const host = document.querySelector('[data-dropdown-prefix-scope]')!;
  const popup = document.querySelector<HTMLElement>('.fixture-dropdown-prefix-popup,[data-ant-dropdown-popup]')!;
  const menu = popup.querySelector<HTMLElement>('[role="menu"]')!;
  const prefix = [...menu.classList].find(value => value.endsWith('-menu'))!;
  const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')];
  function css(node: Element | null, keys: string[], pseudo?: string) {
    if (!node) return null;
    const style = getComputedStyle(node, pseudo);

    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  }
  const font = ['font-family', 'font-size', 'line-height', 'color'];
  const box = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background-color', 'border-radius'];
  const arrow = popup.querySelector(`[class~="${prefix.slice(0, -5)}-arrow"]`);
  const part = (suffix: string) => menu.querySelector(`[class~="${prefix}${suffix}"]`);

  return {
    trigger: css(host.querySelector('[data-prefix-trigger]'), [...font, 'height', ...box]),
    popup: css(popup, ['z-index', 'font-family', 'font-size', 'line-height', 'color', 'direction']),
    menu: css(menu, [...font, ...box, 'box-shadow', 'max-height', 'direction']),
    items: items.map(node => css(node, [...font, ...box, 'height', 'cursor'])),
    title: css(part('-title-content'), ['flex', 'min-width']),
    icon: css(part('-item-icon'), ['font-size', 'margin-inline-end', 'min-width']),
    divider: css(part('-item-divider'), ['height', 'margin', 'background-color']),
    arrow: arrow ? {
      root: css(arrow, ['width', 'height', 'top', 'bottom', 'inset-inline-start', 'inset-inline-end', 'transform']),
      before: css(arrow, ['width', 'height', 'background-color', 'clip-path'], '::before'),
      after: css(arrow, ['width', 'height', 'background-color', 'box-shadow', 'transform'], '::after')
    } : null
  };
}
