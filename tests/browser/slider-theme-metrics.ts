export function snapshotSliderTheme(id: string) {
  const root = document.querySelector<HTMLElement>(`[data-slider-theme="${id}"] .ant-slider`)!;
  const rail = root.querySelector<HTMLElement>('.ant-slider-rail')!;
  const track = root.querySelector<HTMLElement>('.ant-slider-track')!;
  const handle = root.querySelector<HTMLElement>('.ant-slider-handle')!;
  const vertical = root.classList.contains('ant-slider-vertical');
  const select = (element: Element, keys: readonly string[], pseudo?: string) => {
    const style = getComputedStyle(element, pseudo);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const dot = root.querySelector('.ant-slider-dot');
  const activeDot = root.querySelector('.ant-slider-dot-active');

  return {
    root: select(root, [vertical ? 'width' : 'height', 'padding-top', 'padding-left',
      'margin-top', 'margin-left', 'margin-bottom', 'font-size', 'line-height', 'color']),
    rail: select(rail, [vertical ? 'width' : 'height', 'background-color', 'border-radius']),
    track: select(track, [vertical ? 'width' : 'height', 'background-color']),
    handle: select(handle, ['width', 'height']),
    before: select(handle, ['width', 'height', 'inset-inline-start', 'inset-block-start'], '::before'),
    after: select(handle, ['width', 'height', 'background-color', 'box-shadow',
      'outline-width', 'outline-color', 'inset-inline-start', 'inset-block-start'], '::after'),
    dot: dot ? select(dot, ['width', 'height', 'border-color']) : null,
    activeDot: activeDot ? select(activeDot, ['width', 'height', 'border-color']) : null
  };
}
