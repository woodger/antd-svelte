export function readTreeSelectRoot() {
  const host = document.querySelector<HTMLElement>('[data-tree-select-root-host]')!;
  const field = host.querySelector<HTMLElement>('[data-root-probe]');
  const root = field?.closest<HTMLElement>('.root-own') ?? field;
  const popup = document.querySelector<HTMLElement>('.ant-select-dropdown');
  const attrs = (element: Element | null | undefined) => element ? Object.fromEntries([
    'id', 'title', 'role', 'type', 'name', 'tabindex', 'placeholder', 'aria-label',
    'aria-expanded', 'aria-controls', 'data-root-probe', 'data-collision', 'data-own'
  ].map(key => [key, element.getAttribute(key)])) : null;
  return {
    rootTag: root?.tagName ?? null, fieldTag: field?.tagName ?? null,
    open: Boolean(popup && getComputedStyle(popup).display !== 'none'
      && getComputedStyle(popup).visibility !== 'hidden'),
    focused: field === document.activeElement,
    generatedRootClass: Boolean(root?.classList.contains('ant-select')),
    rootOwnClass: Boolean(root?.classList.contains('root-own')),
    rootStyle: root ? { width: root.style.width, color: root.style.color } : null,
    rootAttrs: attrs(root), fieldAttrs: attrs(field),
    disabled: field instanceof HTMLInputElement || field instanceof HTMLButtonElement ? field.disabled : null,
    readonly: field instanceof HTMLInputElement ? field.readOnly : null,
    value: field instanceof HTMLInputElement ? field.value : null,
    child: host.querySelector('[data-root-child]') ? {
      focused: host.querySelector('[data-root-child]') === document.activeElement,
      value: host.querySelector<HTMLInputElement>('[data-root-child]')!.value
    } : null,
    generatedEditorCount: host.querySelectorAll('input[role="combobox"]').length,
    generatedContentCount: host.querySelectorAll('.ant-select-content').length,
    clearCount: host.querySelectorAll('.ant-select-clear').length,
    inertInputCount: host.querySelectorAll('[data-root-inert-input]').length,
    prefixCount: host.querySelectorAll('[data-root-generated-prefix]').length,
    suffixCount: host.querySelectorAll('[data-root-generated-suffix]').length,
    refs: JSON.parse(document.querySelector('[data-root-refs]')!.textContent!),
    events: JSON.parse(document.querySelector('[data-root-events]')!.textContent!)
  };
}
