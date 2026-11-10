export function readTreeSelectSurface() {
  const host = document.querySelector<HTMLElement>('[data-tree-select-surface]')!;
  const prefix = host.dataset.surfacePrefix!;
  const control = host.querySelector(`[class~="${prefix}"]`)!;
  const part = (name: string) => control.querySelector(`:scope > [class~="${prefix}-${name}"]`);
  const editor = control.querySelector('input[role="combobox"]')!;
  const popup = host.querySelector<HTMLElement>(`[class~="${prefix}-dropdown"]`);
  const draft = popup?.querySelector<HTMLInputElement>('[data-surface-draft]');
  const text = (node: Element) => node.textContent?.replace(/\u00a0/g, ' ') ?? '';
  const icons = (node: Element) => Array.from(node.querySelectorAll('svg'), svg => {
    const icon = svg.getAttribute('data-icon');
    if (icon) return icon;
    if (svg.hasAttribute('fill-rule')) return 'close-circle';
    if (svg.querySelector('circle')) return 'search';
    if (svg.classList.contains('loading')) return 'loading';
    return svg.querySelector('path')?.getAttribute('d') === 'm6 9 6 6 6-6' ? 'down' : 'close';
  });
  const affix = (node: Element | null) => node && ({ text: text(node), icons: icons(node),
    rich: Array.from(node.querySelectorAll('[data-surface-rich]'), text) });
  const clear = part('clear');
  const info = part('suffix')?.querySelector('[data-surface-suffix-info]');
  return {
    open: editor.getAttribute('aria-expanded') === 'true',
    editorFocused: editor === document.activeElement,
    showArrow: control.classList.contains(`${prefix}-show-arrow`),
    loading: control.classList.contains(`${prefix}-loading`),
    allowClear: control.classList.contains(`${prefix}-allow-clear`),
    order: Array.from(control.children).flatMap(node =>
      ['prefix', 'content', 'suffix', 'clear'].filter(name => node.classList.contains(`${prefix}-${name}`))),
    prefix: affix(part('prefix')),
    suffix: affix(part('suffix')),
    suffixLoading: part('suffix')?.classList.contains(`${prefix}-suffix-loading`) ?? false,
    info: info ? JSON.parse(info.getAttribute('data-surface-suffix-info')!) : null,
    clear: clear && { ...affix(clear), label: clear.getAttribute('aria-label'), tag: clear.tagName },
    remove: Array.from(control.querySelectorAll(`[class~="${prefix}-selection-item-remove"]`), affix),
    tag: control.querySelector('[data-surface-tag]')?.textContent ?? null,
    popup: popup && {
      visible: !popup.hidden && popup.getClientRects().length > 0,
      container: popup.parentElement?.hasAttribute('data-surface-target') ?? false,
      custom: Boolean(popup.querySelector('[data-surface-popup]')),
      tree: Boolean(popup.querySelector('[role="tree"]')),
      empty: popup.textContent?.includes('No nodes') ?? false,
      draft: draft?.value ?? null,
      draftFocused: draft === document.activeElement,
      fieldStatus: draft?.classList.contains('ant-input-status-error') ?? false,
      compact: draft?.classList.contains('ant-input-compact-item') ?? false
    },
    events: JSON.parse(host.querySelector('[data-surface-events]')!.textContent!),
    lifecycle: JSON.parse(host.querySelector('[data-surface-lifecycle]')!.textContent!)
  };
}
