export function snapshotBeamGlobal() {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-beam-global-scope]')].map(scope => [
      scope.dataset.beamGlobalScope,
      [...scope.querySelectorAll<HTMLElement>('[data-beam-global-target] > [aria-hidden="true"]')]
        .map(layer => {
          const fields = (pseudo: string | null, keys: string[]) => {
            const css = getComputedStyle(layer, pseudo);
            return Object.fromEntries(keys.map(key => [key, css.getPropertyValue(key)]));
          };
          return {
            classes: [...layer.classList].filter(name => !name.startsWith('css-')
              && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort(),
            variables: [...layer.style].filter(name => name.includes('-border-beam-'))
              .sort().map(name => [name, layer.style.getPropertyValue(name)]),
            root: fields(null, [
              'display',
              'position',
              'inset',
              'width',
              'height',
              'padding',
              'border-radius',
              'font-family',
              'font-size',
              'direction',
              'opacity',
              'pointer-events',
              'mask-composite'
            ]),
            pseudo: fields('::before', [
              'display',
              'width',
              'aspect-ratio',
              'background-image',
              'offset-path',
              'offset-anchor',
              'animation-duration',
              'animation-delay',
              'animation-timing-function',
              'animation-iteration-count'
            ]),
            namedAnimation: getComputedStyle(layer, '::before').animationName
              .endsWith('antBorderBeamMove')
          };
        })
    ]));
}
