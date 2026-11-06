export function snapshotPickerThemeInputs() {
  const names = ['font-size', 'line-height', 'font-family', 'color', 'height',
    'background-color', 'border-top-color', 'border-top-width', 'border-radius',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'box-shadow'];
  function css(node: Element, keys: string[]) {
    const style = getComputedStyle(node);
    return Object.fromEntries(keys.map(name => [name, style.getPropertyValue(name)]));
  }
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-picker-theme]')]
    .map(host => [host.dataset.pickerTheme!, Object.fromEntries(
      [...host.querySelectorAll<HTMLElement>('[data-picker-input]')].map(panel => {
        const root = panel.querySelector('.ant-picker')!;
        return [panel.dataset.pickerInput!, {
          root: css(root, names),
          inputs: [...root.querySelectorAll('.ant-picker-input input')]
            .map(node => css(node, ['font-size', 'line-height', 'font-family', 'color', 'height'])),
          suffix: css(root.querySelector('.ant-picker-suffix')!, ['font-size', 'color'])
        }];
      })
    )]));
}

export function snapshotPickerThemePopup() {
  const popup = document.querySelector('.theme-picker-popup:not(.ant-picker-dropdown-hidden)')!;
  function css(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'line-height', 'font-family', 'color'];
  const padding = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
  function date(node: Element | null) {
    return css(node?.querySelector('.ant-picker-cell-inner') ?? null,
      [...font, 'width', 'height', 'background-color', 'border-radius']);
  }
  return {
    popup: css(popup, [...font, 'z-index']),
    container: css(popup.querySelector('.ant-picker-panel-container'),
      ['background-color', 'border-radius', 'box-shadow']),
    header: css(popup.querySelector('.ant-picker-header'), ['font-size', 'height', ...padding]),
    timeHeader: css(popup.querySelector('.ant-picker-time-panel .ant-picker-header'),
      [...font, 'height']),
    timeHeaderText: popup.querySelector('.ant-picker-time-panel .ant-picker-header-view')
      ?.textContent ?? null,
    body: css(popup.querySelector('.ant-picker-date-panel .ant-picker-body'), padding),
    dateContent: css(popup.querySelector('.ant-picker-date-panel .ant-picker-content'),
      ['width', 'height']),
    selectedDate: date(popup.querySelector('.ant-picker-cell-selected, .ant-picker-cell-range-start')),
    normalDate: date(popup.querySelector('.ant-picker-cell-in-view:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end):not(.ant-picker-cell-in-range)')),
    inRange: date(popup.querySelector('.ant-picker-cell-in-range')),
    rangeBackground: popup.querySelector('.ant-picker-cell-in-range')
      ? getComputedStyle(popup.querySelector('.ant-picker-cell-in-range')!, '::before').backgroundColor
      : null,
    disabledDate: date(popup.querySelector('.ant-picker-cell-disabled')),
    disabledDateBackground: popup.querySelector('.ant-picker-cell-disabled')
      ? getComputedStyle(popup.querySelector('.ant-picker-cell-disabled')!, '::before').backgroundColor
      : null,
    timeColumn: css(popup.querySelector('.ant-picker-time-panel-column'), ['width', 'height']),
    selectedTime: css(popup.querySelector('.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner'),
      [...font, 'height', 'background-color', 'border-radius', ...padding]),
    normalTime: css(popup.querySelector('.ant-picker-time-panel-cell:not(.ant-picker-time-panel-cell-selected) .ant-picker-time-panel-cell-inner'),
      [...font, 'height', 'background-color', ...padding]),
    disabledTime: css(popup.querySelector('.ant-picker-time-panel-cell-disabled .ant-picker-time-panel-cell-inner'),
      ['color', 'background-color']),
    footer: css(popup.querySelector('.ant-picker-footer'),
      ['border-top-width', 'border-top-color', 'line-height']),
    ok: css(popup.querySelector('.ant-picker-ok .ant-btn'),
      ['font-size', 'line-height', 'height', 'color', 'background-color']),
    presets: css(popup.querySelector('.ant-picker-presets'), ['width', 'max-width'])
  };
}

export function snapshotPickerThemeScroll() {
  const popup = document.querySelector('.theme-picker-popup:not(.ant-picker-dropdown-hidden)')!;
  return [...popup.querySelectorAll<HTMLElement>('.ant-picker-time-panel-column')].map(column => {
    const first = column.querySelector<HTMLElement>('li')!;
    const selected = column.querySelector<HTMLElement>('.ant-picker-time-panel-cell-selected')!;
    return { value: selected.textContent?.trim(), scrollTop: column.scrollTop,
      targetTop: selected.offsetTop - first.offsetTop,
      selectedHeight: selected.getBoundingClientRect().height, columnHeight: column.clientHeight };
  });
}
