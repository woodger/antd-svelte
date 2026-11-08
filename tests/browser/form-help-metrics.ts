export function formHelpMetrics() {
  const root = document.querySelector('[data-help-case]')!;
  const node = root.querySelector('.ant-form-item-explain, .ant-form-item-extra');
  const input = root.querySelector('input[aria-label="main control"]')!;
  const ids = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  const helper = node?.querySelector('input');

  return {
    text: node?.textContent ?? '',
    described: ids.some((id) => document.getElementById(id) === node),
    hasDescription: Boolean(ids.length), invalid: input.getAttribute('aria-invalid'),
    rich: Boolean(node?.querySelector('[data-rich-help]')),
    helper: helper ? {
      name: helper.getAttribute('name'), id: helper.getAttribute('id'), required: helper.required,
      invalid: helper.getAttribute('aria-invalid')
    } : null
  };
}
