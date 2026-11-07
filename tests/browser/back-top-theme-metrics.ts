export function snapshotBackTopTheme() {
  const root = document.getElementById('back-top-control');
  if (!root) throw new Error('BackTop root is missing');
  const css = (node: Element, properties: string[]) => {
    const style = getComputedStyle(node);
    return Object.fromEntries(properties.map(key => [key, style.getPropertyValue(key)]));
  };
  const content = root.firstElementChild;
  const icon = content?.firstElementChild;
  const svg = icon?.querySelector('svg');

  return {
    root: css(root, ['display', 'position', 'box-sizing', 'width', 'height', 'inset-inline-end',
      'inset-block-end', 'z-index', 'font-family', 'font-size', 'line-height', 'color', 'margin',
      'padding', 'border-width', 'border-style', 'background-color', 'text-align', 'overflow']),
    content: content && css(content, ['display', 'width', 'height', 'font-family', 'font-size',
      'line-height', 'color', 'background-color', 'border-radius', 'overflow', 'text-align',
      'transition-duration', 'transition-property', 'transition-timing-function', 'border-width']),
    icon: icon && css(icon, ['display', 'width', 'height', 'font-size', 'line-height', 'color']),
    svg: svg && css(svg, ['width', 'height', 'color', 'fill'])
  };
}
