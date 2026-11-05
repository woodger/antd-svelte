export function snapshotLayoutTheme() {
  const property = (element: Element, names: string[]) => {
    const css = getComputedStyle(element);

    return Object.fromEntries(names.map(name => [name, css.getPropertyValue(name)]));
  };
  const box = ['background-color', 'color', 'font-size', 'height', 'padding', 'line-height'];
  const result: Record<string, unknown> = {};

  for (const host of document.querySelectorAll<HTMLElement>('[data-layout-theme]')) {
    const root = host.querySelector('.ant-layout')!;
    const sider = host.querySelector('.ant-layout-sider')!;
    const trigger = sider.querySelector('.ant-layout-sider-trigger, .ant-layout-sider-zero-width-trigger');
    result[host.dataset.layoutTheme!] = {
      root: property(root, ['background-color', 'flex-direction', 'direction', 'font-size']),
      header: property(host.querySelector('.ant-layout-header')!, box),
      content: property(host.querySelector('.ant-layout-content')!, ['color', 'min-height']),
      footer: property(host.querySelector('.ant-layout-footer')!, box),
      sider: property(sider, [
        'background-color', 'color', 'font-size', 'padding-bottom',
        'width', 'max-width', 'min-width', 'flex-basis'
      ]),
      trigger: trigger ? property(trigger, [
        ...box, 'width', 'top', 'bottom', 'inset-inline-start', 'inset-inline-end',
        'border-radius', 'border-top-width', 'border-top-color'
      ]) : null
    };
  }

  return result;
}
