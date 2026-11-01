// Swipe и navigable indexes из @ant-design/react-slick 2.0.0; MIT, LICENSE.react-slick.
import type { CarouselState, CarouselSwipeDirection, CarouselTouchObject } from './carousel.types';
import {
  carouselCanGoNext,
  carouselTrackLeft,
  carouselTrackStyle,
  type CarouselSpec
} from './carousel.engine';

export interface CarouselSwipeSpec extends CarouselSpec {
  dragging: boolean;
  scrolling: boolean;
  swiping: boolean;
  swiped: boolean;
  edgeDragged: boolean;
  touchObject: CarouselTouchObject;
  swipeLeft: number | null;
  swipe: boolean;
  swipeToSlide: boolean;
  verticalSwiping: boolean;
  edgeFriction: number;
  touchThreshold: number;
  hasOnEdge: boolean;
  hasSwipeEvent: boolean;
}

type CarouselSwipePatch = Partial<Pick<
  CarouselState,
  'dragging' | 'edgeDragged' | 'scrolling' | 'swiping' | 'swiped' | 'swipeLeft'
    | 'touchObject' | 'currentDirection' | 'trackStyle'
>>;

export function carouselSwipeDirection(
  touch: CarouselTouchObject,
  verticalSwiping = false
): CarouselSwipeDirection {
  const x = touch.startX! - touch.curX!;
  const y = touch.startY! - touch.curY!;
  let angle = Math.round(Math.atan2(y, x) * 180 / Math.PI);
  if (angle < 0) angle = 360 - Math.abs(angle);
  if (angle <= 45 && angle >= 0 || angle <= 360 && angle >= 315) return 'left';
  if (angle >= 135 && angle <= 225) return 'right';
  return verticalSwiping ? angle >= 35 && angle <= 135 ? 'up' : 'down' : 'vertical';
}

export function carouselSwipeMove(spec: CarouselSwipeSpec, x: number, y: number): {
  state?: CarouselSwipePatch;
  preventDefault: boolean;
  edge?: CarouselSwipeDirection;
  swipeEvent?: CarouselSwipeDirection;
} {
  if (spec.scrolling) return { preventDefault: false };
  if (spec.animating) return { preventDefault: true };
  let preventDefault = spec.vertical && spec.swipeToSlide && spec.verticalSwiping;
  const touch = { ...spec.touchObject, curX: x, curY: y };
  touch.swipeLength = Math.round(Math.sqrt((x - touch.startX!) ** 2));
  const verticalLength = Math.round(Math.sqrt((y - touch.startY!) ** 2));
  if (!spec.verticalSwiping && !spec.swiping && verticalLength > 10) {
    return { state: { scrolling: true }, preventDefault };
  }
  if (spec.verticalSwiping) touch.swipeLength = verticalLength;
  let position = (spec.rtl ? -1 : 1) * (x > touch.startX! ? 1 : -1);
  if (spec.verticalSwiping) position = y > touch.startY! ? 1 : -1;
  const direction = carouselSwipeDirection(touch, spec.verticalSwiping);
  let length = touch.swipeLength;
  const state: CarouselSwipePatch = {};
  let edge: CarouselSwipeDirection | undefined;
  let swipeEvent: CarouselSwipeDirection | undefined;
  const dotCount = Math.ceil(spec.slideCount / spec.slidesToScroll);
  if (!spec.infinite && (spec.currentSlide === 0 && ['right', 'down'].includes(direction)
    || spec.currentSlide + 1 >= dotCount && ['left', 'up'].includes(direction)
    || !carouselCanGoNext(spec) && ['left', 'up'].includes(direction))) {
    length *= spec.edgeFriction;
    if (!spec.edgeDragged && spec.hasOnEdge) {
      edge = direction;
      state.edgeDragged = true;
    }
  }
  if (!spec.swiped && spec.hasSwipeEvent) {
    swipeEvent = direction;
    state.swiped = true;
  }
  const left = carouselTrackLeft(spec, spec.currentSlide);
  let swipeLeft = spec.vertical
    ? left + length * (spec.listHeight / spec.listWidth) * position
    : spec.rtl ? left - length * position : left + length * position;
  if (spec.verticalSwiping) swipeLeft = left + length * position;
  Object.assign(state, {
    touchObject: touch,
    swipeLeft,
    trackStyle: carouselTrackStyle(spec, swipeLeft)
  });
  if (!(Math.abs(x - touch.startX!) < Math.abs(y - touch.startY!) * 0.8)
    && touch.swipeLength > 10) {
    state.swiping = true;
    preventDefault = true;
  }
  return { state, preventDefault, edge, swipeEvent };
}

