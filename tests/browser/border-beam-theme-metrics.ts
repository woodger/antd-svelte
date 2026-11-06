export function snapshotBorderBeamTheme(prefix = 'ant-border-beam') {
  const properties = (node: Element, names: string[], pseudo?: string) => {
    const style = getComputedStyle(node, pseudo);

    return Object.fromEntries(names.map(name => [name, style.getPropertyValue(name)]));
  };
  const result: Record<string, unknown> = {};

  for (const host of document.querySelectorAll<HTMLElement>('[data-beam-theme]')) {
    result[host.dataset.beamTheme!] = [...host.querySelectorAll(
      `:scope > .${CSS.escape(prefix)},:scope > .ant-border-beam`
    )]
      .map(layer => ({
        root: properties(layer, [
          'display', 'position', 'inset', 'width', 'height', 'padding', 'border-radius',
          'font-family', 'font-size', 'pointer-events', 'mask-composite'
        ]),
        pseudo: properties(layer, [
          'display', 'width', 'aspect-ratio', 'background-image', 'offset-path',
          'offset-anchor', 'animation-duration', 'animation-delay',
          'animation-timing-function', 'animation-iteration-count'
        ], '::before'),
        namedAnimation: getComputedStyle(layer, '::before').animationName.endsWith('antBorderBeamMove')
      }));
  }

  return result;
}
