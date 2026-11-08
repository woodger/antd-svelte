export function formRichLabelsMetrics() {
  const item = document.querySelector('[data-rich-label-case] .ant-form-item')!;
  const label = item.querySelector<HTMLLabelElement>('.ant-form-item-label > label');
  const input = item.querySelector('input')!;
  const custom = label?.querySelector('[data-label-kind]');
  const style = label ? getComputedStyle(label) : null;

  return {
    label: label ? {
      text: label.textContent, title: label.getAttribute('title'),
      noColon: label.classList.contains('ant-form-item-no-colon'),
      required: label.classList.contains('ant-form-item-required'),
      optional: label.classList.contains('ant-form-item-required-mark-optional'),
      kind: custom?.getAttribute('data-label-kind') || null,
      rendererRequired: custom?.getAttribute('data-label-required') || null,
      strong: label.querySelector('strong')?.textContent || null,
      em: label.querySelector('em')?.textContent || null,
      css: { height: style!.height, fontSize: style!.fontSize, color: style!.color },
      counter: label.querySelector('[data-label-counter]')?.textContent || null
    } : null,
    input: { value: input.value, associated: input.labels?.length || 0 }
  };
}
