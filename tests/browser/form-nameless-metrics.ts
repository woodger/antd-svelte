export function formNamelessMetrics() {
  const root = document.querySelector('[data-nameless-case]')!;
  const input = root.querySelector('input')!;
  const label = root.querySelector('.ant-form-item-label > label')!;
  const state = JSON.parse(document.querySelector('output[aria-label="Nameless snapshot"]')!.textContent!);

  return {
    label: { for: label.getAttribute('for'), required: label.classList.contains('ant-form-item-required') },
    input: {
      id: input.getAttribute('id'), name: input.getAttribute('name'), value: input.value,
      required: input.required, ariaRequired: input.getAttribute('aria-required'),
      describedBy: input.getAttribute('aria-describedby'), disabled: input.disabled,
      small: input.classList.contains('ant-input-sm'), filled: input.classList.contains('ant-input-filled')
    },
    values: state.values, instance: state.instance, store: state.store
  };
}
