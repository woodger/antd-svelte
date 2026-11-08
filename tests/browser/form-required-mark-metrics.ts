export function formRequiredMarkMetrics() {
  const form = document.querySelector('[data-required-mark-case] form')!;

  function properties(node: Element, names: string[], pseudo?: string) {
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(names.map((key) => [key, style.getPropertyValue(key)]));
  }

  return {
    hideClass: form.classList.contains('ant-form-hide-required-mark'),
    labels: [...form.querySelectorAll<HTMLLabelElement>('.ant-form-item-label > label')]
      .map((label) => {
        const optional = label.querySelector('.ant-form-item-optional');
        const custom = label.querySelector('[data-custom-mark]');

        return {
          text: label.textContent, title: label.title,
          required: label.classList.contains('ant-form-item-required'),
          hidden: label.classList.contains('ant-form-item-required-mark-hidden'),
          optionalClass: label.classList.contains('ant-form-item-required-mark-optional'),
          before: properties(label, ['content', 'display', 'color', 'margin-inline-end'], '::before'),
          optional: optional ? {
            text: optional.textContent, style: properties(optional, ['color', 'margin-inline-start'])
          } : null,
          custom: custom?.getAttribute('data-custom-mark') ?? null
        };
      })
  };
}
