import type { CarouselContent, CarouselItem, CarouselProps } from './carousel.types';

export const carouselDefaults = {
  accessibility: true,
  adaptiveHeight: false,
  arrows: false,
  autoplay: false,
  autoplaySpeed: 3000,
  centerMode: false,
  centerPadding: '50px',
  cssEase: 'ease',
  dots: true,
  dotsClass: 'slick-dots',
  draggable: false,
  easing: 'linear',
  edgeFriction: 0.35,
  fade: false,
  focusOnSelect: false,
  infinite: true,
  initialSlide: 0,
  pauseOnDotsHover: false,
  pauseOnFocus: false,
  pauseOnHover: true,
  rows: 1,
  rtl: false,
  slide: 'div',
  slidesPerRow: 1,
  slidesToScroll: 1,
  slidesToShow: 1,
  speed: 500,
  swipe: true,
  swipeToSlide: false,
  touchMove: true,
  touchThreshold: 5,
  useCSS: true,
  useTransform: true,
  variableWidth: false,
  vertical: false,
  verticalSwiping: false,
  waitForAnimate: false,
  unslick: false
};

export function getCarouselSettings(
  props: CarouselProps,
  direction: 'ltr' | 'rtl',
  breakpoint: number | null = null
) {
  const dotPlacement = props.dotPlacement ?? 'bottom';
  const vertical = props.vertical ?? (dotPlacement === 'start' || dotPlacement === 'end');
  const rtl = (props.rtl ?? direction === 'rtl') && !vertical;
  const settings = {
    ...carouselDefaults,
    ...props,
    vertical,
    verticalSwiping: vertical,
    rtl,
    arrows: props.arrows ?? false,
    draggable: props.draggable ?? false,
    waitForAnimate: props.waitForAnimate ?? false,
    autoplaySpeed: props.autoplaySpeed ?? 3000,
    autoplay: Boolean(props.autoplay),
    dots: Boolean(props.dots ?? true),
    dotsClass: [
      'slick-dots',
      `slick-dots-${dotPlacement}`,
      typeof props.dots === 'object' && (props.dots.class ?? props.dots.className)
    ].filter(Boolean).join(' '),
    ...(props.effect === 'fade' ? { fade: true } : {})
  };
  const responsive = breakpoint
    ? props.responsive?.find(item => item.breakpoint === breakpoint)?.settings : undefined;
  const resolved = { ...settings, ...(typeof responsive === 'object' ? responsive : {}) };

  if (resolved.centerMode) resolved.slidesToScroll = 1;
  if (resolved.fade) {
    resolved.slidesToShow = 1;
    resolved.slidesToScroll = 1;
  }
  if (resolved.variableWidth && (resolved.rows > 1 || resolved.slidesPerRow > 1)) {
    resolved.variableWidth = false;
  }
  return {
    ...resolved,
    dotPlacement,
    rootVertical: vertical,
    rootRtl: rtl,
    regular: responsive === 'unslick'
  };
}

export type CarouselSettings = ReturnType<typeof getCarouselSettings>;

export function getCarouselItems(props: Pick<CarouselProps, 'items' | 'children'>): CarouselItem[] {
  if (props.items !== undefined) return [...props.items];
  const items: CarouselItem[] = [];
  function visit(value: CarouselContent) {
    if (Array.isArray(value)) {
      for (const child of value) visit(child);
    } else if (value && typeof value !== 'boolean' && (typeof value !== 'string' || value.trim())) {
      items.push({ children: value });
    }
  }
  visit(props.children);
  return items;
}

export function getCarouselRows(items: readonly CarouselItem[], rows: number, perRow: number) {
  const groups: { rows: CarouselItem[][]; width?: number | string; }[] = [];
  if (!(rows > 0) || !(perRow > 0)) return groups;
  let width: number | string | undefined;
  for (let index = 0; index < items.length; index += rows * perRow) {
    const group: CarouselItem[][] = [];
    for (let row = index; row < index + rows * perRow; row += perRow) {
      const children = items.slice(row, row + perRow);
      for (const child of children) {
        if (child.width !== undefined || child.style !== undefined) width = child.width;
      }
      group.push(children);
    }
    groups.push({ rows: group, width });
  }
  return groups;
}
