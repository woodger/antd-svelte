export function snapshotSliderPrefix({ prefix, tip }: { prefix: string; tip: string }) {
  const frame = document.querySelector<HTMLElement>('[data-slider-prefix-case]')!;
  const root = frame.firstElementChild!;
  const find = (name: string) => root.querySelector(`.${CSS.escape(`${prefix}-${name}`)}`)!;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  const color = (value: string) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data];
  };
  const css = (node: Element, fields: string[], pseudo?: string) => {
    const style = getComputedStyle(node, pseudo);
    return Object.fromEntries(fields.map(field => {
      const value = style.getPropertyValue(field);
      return [field, field.endsWith('color') ? color(value) : value];
    }));
  };
  const rootClasses = new Set([prefix, ...['horizontal', 'vertical', 'rtl', 'disabled',
    'with-marks', 'lock'].map(name => `${prefix}-${name}`)]);
  const handles = [...root.querySelectorAll(`.${CSS.escape(`${prefix}-handle`)}`)]
    .filter(node => getComputedStyle(node).visibility !== 'hidden');
  const popups = [...document.querySelectorAll(`.${CSS.escape(`${prefix}-tooltip`)}`)]
    .filter(node => getComputedStyle(node).display !== 'none'
      && getComputedStyle(node).visibility !== 'hidden');
  const geometry = ['width', 'height', 'left', 'right', 'top', 'bottom'];

  return {
    defaultRootClass: root.classList.contains('ant-slider'),
    classes: [...root.classList].filter(name => rootClasses.has(name)).sort(),
    root: css(root, ['width', 'height', 'padding-top', 'padding-left', 'margin-top', 'margin-left',
      'margin-bottom', 'font-size', 'line-height', 'cursor', 'direction', 'color']),
    rail: css(find('rail'), ['width', 'height', 'background-color']),
    tracks: [...root.querySelectorAll(`.${CSS.escape(`${prefix}-track`)}`)]
      .map(node => css(node, [...geometry, 'background-color'])),
    handles: handles.map(node => ({
      style: css(node, ['width', 'height']),
      after: css(node, ['width', 'height', 'background-color', 'outline-color', 'outline-width'],
        '::after')
    })),
    controls: [...root.querySelectorAll<HTMLElement>('[role="slider"],input[type="range"]')]
      .map(node => ({ value: node.getAttribute('aria-valuenow'),
        disabled: node.matches(':disabled') || node.getAttribute('aria-disabled') === 'true' })),
    marks: [...root.querySelectorAll(`.${CSS.escape(`${prefix}-mark-text`)}`)]
      .map(node => ({ text: node.textContent, active: node.classList.contains(`${prefix}-mark-text-active`),
        style: css(node, ['left', 'right', 'top', 'bottom', 'color']) })),
    dots: [...root.querySelectorAll(`.${CSS.escape(`${prefix}-dot`)}`)]
      .map(node => ({ active: node.classList.contains(`${prefix}-dot-active`),
        style: css(node, [...geometry, 'border-color']) })),
    popups: popups.map(node => ({
      prefix: node.classList.contains(tip),
      owner: node.classList.contains(`${prefix}-tooltip`),
      container: css(node.querySelector(`.${CSS.escape(`${tip}-container`)}`)!,
        ['width', 'height', 'min-width', 'padding-top', 'padding-left', 'font-size', 'line-height',
          'color', 'background-color'])
    }))
  };
}
