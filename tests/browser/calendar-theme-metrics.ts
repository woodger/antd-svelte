export function snapshotCalendarTheme() {
  function css(node: Element | null, names: string[], pseudo?: string) {
    if (!node) return null;
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  function control(root: Element, name: string) {
    const outer = root.querySelector(`.ant-picker-calendar-${name}-select`);
    if (!outer) return null;
    const node = outer.matches('.ant-select') ? outer : outer.querySelector('.ant-select')!;
    return { width: outer.getBoundingClientRect().width,
      style: css(node, [...font, 'height', ...padding, 'border-top-width', 'border-top-color']) };
  }
  function cell(node: Element | null) {
    if (!node) return null;
    const inner = node.querySelector('.ant-picker-cell-inner');
    return {
      cell: css(node, ['color', ...padding]),
      inner: css(inner, [...font, 'height', 'background-color', 'border-radius',
        'border-top-width', 'border-top-color']),
      today: css(inner, ['border-color', 'border-width'], '::before'),
      value: css(node.querySelector('.ant-picker-calendar-date-value'), ['color', 'line-height']),
      content: css(node.querySelector('.ant-picker-calendar-date-content'), ['height', 'color'])
    };
  }
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-calendar-theme]')]
    .map(host => [host.dataset.calendarTheme!, Object.fromEntries(
      [...host.querySelectorAll<HTMLElement>('[data-calendar-panel]')].map(panel => {
        const root = panel.querySelector('.ant-picker-calendar')!;
        const mode = root.querySelector('.ant-radio-group')!;
        return [panel.dataset.calendarPanel!, {
          root: css(root, [...font, 'background-color', 'direction']),
          panel: css(root.querySelector('.ant-picker-panel'),
            ['height', 'background-color', 'border-top-width', 'border-top-color']),
          body: css(root.querySelector('.ant-picker-body'), ['height', ...padding]),
          table: css(root.querySelector('.ant-picker-content'), ['height', 'min-height']),
          header: css(root.querySelector('.ant-picker-calendar-header'), padding),
          year: control(root, 'year'),
          month: control(root, 'month'),
          mode: css(mode, ['font-size', 'height', 'margin-inline-start']),
          radio: css(mode.querySelector('.ant-radio-button-wrapper'),
            [...font, 'height', ...padding]),
          selected: cell(root.querySelector('.ant-picker-cell-selected')),
          disabled: cell(root.querySelector('.ant-picker-cell-disabled')),
          normal: cell(root.querySelector('.ant-picker-cell-in-view:not(.ant-picker-cell-selected):not(.ant-picker-cell-disabled):not(.ant-picker-cell-today)'))
        }];
      })
    )]));
}
