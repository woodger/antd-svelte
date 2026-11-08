export function formStatusMetrics() {
  function capture(kind: string) {
    const item = document.querySelector(`.capture-${kind}`)!;
    const input = item.querySelector('input')!;
    const control = kind === 'input' ? input : item.querySelector('.ant-select')!;
    const css = getComputedStyle(control);

    return {
      root: ['has-error', 'has-warning', 'has-success', 'is-validating'].filter(status =>
        item.classList.contains(`ant-form-item-${status}`)),
      control: ['error', 'warning', 'success', 'validating'].filter(status =>
        control.classList.contains(`ant-${kind}-status-${status}`)),
      ariaInvalid: input.getAttribute('aria-invalid'),
      color: css.borderTopColor,
      messages: [...item.querySelectorAll(
        '.ant-form-item-explain-error,.ant-form-item-explain-warning'
      )].map(node => node.textContent)
    };
  }

  return { input: capture('input'), select: capture('select') };
}
