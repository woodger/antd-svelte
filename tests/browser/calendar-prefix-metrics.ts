export function snapshotCalendarPrefix() {
  const host = document.querySelector<HTMLElement>('[data-calendar-prefix-host]')!;
  const prefix = host.dataset.pickerPrefix!;
  const shared = host.dataset.rootPrefix!;
  const calendar = `${prefix}-calendar`;
  const root = host.querySelector('.fixture-calendar-prefix')!;
  const css = (node: Element | null | undefined, names: string[], pseudo?: string) => {
    if (!node) return null;
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  };
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  const control = (name: string) => {
    const outer = root.querySelector(`.${calendar}-${name}-select`);
    if (!outer) return null;
    const node = outer.matches(`.${shared}-select`) ? outer
      : outer.querySelector(`.${shared}-select`);
    return {
      width: outer.getBoundingClientRect().width,
      style: css(node, [...font, 'height', ...padding, 'border-top-width', 'border-top-color'])
    };
  };
  const cell = (node: Element | null) => {
    if (!node) return null;
    const inner = node.querySelector(`.${prefix}-cell-inner`);
    return {
      cell: css(node, ['color', ...padding]),
      inner: css(inner, [...font, 'height', 'background-color', 'border-radius',
        'border-top-width', 'border-top-color']),
      today: css(inner, ['border-color', 'border-width'], '::before'),
      value: css(node.querySelector(`.${calendar}-date-value`), ['color', 'line-height']),
      content: css(node.querySelector(`.${calendar}-date-content`), ['height', 'color'])
    };
  };
  const mode = root.querySelector(`.${shared}-radio-group`);

  return {
    root: css(root, [...font, 'background-color', 'direction', 'width']),
    panel: css(root.querySelector(`.${prefix}-panel`),
      ['height', 'background-color', 'border-top-width', 'border-top-color']),
    body: css(root.querySelector(`.${prefix}-body`), ['height', ...padding]),
    table: css(root.querySelector(`.${prefix}-content`), ['height', 'min-height']),
    header: css(root.querySelector(`.${calendar}-header`), padding),
    year: control('year'),
    month: control('month'),
    mode: css(mode, ['font-size', 'height', 'margin-inline-start']),
    radio: css(mode?.querySelector(`.${shared}-radio-button-wrapper`), [...font, 'height', ...padding]),
    selected: cell(root.querySelector(`.${prefix}-cell-selected`)),
    disabled: cell(root.querySelector(`.${prefix}-cell-disabled`)),
    normal: cell(root.querySelector(`.${prefix}-cell-in-view:not(.${prefix}-cell-selected):not(.${prefix}-cell-disabled):not(.${prefix}-cell-today)`)),
    cells: root.querySelectorAll(`.${prefix}-cell`).length
  };
}
