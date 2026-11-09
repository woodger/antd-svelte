export function snapshotTourPrefix() {
  const section = document.querySelector('.fixture-tour-section')!;
  const root = section.closest('.fixture-tour-prefix')!;
  function css(node: Element | null, names: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  }
  const font = ['font-size', 'font-family', 'line-height', 'color'];
  const box = ['width', 'height', 'padding-top', 'padding-right', 'padding-bottom',
    'padding-left', 'background-color', 'border-radius', 'border-top-color',
    'border-top-width', 'box-shadow'];
  const arrow = root.querySelector('[class$="-arrow"], [class*="-arrow "]');

  return {
    root: css(root, [...font, 'width', 'z-index', 'position', 'direction']),
    section: css(section, [...font, ...box]),
    header: css(root.querySelector('.fixture-tour-header'), [...font, 'margin-bottom']),
    title: css(root.querySelector('.fixture-tour-title'), [...font, 'font-weight']),
    description: css(root.querySelector('.fixture-tour-description'), font),
    close: css(root.querySelector('.fixture-tour-close'), [...font, 'width', 'height', 'top',
      'inset-inline-end']),
    footer: css(root.querySelector('.fixture-tour-footer'), ['margin-top', 'text-align', 'height']),
    indicators: [...root.querySelectorAll('.fixture-tour-indicator')].map(node => css(node,
      ['width', 'height', 'margin-inline-end', 'background-color', 'border-radius'])),
    previous: css(root.querySelector('[class$="-prev-btn"], [class*="-prev-btn "]'),
      [...font, ...box, 'margin-inline-start']),
    next: css(root.querySelector('[class$="-next-btn"], [class*="-next-btn "]'),
      [...font, ...box, 'margin-inline-start']),
    arrow: css(arrow, ['width', 'height', 'background-color', 'transform']),
    arrowColor: arrow ? getComputedStyle(arrow, '::before').backgroundColor : null,
    arrowClip: arrow ? getComputedStyle(arrow, '::before').clipPath : null
  };
}
