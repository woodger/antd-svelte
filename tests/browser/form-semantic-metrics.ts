export function formSemanticMetrics() {
  const host = document.querySelector('[data-semantic-case]')!;
  const field = host.querySelector('[data-semantic-field]')!;
  const item = field.querySelector('.ant-form-item')!;
  const row = item.querySelector(':scope > .ant-form-item-row')!;
  const control = row.querySelector(':scope > .ant-form-item-control')!;
  const help = control.querySelector(
    ':scope > .ant-form-item-explain, :scope > .ant-form-item-extra[id$="-help"]'
  );
  const list = host.querySelector('[data-semantic-list] [data-ant-form-error-list]');

  function metric(node: Element | null) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return {
      classes: [...node.classList].filter((key) => key.startsWith('owner-')),
      css: Object.fromEntries(['color', 'padding-left', 'background-color']
        .map((key) => [key, style.getPropertyValue(key)]))
    };
  }

  return {
    root: metric(host.querySelector('form')),
    label: metric(row.querySelector(':scope > .ant-form-item-label > label')),
    content: metric(control.querySelector(
      ':scope > .ant-form-item-control-input > .ant-form-item-control-input-content'
    )),
    help: metric(help), helpItems: help ? [...help.children].map(metric) : [],
    extra: metric(control.querySelector(':scope > .ant-form-item-extra[id$="_extra"]')),
    list: metric(list), listItems: list ? [...list.children].map(metric) : [],
    innerLabels: [...field.querySelectorAll(
      '.ant-form-item .ant-form-item .ant-form-item-label > label'
    )].map(metric)
  };
}
