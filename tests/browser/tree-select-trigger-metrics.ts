export function readTreeSelectTrigger() {
  const container = document.querySelector('[data-trigger-control]')!;
  const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!;
  const root = container.querySelector('.ant-select')!;
  const open = input.getAttribute('aria-expanded') === 'true';
  const native = input.hasAttribute('data-ant-tree-choice-input');
  const selected = native ? input.value : container.querySelector('.ant-select-content')?.textContent ?? '';
  return {
    open, focused: input === document.activeElement,
    focusClass: root.classList.contains('ant-select-focused'), disabled: input.disabled,
    selected: open || container.hasAttribute('data-trigger-multiple') ? null : selected,
    tags: [...container.querySelectorAll('.ant-select-selection-item-content')].map(node => node.textContent),
    maxLength: input.getAttribute('maxlength'), tabIndex: input.getAttribute('tabindex'),
    events: JSON.parse(document.querySelector('[data-trigger-events]')!.textContent!)
  };
}
