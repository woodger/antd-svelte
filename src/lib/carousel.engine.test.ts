import { describe, expect, it } from 'vitest';
import {
  carouselChangeSlide,
  carouselDotItems,
  carouselLazyRange,
  carouselOnDemandSlides,
  carouselPostClones,
  carouselPreClones,
  carouselRenderedSlides,
  carouselSlideClasses,
  carouselSlideTransition,
  carouselSSRStyle,
  carouselTrackLeft,
  type CarouselSpec
} from './carousel.engine';
import { getCarouselItems, getCarouselRows, getCarouselSettings } from './carousel-settings.engine';
import {
  carouselNavigableIndexes,
  carouselSwipeDirection,
  carouselSwipeEnd,
  carouselSwipeMove,
  type CarouselSwipeSpec
} from './carousel-swipe.engine';

const base: CarouselSpec = {
  infinite: true,
  centerMode: false,
  centerPadding: '50px',
  slidesToShow: 1,
  slidesToScroll: 1,
  slideCount: 5,
  currentSlide: 0,
  targetSlide: 0,
  slideWidth: 100,
  slideHeight: 80,
  listWidth: 100,
  listHeight: 80,
  variableWidth: false,
  vertical: false,
  rtl: false,
  fade: false,
  unslick: false,
  useCSS: true,
  useTransform: true,
  speed: 400,
  cssEase: 'linear',
  lazyLoadedList: [],
  animating: false,
  waitForAnimate: false
};

const swipe: CarouselSwipeSpec = {
  ...base,
  dragging: true,
  scrolling: false,
  swiping: false,
  swiped: false,
  edgeDragged: false,
  touchObject: { startX: 100, startY: 100, curX: 100, curY: 100 },
  swipeLeft: null,
  swipe: true,
  swipeToSlide: false,
  verticalSwiping: false,
  edgeFriction: 0.35,
  touchThreshold: 5,
  hasOnEdge: true,
  hasSwipeEvent: true
};

describe('Carousel settings and grouping', () => {
  it('preserves Ant Design defaults and derives the physical axis before RTL', () => {
    const normal = getCarouselSettings({}, 'ltr');
    const vertical = getCarouselSettings({ dotPlacement: 'start', rtl: true }, 'rtl');

    expect(normal).toMatchObject({
      dots: true,
      arrows: false,
      draggable: false,
      waitForAnimate: false
    });
    expect(getCarouselSettings({ autoplaySpeed: undefined }, 'ltr').autoplaySpeed).toBe(3000);
    expect(vertical).toMatchObject({
      dotPlacement: 'start', vertical: true, verticalSwiping: true, rtl: false
    });
    expect(getCarouselSettings({ dotPlacement: 'top' }, 'rtl'))
      .toMatchObject({ dotPlacement: 'top', vertical: false, rtl: true });
  });

  it('keeps wrapper direction separate from responsive slick settings and coerces fade counts', () => {
    const result = getCarouselSettings({
      effect: 'fade',
      slidesToScroll: 3,
      slidesToShow: 3,
      responsive: [{ breakpoint: 600, settings: { vertical: true, rtl: true } }]
    }, 'ltr', 600);

    expect(result).toMatchObject({
      fade: true, slidesToScroll: 1, slidesToShow: 1,
      vertical: true, rtl: true, rootVertical: false, rootRtl: false
    });
    expect(getCarouselSettings({
      responsive: [{ breakpoint: 600, settings: 'unslick' }]
    }, 'ltr', 600).regular).toBe(true);
  });

  it('filters empty children and forms rows without dropping a short final group', () => {
    const children = getCarouselItems({
      children: ['A', null, false, true, '  ', ['B', 'C'], 'D', 'E']
    });
    const groups = getCarouselRows(children, 2, 2);

    expect(children.map(item => item.children)).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(groups.map(group => group.rows.map(row => row.map(item => item.children))))
      .toEqual([[['A', 'B'], ['C', 'D']], [['E'], []]]);
    expect(getCarouselSettings({ rows: 2, variableWidth: true }, 'ltr').variableWidth).toBe(false);
  });
});

