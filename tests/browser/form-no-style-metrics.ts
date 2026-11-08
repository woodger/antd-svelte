export function formNoStyleMetrics() {
  const input = document.querySelector<HTMLInputElement>('input[aria-label="first"]')!;
  const parent = document.querySelector('.capture-parent');
  const child = document.querySelector('.capture-child');

  function layout(node: Element | null) {
    if (!node) return null;

    return {
      errors: [...node.querySelectorAll('.ant-form-item-explain-error')]
        .filter(message => message.closest('.ant-form-item') === node).map(node => node.textContent),
      warnings: [...node.querySelectorAll('.ant-form-item-explain-warning')]
        .filter(message => message.closest('.ant-form-item') === node).map(node => node.textContent),
      classes: ['has-error', 'has-warning', 'has-success', 'is-validating', 'hidden']
        .filter(state => node.classList.contains(`ant-form-item-${state}`)),
      display: getComputedStyle(node).display,
      margin: getComputedStyle(node).marginBottom
    };
  }

  const describedBy = input.getAttribute('aria-describedby');

  return {
    roots: document.querySelectorAll('.ant-form-item').length,
    parent: layout(parent), child: layout(child),
    input: {
      value: input.value, invalid: input.getAttribute('aria-invalid'),
      required: input.getAttribute('aria-required') ?? (input.required ? 'true' : null),
      status: ['error', 'warning', 'success', 'validating'].find(status =>
        input.classList.contains(`ant-input-status-${status}`)) ?? null,
      descriptionPresent: Boolean(describedBy),
      descriptionConnected: Boolean(describedBy && document.getElementById(describedBy)),
      border: getComputedStyle(input).borderTopColor
    },
    labelIgnored: ![...document.querySelectorAll('label')]
      .some(node => node.textContent === 'Ignored label'),
    extraIgnored: ![...document.querySelectorAll('.ant-form-item-extra')]
      .some(node => node.textContent === 'Ignored extra'),
    contexts: Object.fromEntries([...document.querySelectorAll('[data-form-status-read]')]
      .map(node => [node.getAttribute('data-form-status-read'), JSON.parse(node.textContent!)]))
  };
}
