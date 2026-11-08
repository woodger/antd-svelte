export function formSizeMetrics() {
  const host = document.querySelector('[data-size-case]')!;
  const item = host.querySelector('.ant-form-item')!;
  const label = item.querySelector('label')!;
  const form = host.querySelector('form');
  const find = (key: string, selector: string) =>
    host.querySelector(`[data-size-control="${key}"] ${selector}`)!;

  function height(node: Element) {
    return Math.round(node.getBoundingClientRect().height * 100) / 100;
  }

  function field(node: Element) {
    return { height: height(node), fontSize: getComputedStyle(node).fontSize };
  }

  const divider = getComputedStyle(find('divider', '.ant-divider'));

  return {
    form: form ? [...form.classList].filter((name) =>
      ['ant-form-small', 'ant-form-large'].includes(name) || name.startsWith('owner-')) : null,
    label: {
      height: height(label), classes: [...label.classList].filter((name) => name.startsWith('owner-'))
    },
    controlMinHeight: getComputedStyle(item.querySelector('.ant-form-item-control-input')!).minHeight,
    input: field(item.querySelector('input')!), number: field(find('number', '.ant-input-number')),
    select: field(find('select', '.ant-select')), picker: field(find('picker', '.ant-picker')),
    button: field(find('button', '.ant-btn')), switch: field(find('switch', '.ant-switch')),
    compact: { input: field(find('compact', 'input')), button: field(find('compact', '.ant-btn')) },
    divider: { start: divider.marginBlockStart, end: divider.marginBlockEnd },
    nested: field(host.querySelector('[data-size-nested] input')!),
    sibling: field(host.querySelector('[data-size-sibling] input')!)
  };
}
