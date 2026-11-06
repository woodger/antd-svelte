export function snapshotColorPickerThemeTriggers() {
  function colorThemeCSS(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const colorThemeFont = ['font-size', 'font-family', 'line-height', 'color'];
  const colorThemeBox = ['box-sizing', 'width', 'height', 'min-width', 'min-height',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background-color', 'border-radius', 'border-top-color', 'border-top-width', 'box-shadow'];

  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-color-theme]')]
    .map(host => [host.dataset.colorTheme!, Object.fromEntries(
      [...host.querySelectorAll<HTMLElement>('[data-color-control]')].map(panel => {
        const root = panel.querySelector('.ant-color-picker-trigger');
        return [panel.dataset.colorControl!, {
          root: colorThemeCSS(root, [...colorThemeFont, ...colorThemeBox]),
          block: colorThemeCSS(root?.querySelector('.ant-color-picker-color-block, .ant-color-picker-clear')
            ?? null, ['width', 'height', 'border-radius', 'border-top-color', 'border-top-width']),
          text: colorThemeCSS(root?.querySelector('.ant-color-picker-trigger-text') ?? null,
            colorThemeFont)
        }];
      })
    )]));
}
export function snapshotColorPickerThemePopup() {
  function colorThemeCSS(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const colorThemeFont = ['font-size', 'font-family', 'line-height', 'color'];
  const colorThemeBox = ['box-sizing', 'width', 'height', 'min-width', 'min-height',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background-color', 'border-radius', 'border-top-color', 'border-top-width', 'box-shadow'];

  const popup = document.querySelector('.theme-color-popup:not(.ant-popover-hidden)')!;
  const both = [...colorThemeFont, ...colorThemeBox];
  const format = popup.querySelector('.ant-color-picker-format-select.ant-select')
    ?? popup.querySelector('.ant-color-picker-format-select .ant-select');
  return {
    popup: colorThemeCSS(popup, [...colorThemeFont, 'z-index', 'width', 'height']),
    container: colorThemeCSS(popup.querySelector('.ant-popover-container'), both),
    inner: colorThemeCSS(popup.querySelector('.ant-color-picker-inner-content'), both),
    palette: colorThemeCSS(popup.querySelector('.ant-color-picker-select'), both),
    handler: colorThemeCSS(popup.querySelector('.ant-color-picker-handler'),
      ['width', 'height', 'border-top-width', 'border-top-color', 'box-shadow']),
    sliders: [...popup.querySelectorAll('.ant-color-picker-slider')].map(node =>
      colorThemeCSS(node, ['height', 'margin-top', 'margin-bottom'])),
    fields: colorThemeCSS(popup.querySelector('.ant-color-picker-input-container'), both),
    // Flex constraints принадлежат внешней Svelte-обёртке Select; здесь видимая часть.
    format: colorThemeCSS(format, both.filter(name => name !== 'min-width' && name !== 'min-height')),
    hexRoot: colorThemeCSS(popup.querySelector('.ant-color-picker-hex-input'), both),
    inputs: [...popup.querySelectorAll('.ant-color-picker-input input, .ant-color-picker-alpha-input input')]
      .map(node => colorThemeCSS(node, [...colorThemeFont, 'height', 'padding-top',
        'padding-right', 'padding-bottom', 'padding-left'])),
    numberRoots: [...popup.querySelectorAll('.ant-color-picker-steppers.ant-input-number')]
      .map(node => colorThemeCSS(node, [...colorThemeFont, 'height', 'border-top-width',
        'border-top-color', 'border-radius'])),
    divider: colorThemeCSS(popup.querySelector('.ant-divider'),
      ['margin-top', 'margin-bottom', 'border-top-color', 'border-top-width']),
    presets: colorThemeCSS(popup.querySelector('.ant-color-picker-presets-color'),
      ['width', 'height', 'margin-right', 'margin-bottom', 'border-radius']),
    presetStates: [...popup.querySelectorAll('.ant-color-picker-presets-color')].map(node => ({
      checked: node.classList.contains('ant-color-picker-presets-color-checked'),
      bright: node.classList.contains('ant-color-picker-presets-color-bright')
    })),
    presetLabel: colorThemeCSS(popup.querySelector('.ant-color-picker-presets-label'), colorThemeFont)
  };
}
