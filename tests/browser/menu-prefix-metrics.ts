export function snapshotMenuPrefix() {
  const host = document.querySelector('[data-menu-prefix-scope]')!;
  const root = host.querySelector<HTMLElement>('.fixture-menu-prefix')!;
  const prefix = [...root.classList].find(value => value.endsWith('-root'))!.slice(0, -5);
  const popup = [...document.querySelectorAll<HTMLElement>(`[class~="${prefix}-submenu-popup"]`)]
    .find(node => node.getClientRects().length && getComputedStyle(node).display !== 'none') ?? null;
  function css(node: Element | null, keys: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  }
  const font = ['font-family', 'font-size', 'line-height', 'color'];
  const box = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background-color', 'border-radius'];
  const part = (host: Element, suffix: string) => host.querySelector(`[class~="${prefix}${suffix}"]`);
  const row = (node: Element | null) => css(node, [...font, ...box, 'height', 'margin', 'cursor']);
  const nested = root.querySelector<HTMLElement>(`:scope > .sample-parent > [class~="${prefix}-sub"]`);

  return {
    root: css(root, [...font, ...box, 'width', 'border-inline-end-width', 'border-bottom-width', 'direction']),
    selected: row(root.querySelector(':scope > .sample-selected')),
    normal: row(root.querySelector(':scope > .sample-normal')),
    disabled: row(root.querySelector(':scope > .sample-disabled')),
    danger: row(root.querySelector(':scope > .sample-danger')),
    title: row(part(root.querySelector(':scope > .sample-parent')!, '-submenu-title')),
    icon: css(part(root.querySelector(':scope > .sample-normal')!, '-item-icon'),
      ['font-size', 'margin-inline-end', 'min-width']),
    nested: nested ? {
      root: css(nested, [...font, ...box]),
      leaf: row(nested.querySelector('.sample-leaf')),
      group: css(part(nested, '-item-group-title'), [...font, ...box]),
      divider: css(part(nested, '-item-divider'), ['height', 'margin', 'border-color', 'border-style'])
    } : null,
    popup: popup ? {
      root: css(popup, [...font, 'background-color', 'border-radius', 'z-index']),
      list: css(popup.querySelector('[role="menu"]'), [...font, ...box]),
      leaf: row(popup.querySelector('.sample-leaf')),
      group: css(part(popup, '-item-group-title'), [...font, ...box]),
      divider: css(part(popup, '-item-divider'), ['height', 'margin', 'border-color', 'border-style'])
    } : null
  };
}
