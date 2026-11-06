export function snapshotFormTheme() {
  function properties(node: Element, names: readonly string[], pseudo?: string) {
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-form-theme]')].map(host => {
      const form = host.querySelector('form');
      const item = host.querySelector('.ant-form-item')!;
      const labelBox = item.querySelector('.ant-form-item-label')!;
      const label = labelBox.querySelector('label')!;
      const control = item.querySelector('.ant-form-item-control-input')!;
      const input = item.querySelector('input')!;
      const extra = item.querySelector('.ant-form-item-extra')!;
      return [host.dataset.formTheme!, {
        form: form ? properties(form, [
          'font-size', 'line-height', 'font-family', 'color', 'margin-bottom', 'direction'
        ]) : null,
        item: properties(item, ['margin-bottom', 'font-size', 'line-height', 'color', 'direction']),
        labelBox: properties(labelBox, [
          'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
          'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'text-align'
        ]),
        label: properties(label, ['height', 'font-size', 'color']),
        required: properties(label, ['color', 'font-size', 'margin-inline-end'], '::before'),
        colon: properties(label, [
          'margin-inline-start', 'margin-inline-end', 'visibility'
        ], '::after'),
        control: properties(control, ['min-height']),
        input: properties(input, ['height', 'font-size', 'color']),
        extra: properties(extra, ['font-size', 'line-height', 'color'])
      }];
    })
  );
}
