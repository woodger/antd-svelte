export function formLabelsMetrics() {
  const host = document.querySelector('[data-label-case]')!;
  const box = host.querySelector('.ant-form-item-label')!;
  const label = box.querySelector('label')!;

  function properties(node: Element, names: string[], pseudo?: string) {
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(names.map((key) => [key, style.getPropertyValue(key)]));
  }

  return {
    text: label.textContent, title: label.getAttribute('title'),
    noColon: label.classList.contains('ant-form-item-no-colon'),
    left: box.classList.contains('ant-form-item-label-left'),
    wrap: box.classList.contains('ant-form-item-label-wrap'),
    box: properties(box, ['text-align', 'white-space', 'overflow', 'line-height', 'padding-bottom']),
    label: properties(label, ['height', 'vertical-align', 'text-wrap']),
    after: properties(label, ['content', 'visibility', 'margin-inline-start', 'margin-inline-end'], '::after')
  };
}
