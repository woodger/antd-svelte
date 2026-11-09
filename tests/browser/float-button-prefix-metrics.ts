export function snapshotFloatButtonPrefix() {
  const style = (node: Element, properties: string[]) => {
    const computed = getComputedStyle(node);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };
  const button = (node: Element) => ({
    root: style(node, ['width', 'height', 'min-height', 'position', 'padding-top', 'padding-bottom',
      'padding-inline-start', 'padding-inline-end', 'flex-direction', 'gap', 'direction',
      'color', 'background-color', 'border-top-width', 'border-top-color', 'border-radius',
      'background-image', 'background-origin', 'background-clip']),
    icon: node.querySelector('.fixture-float-icon')
      ? style(node.querySelector('.fixture-float-icon')!, ['line-height', 'color']) : null,
    content: node.querySelector('.fixture-float-content')
      ? style(node.querySelector('.fixture-float-content')!, ['font-size', 'line-height']) : null,
    badge: node.querySelector('.fixture-float-badge')
      ? style(node.querySelector('.fixture-float-badge')!, ['position', 'top', 'inset-inline-end',
        'transform', 'margin-top', 'margin-inline-end']) : null
  });

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-float-prefix-scope]')].map(host => {
      const group = host.querySelector('.fixture-float-group')!;
      const list = group.querySelector('.fixture-float-list');

      return [host.dataset.floatPrefixScope!, {
        standalone: button(host.querySelector('.fixture-float-single')!),
        backTop: button(host.querySelector('.fixture-float-back')!),
        group: style(group, ['position', 'gap', 'direction', 'font-size']),
        list: list ? style(list, ['position', 'gap', 'flex-direction', 'top', 'right', 'bottom',
          'left', 'border-radius']) : null,
        items: [...group.querySelectorAll('.fixture-float-item')].map(button),
        trigger: group.querySelector('.fixture-float-trigger')
          ? button(group.querySelector('.fixture-float-trigger')!) : null
      }];
    })
  );
}
