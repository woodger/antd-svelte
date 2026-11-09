export function snapshotColorPickerPrefix() {
  const host = document.querySelector<HTMLElement>('[data-color-prefix-host]')!;
  const prefix = host.dataset.colorPrefix!;
  const rootPrefix = host.dataset.rootPrefix!;
  const root = host.querySelector('.fixture-color-prefix');
  const candidate = document.querySelector('.fixture-color-prefix-popup');
  const popup = candidate && candidate.getClientRects().length > 0 ? candidate : null;
  const css = (node: Element | null | undefined, names: string[]) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  };
  const font = ['font-size', 'font-family', 'line-height', 'color'];
  const box = ['box-sizing', 'width', 'height', 'min-width', 'min-height',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background-color', 'border-radius', 'border-top-color', 'border-top-width', 'box-shadow'];
  const both = [...font, ...box];
  const color = (part: string) => popup?.querySelector(`.${prefix}-${part}`);
  const child = (part: string) => popup?.querySelector(`.${rootPrefix}-${part}`);
  const format = popup?.querySelector(`.${prefix}-format-select.${rootPrefix}-select`)
    ?? color('format-select')?.querySelector(`.${rootPrefix}-select`);

  return {
    root: css(root, [...font, ...box]),
    block: css(root?.querySelector(`.${prefix}-color-block, .${prefix}-clear`),
      ['width', 'height', 'border-radius', 'border-top-color', 'border-top-width']),
    text: css(root?.querySelector(`.${prefix}-trigger-text`), font),
    popup: css(popup, [...font, 'z-index', 'width', 'height']),
    container: css(child('popover-container'), both),
    inner: css(color('inner-content'), both),
    palette: css(color('select'), both),
    handler: css(color('handler'),
      ['width', 'height', 'border-top-width', 'border-top-color', 'box-shadow']),
    sliders: [...popup?.querySelectorAll(`.${prefix}-slider`) ?? []].map(node =>
      css(node, ['height', 'margin-top', 'margin-bottom'])),
    fields: css(color('input-container'), both),
    format: css(format, both.filter(name => name !== 'min-width' && name !== 'min-height')),
    hexRoot: css(color('hex-input'), both),
    inputs: [...popup?.querySelectorAll(`.${prefix}-input input, .${prefix}-alpha-input input`)
      ?? []].map(node => css(node, [...font, 'height', 'padding-top', 'padding-right',
      'padding-bottom', 'padding-left'])),
    numberRoots: [...popup?.querySelectorAll(`.${prefix}-steppers.${rootPrefix}-input-number`)
      ?? []].map(node => css(node, [...font, 'height', 'border-top-width',
      'border-top-color', 'border-radius'])),
    divider: css(child('divider'),
      ['margin-top', 'margin-bottom', 'border-top-color', 'border-top-width']),
    presets: css(color('presets-color'), ['width', 'height', 'margin-right',
      'margin-bottom', 'border-radius']),
    presetStates: [...popup?.querySelectorAll(`.${prefix}-presets-color`) ?? []].map(node => ({
      checked: node.classList.contains(`${prefix}-presets-color-checked`),
      bright: node.classList.contains(`${prefix}-presets-color-bright`)
    })),
    presetLabel: css(color('presets-label'), font),
    collapse: css(child('collapse'), ['display', 'gap']),
    collapseHeader: css(child('collapse-header'), ['padding-top', 'padding-bottom']),
    collapseBody: css(child('collapse-body'), ['padding-top', 'padding-bottom'])
  };
}
