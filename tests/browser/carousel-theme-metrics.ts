export function snapshotCarouselTheme() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-carousel-theme]')]
    .map(host => {
      const root = host.querySelector<HTMLElement>('.ant-carousel')!;
      const style = (selector: string, pseudo?: string) => getComputedStyle(
        root.querySelector(selector)!, pseudo
      );
      const dimensions = (node: CSSStyleDeclaration) => ({ width: node.width, height: node.height });
      const dot = style('.slick-dots li:not(.slick-active)');
      const active = style('.slick-dots li.slick-active');
      const dots = style('.slick-dots');
      const prev = style('.slick-prev');
      const next = style('.slick-next');
      const vertical = root.classList.contains('ant-carousel-vertical');

      return [host.dataset.carouselTheme, {
        vertical,
        direction: getComputedStyle(root).direction,
        dot: { ...dimensions(dot), margin: dot.margin },
        active: dimensions(active),
        button: dimensions(style('.slick-dots li:not(.slick-active) button')),
        dotsOffset: host.dataset.carouselTheme === 'top' ? dots.top : vertical
          ? host.dataset.carouselTheme === 'start' ? dots.insetInlineStart : dots.insetInlineEnd
          : dots.bottom,
        arrow: {
          ...dimensions(prev),
          previousOffset: vertical ? prev.top : prev.insetInlineStart,
          nextOffset: vertical ? next.bottom : next.insetInlineEnd,
          after: dimensions(style('.slick-prev', '::after'))
        }
      }];
    }));
}
