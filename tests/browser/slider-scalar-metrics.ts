export function snapshotSliderScalar() {
  const root = document.querySelector<HTMLElement>('[data-scalar-case] .ant-slider')!;
  const control = root.querySelector<HTMLElement>('[role="slider"], input[type="range"]')!;
  const css = (node: Element, fields: string[]) => {
    const style = getComputedStyle(node);
    return Object.fromEntries(fields.map(field => [field, style.getPropertyValue(field)]));
  };
  const position = ['left', 'right', 'top', 'bottom', 'transform'];
  const fields = ['height', 'width', 'background-color'];

  return {
    value: control.getAttribute('aria-valuenow'),
    aria: Object.fromEntries(['label', 'labelledby', 'required', 'valuetext'].map(name =>
      [name, control.getAttribute(`aria-${name}`)])),
    tabNavigationIndex: control.matches(':disabled') ? -1 : control.tabIndex,
    classes: [...root.classList].filter(name =>
      /^ant-slider-(horizontal|vertical|rtl|disabled|with-marks)$/.test(name)
      || /^(local|provider|semantic|extra)-/.test(name)).sort(),
    root: css(root, ['width', 'height', 'color', 'margin-bottom']),
    rail: css(root.querySelector('.ant-slider-rail')!, fields),
    tracks: [...root.querySelectorAll('.ant-slider-tracks')].map(node => css(node, fields)),
    track: [...root.querySelectorAll('.ant-slider-track')].map(node => css(node, fields)),
    handle: css(root.querySelector('.ant-slider-handle')!, ['width', 'height', 'background-color']),
    marks: [...root.querySelectorAll('.ant-slider-mark-text')].map(node => ({
      text: node.textContent,
      active: node.classList.contains('ant-slider-mark-text-active'),
      style: css(node, [...position, 'color', 'font-size'])
    })),
    dots: [...root.querySelectorAll('.ant-slider-dot')].map(node => ({
      active: node.classList.contains('ant-slider-dot-active'),
      style: css(node, [...position, 'width', 'height', 'border-color'])
    }))
  };
}