describe('Carousel source track geometry', () => {
  it.each([
    [false, false, 1],
    [false, true, 2],
    [true, false, 5],
    [true, true, 5]
  ])('keeps symmetric pre/post clones with variable=%s and center=%s', (
    variableWidth,
    centerMode,
    count
  ) => {
    const spec = { ...base, variableWidth, centerMode };

    expect(carouselPreClones(spec)).toBe(count);
    expect(carouselPostClones(spec)).toBe(count);
    expect(carouselPreClones({ ...spec, unslick: true })).toBe(0);
    expect(carouselPostClones({ ...spec, infinite: false })).toBe(0);
  });

  it('aligns uneven finite pages against their last visible slide', () => {
    const spec = { ...base, infinite: false, slidesToShow: 2, slidesToScroll: 2 };

    expect(carouselTrackLeft(spec, 4)).toBe(-300);
    expect(carouselTrackLeft({ ...spec, vertical: true }, 4)).toBe(-240);
    expect(carouselDotItems({ ...spec, currentSlide: 3 }))
      .toEqual([
        { index: 0, active: false },
        { index: 1, active: false },
        { index: 2, active: true }
      ]);
  });

  it('uses measured variable widths and center padding without rounding the offset', () => {
    const spec = {
      ...base,
      variableWidth: true,
      infinite: false,
      centerMode: true,
      centerPadding: '10px',
      listWidth: 300,
      trackSlides: [
        { index: 0, offsetLeft: 0, offsetTop: 0, offsetWidth: 81, offsetHeight: 80 },
        { index: 1, offsetLeft: 81, offsetTop: 0, offsetWidth: 100, offsetHeight: 80 }
      ]
    };

    expect(carouselTrackLeft(spec, 1)).toBe(9);
  });

  it('renders the mirrored active classes and reversed clone order in RTL', () => {
    const spec = { ...base, rtl: true, currentSlide: 4, targetSlide: 4 };

    expect(carouselSlideClasses(spec, 0)).toMatchObject({
      'slick-active': true, 'slick-current': true, 'slick-cloned': false
    });
    expect(carouselRenderedSlides(spec).map(item => item.index)).toEqual([5, 4, 3, 2, 1, 0, -1]);
  });

  it('starts SSR with percentage geometry and numeric variable-width totals', () => {
    expect(carouselSSRStyle({ ...base, slideCount: 3 }, []))
      .toEqual({ slideWidth: '20%', trackStyle: { width: '500%', left: '-100%' } });
    expect(carouselSSRStyle({ ...base, variableWidth: true, slideCount: 2 }, [80, 120]))
      .toEqual({ trackStyle: { width: '600px', left: '-200px' } });
  });

  it('loads center neighbors and retains offscreen clone placeholders independently', () => {
    const spec = { ...base, centerMode: true, slidesToShow: 3, lazyLoad: 'ondemand' as const };

    expect(carouselLazyRange(spec)).toEqual({ start: -2, end: 3 });
    expect(carouselOnDemandSlides({ ...spec, lazyLoadedList: [-1, 0] })).toEqual([-2, 1, 2]);
    expect(carouselRenderedSlides({ ...base, lazyLoad: 'ondemand', lazyLoadedList: [0] })
      .filter(item => item.loaded).map(item => item.index)).toEqual([0, 5]);
  });

  it('renders new children safely before their reduced count reaches slider state', () => {
    const rendered = carouselRenderedSlides(base, 2);

    expect(rendered.map(item => item.index)).toEqual([-1, 0, 1, 2]);
    expect(rendered.every(item => item.item < 2)).toBe(true);
  });
});