export function carouselNavigableIndexes(spec: Pick<
  CarouselSpec, 'infinite' | 'slideCount' | 'slidesToShow' | 'slidesToScroll'
>) {
  const indexes: number[] = [];
  if (!(spec.slidesToScroll > 0) || !(spec.slidesToShow > 0)) return indexes;
  const max = spec.infinite ? spec.slideCount * 2 : spec.slideCount;
  let breakpoint = spec.infinite ? -spec.slidesToShow : 0;
  let counter = breakpoint;
  while (breakpoint < max) {
    indexes.push(breakpoint);
    breakpoint = counter + spec.slidesToScroll;
    counter += Math.min(spec.slidesToScroll, spec.slidesToShow);
  }
  return indexes;
}

export function carouselCheckNavigable(spec: CarouselSpec, value: number) {
  const navigable = carouselNavigableIndexes(spec);
  if (value > navigable[navigable.length - 1]) return navigable[navigable.length - 1];
  let previous = 0;
  for (const index of navigable) {
    if (value < index) return previous;
    previous = index;
  }
  return value;
}

export function carouselSlidesTraversed(spec: CarouselSwipeSpec) {
  if (!spec.swipeToSlide) return spec.slidesToScroll;
  const center = spec.centerMode ? spec.slideWidth * Math.floor(spec.slidesToShow / 2) : 0;
  const target = spec.trackSlides?.find(slide => spec.vertical
    ? slide.offsetTop + slide.offsetHeight / 2 > -spec.swipeLeft!
    : slide.offsetLeft - center + slide.offsetWidth / 2 > -spec.swipeLeft!);
  if (!target) return 0;
  const current = spec.rtl ? spec.slideCount - spec.currentSlide : spec.currentSlide;
  return Math.abs(target.index - current) || 1;
}

export function carouselSwipeEnd(spec: CarouselSwipeSpec): {
  state: CarouselSwipePatch;
  preventDefault: boolean;
  swipe?: CarouselSwipeDirection;
  triggerSlide?: number;
} {
  if (!spec.dragging) return { state: {}, preventDefault: spec.swipe };
  const minimum = (spec.verticalSwiping ? spec.listHeight : spec.listWidth) / spec.touchThreshold;
  const direction = carouselSwipeDirection(spec.touchObject, spec.verticalSwiping);
  const state: CarouselSwipePatch = {
    dragging: false,
    edgeDragged: false,
    scrolling: false,
    swiping: false,
    swiped: false,
    swipeLeft: null,
    touchObject: {}
  };
  if (spec.scrolling || !spec.touchObject.swipeLength) return { state, preventDefault: false };
  if (spec.touchObject.swipeLength > minimum) {
    const active = spec.infinite ? spec.currentSlide : spec.targetSlide;
    let target = active;
    if (direction === 'left' || direction === 'up') {
      target += carouselSlidesTraversed(spec);
      state.currentDirection = 0;
    } else if (direction === 'right' || direction === 'down') {
      target -= carouselSlidesTraversed(spec);
      state.currentDirection = 1;
    }
    return {
      state,
      preventDefault: true,
      swipe: direction,
      triggerSlide: direction === 'vertical' ? target
        : spec.swipeToSlide ? carouselCheckNavigable(spec, target) : target
    };
  }
  state.trackStyle = carouselTrackStyle(spec, carouselTrackLeft(spec, spec.currentSlide), true);
  return { state, preventDefault: false };
}
