export function readTreeSelectPointer() {
  const host = document.querySelector<HTMLElement>('[data-pointer-control]')!;
  const root = host.querySelector<HTMLElement>('.ant-select')!;
  const input = root.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const open = input.getAttribute('aria-expanded') === 'true';
  return {
    open, focused: input === document.activeElement,
    focusClass: root.classList.contains('ant-select-focused'),
    disabled: input.disabled, readonly: input.readOnly,
    draftFocused: host.querySelector('[aria-label="Pointer draft"]')
      ? host.querySelector('[aria-label="Pointer draft"]') === document.activeElement : null,
    query: open && !input.readOnly ? input.value : null,
    caret: open && !input.readOnly && input.value ? [input.selectionStart, input.selectionEnd] : null,
    events: JSON.parse(document.querySelector('[data-pointer-events]')!.textContent!)
  };
}