describe('Carousel source changes and animation phases', () => {
  it('keeps the requested finite target separate from its visible terminal page', () => {
    const spec = { ...base, infinite: false, slidesToShow: 2, slidesToScroll: 2,
      currentSlide: 2, targetSlide: 2 };
    const index = carouselChangeSlide(spec, { message: 'next' });
    const transition = carouselSlideTransition(spec, index);

    expect(index).toBe(4);
    expect(transition.state).toMatchObject({ currentSlide: 3, targetSlide: 4, animating: true });
    expect(transition.state?.trackStyle?.transform).toBe('translate3d(-300px, 0px, 0px)');
  });

  it('animates through the uneven infinite clone and then restores its canonical offset', () => {
    const result = carouselSlideTransition({ ...base, slidesToShow: 2, slidesToScroll: 2,
      currentSlide: 4, targetSlide: 4 }, 6);

    expect(result.state).toMatchObject({ currentSlide: 0, targetSlide: 6, animating: true });
    expect(result.state?.trackStyle?.transform).toBe('translate3d(-700px, 0px, 0px)');
    expect(result.nextState?.trackStyle?.transform).toBe('translate3d(-200px, 0px, 0px)');
    expect(result.nextState?.animating).toBe(false);
  });

  it('honors waitForAnimate and preserves the empty completion batch without CSS', () => {
    expect(carouselSlideTransition({ ...base, waitForAnimate: true, animating: true }, 1))
      .toEqual({});
    const immediate = carouselSlideTransition({ ...base, useCSS: false }, 1);

    expect(immediate.state).toMatchObject({ currentSlide: 1, targetSlide: 1 });
    expect(immediate.nextState).toEqual({});
  });

  it('wraps fade indexes once and rejects finite out-of-range requests', () => {
    expect(carouselSlideTransition({ ...base, fade: true }, 5).state)
      .toMatchObject({ currentSlide: 0, targetSlide: 0 });
    expect(carouselSlideTransition({ ...base, fade: true, infinite: false }, 5)).toEqual({});
  });

  it('chooses the neighboring clone when selecting a distant infinite child', () => {
    expect(carouselChangeSlide(base, { message: 'children', index: 4, currentSlide: 0 })).toBe(-1);
    expect(carouselChangeSlide({ ...base, currentSlide: 4 }, {
      message: 'children', index: 0, currentSlide: 4
    })).toBe(5);
  });
});

describe('Carousel swipe', () => {
  it.each([
    [20, 100, false, 'left'],
    [180, 100, false, 'right'],
    [100, 20, false, 'vertical'],
    [100, 20, true, 'up'],
    [100, 180, true, 'down']
  ] as const)('recognizes the source angular sector (%s, %s, %s)', (curX, curY, vertical, expected) => {
    expect(carouselSwipeDirection({ ...swipe.touchObject, curX, curY }, vertical)).toBe(expected);
  });

  it('keeps vertical page scrolling separate from an uncommitted horizontal drag', () => {
    expect(carouselSwipeMove(swipe, 98, 120))
      .toEqual({ state: { scrolling: true }, preventDefault: false });
  });

  it('applies finite edge friction and emits each edge/swipe notification once', () => {
    const first = carouselSwipeMove({ ...swipe, infinite: false }, 150, 100);
    const second = carouselSwipeMove({ ...swipe, infinite: false, ...first.state }, 160, 100);

    expect(first.state?.swipeLeft).toBe(17.5);
    expect(first).toMatchObject({ edge: 'right', swipeEvent: 'right', preventDefault: true });
    expect(second.edge).toBeUndefined();
    expect(second.swipeEvent).toBeUndefined();
  });

  it('requires a strict threshold crossing and restores a short drag', () => {
    const short = carouselSwipeEnd({ ...swipe,
      touchObject: { ...swipe.touchObject, curX: 80, swipeLength: 20 } });
    const long = carouselSwipeEnd({ ...swipe,
      touchObject: { ...swipe.touchObject, curX: 79, swipeLength: 21 } });

    expect(short.triggerSlide).toBeUndefined();
    expect(short.state.trackStyle?.transform).toBe('translate3d(-100px, 0px, 0px)');
    expect(long).toMatchObject({ triggerSlide: 1, swipe: 'left', preventDefault: true });
    expect(long.state).toMatchObject({ dragging: false, touchObject: {}, swipeLeft: null });
  });

  it('keeps the source uneven navigable window for swipeToSlide', () => {
    expect(carouselNavigableIndexes({ ...base, slidesToShow: 2, slidesToScroll: 3 }))
      .toEqual([-2, 1, 3, 5, 7, 9]);
  });
});
