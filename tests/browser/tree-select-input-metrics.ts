export function readTreeSelectInput() {
  const host = document.querySelector('[data-tree-select-input-case]')!;
  const root = host.querySelector<HTMLElement>('.ant-select')!;
  const field = host.querySelector<HTMLInputElement | HTMLTextAreaElement>('input,textarea')!;
  const content = host.querySelector<HTMLElement>('.ant-select-content');
  const label = content?.cloneNode(true) as HTMLElement | undefined;
  label?.querySelectorAll('input,textarea,[data-input-wrapper],.ant-input-affix-wrapper,.ant-select-selection-item-remove,.ant-select-placeholder')
    .forEach(node => node.remove());
  const attrs = Object.fromEntries([
    'id', 'type', 'role', 'name', 'title', 'tabindex', 'placeholder', 'autocomplete', 'maxlength',
    'aria-label', 'aria-expanded', 'aria-controls', 'aria-owns', 'aria-activedescendant',
    'aria-autocomplete', 'aria-haspopup', 'aria-required'
  ].map(key => [key, field.getAttribute(key)]));
  return {
    fieldTag: field.tagName, attrs, value: field.value, readonly: field.readOnly, disabled: field.disabled,
    open: root.classList.contains('ant-select-open'), focused: document.activeElement === field,
    classes: ['ant-select-input', 'semantic-input', 'own-input', 'own-input-after']
      .filter(className => field.classList.contains(className)),
    style: { color: field.style.color, backgroundColor: field.style.backgroundColor },
    label: label?.textContent?.trim() ?? '', hasValue: Boolean(content?.classList.contains('ant-select-content-has-value')),
    hasSearchValue: Boolean(content?.classList.contains('ant-select-content-has-search-value')),
    inputCount: host.querySelectorAll('input,textarea').length,
    events: JSON.parse(host.querySelector('[data-input-events]')!.textContent!),
    selected: JSON.parse(host.querySelector('[data-input-selected]')!.textContent!),
    controlled: JSON.parse(host.querySelector('[data-input-controlled]')!.textContent!)
  };
}
