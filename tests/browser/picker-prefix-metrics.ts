export function snapshotPickerPrefix() {
  const host = document.querySelector<HTMLElement>('[data-picker-prefix-host]')!;
  const prefix = host.dataset.pickerPrefix!;
  const shared = host.dataset.rootPrefix!;
  const root = host.querySelector('.fixture-picker-prefix')!;
  const candidate = document.querySelector('.fixture-picker-prefix-popup');
  const popup = candidate && candidate.getClientRects().length ? candidate : null;
  const inputNames = ['font-size', 'line-height', 'font-family', 'color', 'height',
    'background-color', 'border-top-color', 'border-top-width', 'border-radius',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'box-shadow'];
  function css(node: Element | null | undefined, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  function date(node: Element | null | undefined) {
    return css(node?.querySelector(`.${prefix}-cell-inner`) ?? null,
      [...font, 'width', 'height', 'background-color', 'border-radius']);
  }
  return {
    root: css(root, inputNames),
    inputs: [...root.querySelectorAll(`.${prefix}-input input`)].map(node =>
      css(node, ['font-size', 'line-height', 'font-family', 'color', 'height'])),
    suffix: css(root.querySelector(`.${prefix}-suffix`), ['font-size', 'color']),
    prefix: css(root.querySelector(`.${prefix}-prefix`), ['color', 'margin-inline-end']),
    popup: css(popup, [...font, 'z-index']),
    container: css(popup?.querySelector(`.${prefix}-panel-container`),
      ['background-color', 'border-radius', 'box-shadow']),
    header: css(popup?.querySelector(`.${prefix}-header`), ['font-size', 'height', ...padding]),
    timeHeader: css(popup?.querySelector(`.${prefix}-time-panel .${prefix}-header`),
      [...font, 'height']),
    timeHeaderText: popup?.querySelector(`.${prefix}-time-panel .${prefix}-header-view`)
      ?.textContent ?? null,
    body: css(popup?.querySelector(`.${prefix}-date-panel .${prefix}-body`), padding),
    dateContent: css(popup?.querySelector(`.${prefix}-date-panel .${prefix}-content`),
      ['width', 'height']),
    selectedDate: date(popup?.querySelector(`.${prefix}-cell-selected, .${prefix}-cell-range-start`)),
    normalDate: date(popup?.querySelector(`.${prefix}-cell-in-view:not(.${prefix}-cell-selected):not(.${prefix}-cell-range-start):not(.${prefix}-cell-range-end):not(.${prefix}-cell-in-range)`)),
    inRange: date(popup?.querySelector(`.${prefix}-cell-in-range`)),
    rangeBackground: popup?.querySelector(`.${prefix}-cell-in-range`)
      ? getComputedStyle(popup.querySelector(`.${prefix}-cell-in-range`)!, '::before').backgroundColor
      : null,
    disabledDate: date(popup?.querySelector(`.${prefix}-cell-disabled`)),
    disabledDateBackground: popup?.querySelector(`.${prefix}-cell-disabled`)
      ? getComputedStyle(popup.querySelector(`.${prefix}-cell-disabled`)!, '::before').backgroundColor
      : null,
    timeColumn: css(popup?.querySelector(`.${prefix}-time-panel-column`), ['width', 'height']),
    selectedTime: css(popup?.querySelector(`.${prefix}-time-panel-cell-selected .${prefix}-time-panel-cell-inner`),
      [...font, 'height', 'background-color', 'border-radius', ...padding]),
    normalTime: css(popup?.querySelector(`.${prefix}-time-panel-cell:not(.${prefix}-time-panel-cell-selected) .${prefix}-time-panel-cell-inner`),
      [...font, 'height', 'background-color', ...padding]),
    disabledTime: css(popup?.querySelector(`.${prefix}-time-panel-cell-disabled .${prefix}-time-panel-cell-inner`),
      ['color', 'background-color']),
    footer: css(popup?.querySelector(`.${prefix}-footer`),
      ['border-top-width', 'border-top-color', 'line-height']),
    ok: css(popup?.querySelector(`.${prefix}-ok .${shared}-btn`),
      ['font-size', 'line-height', 'height', 'color', 'background-color']),
    presets: css(popup?.querySelector(`.${prefix}-presets`), ['width', 'max-width'])
  };
}
