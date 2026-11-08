export function formLayoutMetrics() {
  const form = document.querySelector<HTMLElement>('[data-layout-root] form')!;
  const origin = form.getBoundingClientRect();

  function properties(node: Element, names: string[], pseudo?: string) {
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
  }

  function bounds(node: Element) {
    const rect = node.getBoundingClientRect();
    return Object.fromEntries(Object.entries({
      left: rect.left - origin.left, top: rect.top - origin.top,
      width: rect.width, height: rect.height
    }).map(([key, value]) => [key, Math.round(value * 1000) / 1000]));
  }

  return {
    form: {
      style: properties(form, ['display', 'flex-wrap', 'font-size', 'line-height', 'direction']),
      bounds: bounds(form)
    },
    items: [...form.querySelectorAll('.ant-form-item')].map((item) => {
      const labelBox = item.querySelector('.ant-form-item-label')!;
      const label = labelBox.querySelector('label')!;
      const input = item.querySelector('input')!;
      const row = item.querySelector('.ant-form-item-row')!;

      return {
        style: properties(item, [
          'flex-grow', 'flex-shrink', 'flex-basis', 'margin-bottom', 'margin-inline-end'
        ]),
        bounds: bounds(item), row: properties(row, ['display', 'flex-wrap', 'gap']),
        label: {
          style: properties(labelBox, ['padding-top', 'padding-bottom', 'text-align']),
          bounds: bounds(labelBox),
          colon: properties(label, ['visibility', 'margin-inline-start', 'margin-inline-end'], '::after')
        },
        input: { style: properties(input, ['height', 'font-size']), bounds: bounds(input) }
      };
    })
  };
}
