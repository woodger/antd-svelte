export function formRootMetrics() {
  const host = document.querySelector('[data-root-case]')!;
  const item = host.querySelector('.ant-form-item')!;
  const input = item.querySelector('input')!;

  function metrics(node: Element | null) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return {
      classes: [...node.classList].filter((name) => name.startsWith('owner-')),
      css: Object.fromEntries([
        'color', 'outline-color', 'padding-top', 'margin-bottom', 'font-size'
      ].map((key) => [key, style.getPropertyValue(key)]))
    };
  }

  return {
    form: metrics(host.querySelector('form')), item: metrics(item),
    label: metrics(item.querySelector('.ant-form-item-label > label')),
    input: {
      value: input.value, filled: input.classList.contains('ant-input-filled'),
      outlined: input.classList.contains('ant-input-outlined')
    }
  };
}
