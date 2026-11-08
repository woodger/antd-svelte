export function formSlotContextMetrics() {
  const main = document.querySelector<HTMLInputElement>('input[aria-label="main control"]')!;
  const selector = document.querySelector('.ant-select')!;
  const state = document.querySelector('output[aria-label="Slot binding snapshot"]')!.textContent!;

  function helper(kind: string) {
    const node = document.querySelector<HTMLInputElement>(`input[aria-label="${kind} draft"]`)!;

    return {
      id: node.getAttribute('id'), name: node.getAttribute('name'), required: node.required,
      disabled: node.disabled, invalid: node.getAttribute('aria-invalid'),
      ariaRequired: node.getAttribute('aria-required'), describedBy: node.getAttribute('aria-describedby'),
      status: ['error', 'warning'].find((value) =>
        node.classList.contains(`ant-input-status-${value}`)) ?? null,
      size: node.classList.contains('ant-input-sm') ? 'small' : 'medium',
      filled: node.classList.contains('ant-input-filled'), value: node.value
    };
  }

  return {
    extra: helper('extra'), popup: helper('popup'),
    selector: {
      disabled: selector.classList.contains('ant-select-disabled'),
      sharesMainId: selector.querySelector('input')!.id === main.id,
      error: selector.classList.contains('ant-select-status-error')
    },
    ...JSON.parse(state)
  };
}
