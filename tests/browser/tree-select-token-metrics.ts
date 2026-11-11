export function readTreeSelectTokens() {
  const host = document.querySelector('[data-tree-select-token-case]')!;
  const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const open = input.getAttribute('aria-expanded') === 'true';
  return { open, search: input.value,
    events: JSON.parse(host.querySelector('[data-token-events]')!.textContent!),
    value: JSON.parse(host.querySelector('[data-token-values]')!.textContent!),
    controlled: JSON.parse(host.querySelector('[data-token-controlled]')!.textContent!),
    focused: document.activeElement === input };
}
