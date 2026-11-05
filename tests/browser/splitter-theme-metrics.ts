export function snapshotSplitterTheme() {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-splitter-theme]')].map(host => {
      const root = host.querySelector<HTMLElement>('.ant-splitter')!;
      const dragger = root.querySelector<HTMLElement>('.ant-splitter-bar-dragger')!;
      const preview = root.querySelector('.ant-splitter-bar-preview');
      const icon = root.querySelector('.ant-splitter-bar-dragger-icon');
      const style = (node: Element, properties: string[], pseudo?: string) => {
        const computed = getComputedStyle(node, pseudo);
        return Object.fromEntries(properties.map(property => [
          property, computed.getPropertyValue(property)
        ]));
      };
      const surface = ['width', 'height', 'background-color', 'display'];

      return [host.dataset.splitterTheme!, {
        root: style(root, [
          'width', 'height', 'display', 'flex-direction', 'direction',
          'font-size', 'line-height', 'color', 'background-color'
        ]),
        panels: [...root.querySelectorAll(':scope > .ant-splitter-panel')].map(panel => ({
          width: panel.getBoundingClientRect().width,
          height: panel.getBoundingClientRect().height,
          style: style(panel, ['flex-basis', 'flex-grow', 'overflow', 'color', 'background-color'])
        })),
        dragger: style(dragger, ['width', 'height', 'cursor', 'transform', 'background-color']),
        before: style(dragger, surface, '::before'),
        after: style(dragger, surface, '::after'),
        collapse: [...root.querySelectorAll('.ant-splitter-bar-collapse-bar')].map(button =>
          style(button, [
            'width', 'height', 'left', 'right', 'background-color', 'color',
            'border-radius', 'font-size', 'display', 'opacity'
          ])),
        preview: preview ? style(preview, [...surface, 'opacity', 'pointer-events']) : null,
        icon: icon ? style(icon, ['color', 'display', 'position']) : null
      }] satisfies [string, unknown];
    })
  );
}

export function snapshotSplitterThemeInteraction() {
  const dragger = document.querySelector('[data-splitter-theme="normal"] .ant-splitter-bar-dragger')!;
  const before = getComputedStyle(dragger, '::before');
  const after = getComputedStyle(dragger, '::after');

  return {
    active: dragger.classList.contains('ant-splitter-bar-dragger-active'),
    background: before.backgroundColor,
    spinner: after.backgroundColor,
    cursor: getComputedStyle(dragger).cursor
  };
}
