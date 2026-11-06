export function snapshotFloatButtonTheme() {
  function properties(node: Element, names: readonly string[]) {
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }

  function button(node: Element) {
    const icon = node.querySelector('.anticon');
    const content = [...node.querySelectorAll('.ant-float-btn-content')].find(element =>
      [...element.childNodes].some(child => child.nodeType === Node.TEXT_NODE
        && Boolean(child.textContent?.trim())));
    return {
      style: properties(node, [
        'position', 'width', 'min-height', 'height', 'padding-top', 'padding-bottom',
        'gap', 'bottom', 'inset-inline-end', 'z-index', 'color', 'background-color',
        'font-family', 'font-size', 'line-height', 'border-width', 'border-radius',
        'box-shadow', 'direction', '--ant-float-btn-size'
      ]),
      icon: icon ? properties(icon, ['font-size', 'color', 'line-height']) : null,
      content: content ? properties(content, ['font-size', 'color', 'line-height']) : null
    };
  }

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-float-theme]')].map(host => {
      const group = host.querySelector('.ant-float-btn-group');
      const list = group?.querySelector('.ant-float-btn-group-list');
      return [host.dataset.floatTheme!, {
        group: group ? properties(group, [
          'position', 'gap', 'bottom', 'inset-inline-end', 'z-index',
          'font-family', 'font-size', 'line-height', 'color', 'direction'
        ]) : null,
        list: list ? properties(list, [
          'position', 'gap', 'top', 'right', 'bottom', 'left', 'border-radius',
          'box-shadow', '--ant-float-btn-list-trigger-offset'
        ]) : null,
        buttons: [...host.querySelectorAll('.ant-float-btn')].map(button)
      }];
    })
  );
}
