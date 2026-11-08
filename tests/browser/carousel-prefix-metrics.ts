export function snapshotCarouselPrefix() {
  const classes = (node: Element) => [...node.classList].filter(name =>
    !name.startsWith('css-') && !/^s-[\w-]{12}$/.test(name)
      && !name.endsWith('-css-var') && !name.endsWith('-source-theme')).sort();
  const style = (node: Element, properties: string[], pseudo?: string) => {
    const computed = getComputedStyle(node, pseudo);

    return Object.fromEntries(properties.map(property => [
      property, computed.getPropertyValue(property)
    ]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-carousel-prefix-scope]')].map(host => {
      const root = host.firstElementChild!;
      const active = root.querySelector('.slick-slide.slick-active')!;
      const dots = root.querySelector('.slick-dots')!;

      return [host.dataset.carouselPrefixScope!, {
        classes: classes(root),
        root: style(root, ['font-size', 'line-height', 'color', 'direction', 'box-sizing']),
        list: style(root.querySelector('.slick-list')!, ['overflow', 'height', 'width', 'position']),
        activeIndex: active.getAttribute('data-index'),
        slide: style(active, ['float', 'display', 'pointer-events']),
        arrows: [...root.querySelectorAll('.slick-arrow')].map(node => ({
          classes: classes(node),
          style: style(node, ['position', 'width', 'height', 'inset-inline-start',
            'inset-inline-end', 'top', 'bottom']),
          after: style(node, ['width', 'height', 'border-top-width', 'transform'], '::after')
        })),
        dots: {
          classes: classes(dots),
          style: style(dots, ['display', 'position', 'flex-direction', 'top', 'bottom',
            'inset-inline-start', 'inset-inline-end'])
        },
        indicators: [...dots.children].map(node => ({
          classes: classes(node),
          style: style(node, ['width', 'height', 'margin-inline-start', 'margin-inline-end'])
        }))
      }];
    })
  );
}
