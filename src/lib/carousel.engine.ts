// Алгоритмы @ant-design/react-slick 2.0.0; MIT, см. vendor/LICENSE.react-slick.
import type { CarouselState, CarouselLazyLoad } from './carousel.types';

export interface CarouselSlideMetrics {
  index: number;
  offsetLeft: number;
  offsetTop: number;
  offsetWidth: number;
  offsetHeight: number;
}

export interface CarouselSpec {
  infinite: boolean;
  centerMode: boolean;
  centerPadding: string;
  slidesToShow: number;
  slidesToScroll: number;
  slideCount: number;
  currentSlide: number;
  targetSlide: number;
  slideWidth: number;
  slideHeight: number;
  listWidth: number;
  listHeight: number;
  variableWidth: boolean;
  vertical: boolean;
  rtl: boolean;
  fade: boolean;
  unslick: boolean;
  useCSS: boolean;
  useTransform: boolean;
  speed: number;
  cssEase: string;
  lazyLoad?: CarouselLazyLoad;
  lazyLoadedList: readonly number[];
  animating: boolean | undefined;
  waitForAnimate: boolean;
  trackSlides?: readonly CarouselSlideMetrics[];
}

export type CarouselChange = {
  message: 'previous';
} | {
  message: 'next';
} | {
  message: 'dots';
  index: number;
  slidesToScroll: number;
} | {
  message: 'children';
  index: number;
  currentSlide: number;
} | {
  message: 'index';
  index: number;
};

export function carouselClamp(value: number, lower: number, upper: number) {
  return Math.max(lower, Math.min(value, upper));
}

export function carouselPreClones(spec: Pick<
  CarouselSpec,
  'unslick' | 'infinite' | 'variableWidth' | 'slideCount' | 'slidesToShow' | 'centerMode'
>) {
  if (spec.unslick || !spec.infinite) return 0;
  return spec.variableWidth ? spec.slideCount : spec.slidesToShow + (spec.centerMode ? 1 : 0);
}

export const carouselPostClones = carouselPreClones;

export function carouselLazyRange(spec: Pick<
  CarouselSpec, 'currentSlide' | 'centerMode' | 'slidesToShow' | 'centerPadding'
>) {
  const padding = Number.parseInt(spec.centerPadding) > 0 ? 1 : 0;
  const left = spec.centerMode ? Math.floor(spec.slidesToShow / 2) + padding : 0;
  const right = spec.centerMode
    ? Math.floor((spec.slidesToShow - 1) / 2) + 1 + padding : spec.slidesToShow;
  return { start: spec.currentSlide - left, end: spec.currentSlide + right };
}

export function carouselOnDemandSlides(spec: Pick<
  CarouselSpec, 'currentSlide' | 'centerMode' | 'slidesToShow' | 'centerPadding' | 'lazyLoadedList'
>) {
  const { start, end } = carouselLazyRange(spec);
  const slides: number[] = [];
  for (let index = start; index < end; index++) {
    if (!spec.lazyLoadedList.includes(index)) slides.push(index);
  }
  return slides;
}

export function carouselCanGoNext(spec: Pick<
  CarouselSpec, 'infinite' | 'centerMode' | 'currentSlide' | 'slideCount' | 'slidesToShow'
>) {
  return spec.infinite || !(spec.centerMode && spec.currentSlide >= spec.slideCount - 1
    || spec.slideCount <= spec.slidesToShow
    || spec.currentSlide >= spec.slideCount - spec.slidesToShow);
}

export function carouselTrackLeft(spec: CarouselSpec, slideIndex: number) {
  if (spec.unslick || spec.fade || spec.slideCount === 1) return 0;
  const {
    infinite,
    centerMode,
    slideCount,
    slidesToShow,
    slidesToScroll,
    slideWidth,
    slideHeight
  } = spec;
  let slidesToOffset = 0;
  if (infinite) {
    slidesToOffset = -carouselPreClones(spec);
    if (slideCount % slidesToScroll !== 0 && slideIndex + slidesToScroll > slideCount) {
      slidesToOffset = -(slideIndex > slideCount
        ? slidesToShow - (slideIndex - slideCount) : slideCount % slidesToScroll);
    }
    if (centerMode) slidesToOffset += Number.parseInt(String(slidesToShow / 2));
  } else {
    if (slideCount % slidesToScroll !== 0 && slideIndex + slidesToScroll > slideCount) {
      slidesToOffset = slidesToShow - slideCount % slidesToScroll;
    }
    if (centerMode) slidesToOffset = Number.parseInt(String(slidesToShow / 2));
  }

  const size = spec.vertical ? slideHeight : slideWidth;
  let left = slideIndex * size * -1 + slidesToOffset * size;
  if (spec.variableWidth) {
    let index = slideIndex + carouselPreClones(spec);
    left = -(spec.trackSlides?.[index]?.offsetLeft ?? 0);
    if (centerMode) {
      index = infinite ? index : slideIndex;
      left = 0;
      for (let item = 0; item < index; item++) {
        left -= spec.trackSlides?.[item]?.offsetWidth ?? 0;
      }
      left -= Number.parseInt(spec.centerPadding);
      const target = spec.trackSlides?.[index];
      left += target ? (spec.listWidth - target.offsetWidth) / 2 : NaN;
    }
  }
  return left;
}

export function carouselTrackStyle(spec: CarouselSpec, left: number, animate = false) {
  const total = spec.slideCount === 1 ? 1
    : carouselPreClones(spec) + spec.slideCount + carouselPostClones(spec);
  let style: CarouselState['trackStyle'] = { opacity: 1, transition: '', WebkitTransition: '' };
  if (spec.useTransform) {
    const value = spec.vertical
      ? `translate3d(0px, ${left}px, 0px)` : `translate3d(${left}px, 0px, 0px)`;
    style.WebkitTransform = value;
    style.transform = value;
    style.msTransform = spec.vertical ? `translateY(${left}px)` : `translateX(${left}px)`;
  } else {
    style[spec.vertical ? 'top' : 'left'] = left;
  }
  if (spec.fade) style = { opacity: 1 };
  const width = spec.vertical ? 0 : total * spec.slideWidth;
  const height = spec.vertical
    ? (spec.unslick ? spec.slideCount : spec.slideCount + 2 * spec.slidesToShow) * spec.slideHeight
    : 0;
  if (width) style.width = width;
  if (height) style.height = height;
  if (animate) {
    if (spec.useTransform) {
      style.WebkitTransition = `-webkit-transform ${spec.speed}ms ${spec.cssEase}`;
      style.transition = `transform ${spec.speed}ms ${spec.cssEase}`;
    } else {
      style.transition = `${spec.vertical ? 'top' : 'left'} ${spec.speed}ms ${spec.cssEase}`;
    }
  }
  return style;
}

export function carouselSlideTransition(spec: CarouselSpec, index: number): {
  state?: Partial<CarouselState>;
  nextState?: Partial<CarouselState>;
} {
  if (spec.waitForAnimate && spec.animating) return {};
  const { infinite, slideCount, currentSlide, slidesToScroll, slidesToShow } = spec;
  let animationSlide = index;
  let lazyLoadedList = [...spec.lazyLoadedList];
  const targetSlide = infinite ? index : carouselClamp(index, 0, slideCount - 1);
  if (spec.fade) {
    if (!infinite && (index < 0 || index >= slideCount)) return {};
    if (index < 0) animationSlide = index + slideCount;
    else if (index >= slideCount) animationSlide = index - slideCount;
    if (spec.lazyLoad && !lazyLoadedList.includes(animationSlide)) {
      lazyLoadedList.push(animationSlide);
    }
    return {
      state: {
        animating: true,
        currentSlide: animationSlide,
        lazyLoadedList,
        targetSlide: animationSlide
      },
      nextState: { animating: false, targetSlide: animationSlide }
    };
  }

  let finalSlide = animationSlide;
  if (animationSlide < 0) {
    finalSlide = animationSlide + slideCount;
    if (!infinite) finalSlide = 0;
    else if (slideCount % slidesToScroll !== 0) {
      finalSlide = slideCount - slideCount % slidesToScroll;
    }
  } else if (!carouselCanGoNext(spec) && animationSlide > currentSlide) {
    animationSlide = finalSlide = currentSlide;
  } else if (spec.centerMode && animationSlide >= slideCount) {
    animationSlide = infinite ? slideCount : slideCount - 1;
    finalSlide = infinite ? 0 : slideCount - 1;
  } else if (animationSlide >= slideCount) {
    finalSlide = animationSlide - slideCount;
    if (!infinite) finalSlide = slideCount - slidesToShow;
    else if (slideCount % slidesToScroll !== 0) finalSlide = 0;
  }
  if (!infinite && animationSlide + slidesToShow >= slideCount) {
    finalSlide = slideCount - slidesToShow;
  }

  let animationLeft = carouselTrackLeft(spec, animationSlide);
  const finalLeft = carouselTrackLeft(spec, finalSlide);
  if (!infinite) {
    if (animationLeft === finalLeft) animationSlide = finalSlide;
    animationLeft = finalLeft;
  }
  if (spec.lazyLoad) {
    lazyLoadedList = lazyLoadedList.concat(carouselOnDemandSlides({
      ...spec,
      currentSlide: animationSlide
    }));
  }
  if (!spec.useCSS) {
    return {
      state: {
        currentSlide: finalSlide,
        trackStyle: carouselTrackStyle(spec, finalLeft),
        lazyLoadedList,
        targetSlide
      },
      nextState: {}
    };
  }
  return {
    state: {
      animating: true,
      currentSlide: finalSlide,
      trackStyle: carouselTrackStyle(spec, animationLeft, true),
      lazyLoadedList,
      targetSlide
    },
    nextState: {
      animating: false,
      currentSlide: finalSlide,
      trackStyle: carouselTrackStyle(spec, finalLeft),
      swipeLeft: null,
      targetSlide
    }
  };
}

function carouselSiblingDirection(spec: CarouselSpec, target: number) {
  let right = spec.rtl ? 0 : spec.slidesToShow - 1;
  let left = spec.rtl ? spec.slidesToShow - 1 : 0;
  if (spec.centerMode) {
    right = left = (spec.slidesToShow - 1) / 2 + 1;
    if (Number.parseInt(spec.centerPadding) > 0) {
      right++;
      left++;
    }
    if (spec.slidesToShow % 2 === 0) {
      if (spec.rtl) right++;
      else left++;
    }
  }
  return target > spec.currentSlide
    ? target > spec.currentSlide + right ? 'left' : 'right'
    : target < spec.currentSlide - left ? 'right' : 'left';
}

export function carouselChangeSlide(spec: CarouselSpec, options: CarouselChange) {
  const { slideCount, slidesToScroll, slidesToShow, currentSlide, targetSlide, infinite } = spec;
  const offset = slideCount % slidesToScroll !== 0
    ? 0 : (slideCount - currentSlide) % slidesToScroll;
  if (options.message === 'previous') {
    const delta = offset === 0 ? slidesToScroll : slidesToShow - offset;
    // Окончательный finite target в исходнике заменяет промежуточный lazyLoad target.
    return infinite ? currentSlide - delta : targetSlide - slidesToScroll;
  }
  if (options.message === 'next') {
    return infinite ? currentSlide + (offset === 0 ? slidesToScroll : offset)
      : targetSlide + slidesToScroll;
  }
  if (options.message === 'dots') return options.index * options.slidesToScroll;
  if (options.message === 'index') return Number(options.index);
  let target = options.index;
  if (infinite) {
    const direction = carouselSiblingDirection(spec, target);
    if (target > options.currentSlide && direction === 'left') target -= slideCount;
    else if (target < options.currentSlide && direction === 'right') target += slideCount;
  }
  return target;
}

export function carouselDotItems(spec: Pick<
  CarouselSpec, 'slideCount' | 'slidesToScroll' | 'slidesToShow' | 'infinite' | 'currentSlide'
>) {
  const count = spec.infinite ? Math.ceil(spec.slideCount / spec.slidesToScroll)
    : Math.ceil((spec.slideCount - spec.slidesToShow) / spec.slidesToScroll) + 1;
  const dots: { index: number; active: boolean; }[] = [];
  for (let index = 0; index < count; index++) {
    const end = (index + 1) * spec.slidesToScroll - 1;
    const right = spec.infinite ? end : carouselClamp(end, 0, spec.slideCount - 1);
    const begin = right - (spec.slidesToScroll - 1);
    const left = spec.infinite ? begin : carouselClamp(begin, 0, spec.slideCount - 1);
    dots.push({
      index,
      active: spec.infinite ? spec.currentSlide >= left && spec.currentSlide <= right
        : spec.currentSlide === left
    });
  }
  return dots;
}

export function carouselSlideClasses(spec: Pick<
  CarouselSpec,
  'rtl' | 'slideCount' | 'slidesToShow' | 'centerMode' | 'currentSlide' | 'targetSlide'
>, sourceIndex: number) {
  const index = spec.rtl ? spec.slideCount - 1 - sourceIndex : sourceIndex;
  const center = Math.floor(spec.slidesToShow / 2);
  const focused = spec.targetSlide < 0 ? spec.targetSlide + spec.slideCount
    : spec.targetSlide >= spec.slideCount ? spec.targetSlide - spec.slideCount : spec.targetSlide;
  return {
    'slick-slide': true,
    'slick-active': spec.centerMode
      ? index > spec.currentSlide - center - 1 && index <= spec.currentSlide + center
      : spec.currentSlide <= index && index < spec.currentSlide + spec.slidesToShow,
    'slick-center': spec.centerMode && (index - spec.currentSlide) % spec.slideCount === 0,
    'slick-cloned': index < 0 || index >= spec.slideCount,
    'slick-current': index === focused
  };
}

export function carouselRenderedSlides(spec: CarouselSpec, childrenCount = spec.slideCount) {
  const original: { index: number; item: number; loaded: boolean; key: string; }[] = [];
  const before: typeof original = [];
  const after: typeof original = [];
  const { start, end } = carouselLazyRange(spec);
  for (let item = 0; item < childrenCount; item++) {
    let loaded = !spec.lazyLoad || spec.lazyLoadedList.includes(item);
    original.push({ index: item, item, loaded, key: `original-${item}` });
    if (spec.infinite && childrenCount > 1 && spec.fade === false && !spec.unslick) {
      const count = childrenCount - item;
      if (count <= carouselPreClones(spec)) {
        const index = -count;
        if (index >= start) loaded = true;
        before.push({ index, item, loaded, key: `pre-${index}` });
      }
      if (item < carouselPostClones(spec)) {
        const index = childrenCount + item;
        if (index < end) loaded = true;
        after.push({ index, item, loaded, key: `post-${index}` });
      }
    }
  }
  const result = [...before, ...original, ...after];
  return spec.rtl ? result.reverse() : result;
}

/** Только исходная SSR-геометрия; initial RTL index пересчитывается после mount. */
export function carouselSSRStyle(
  spec: CarouselSpec,
  widths: readonly (number | string | undefined)[]
) {
  if (spec.variableWidth) {
    function add(left: number | string, right: number | string | undefined) {
      return typeof left === 'string' || typeof right === 'string'
        ? String(left) + right : left + Number(right);
    }
    let width: number | string = 0;
    let left: number | string = 0;
    for (const value of widths) width = add(width, value);
    for (let item = 0; item < carouselPreClones(spec); item++) {
      const value = widths[widths.length - 1 - item];
      left = add(left, value);
      width = add(width, value);
    }
    for (let item = 0; item < carouselPostClones(spec); item++) width = add(width, widths[item]);
    for (let item = 0; item < spec.currentSlide; item++) left = add(left, widths[item]);
    return {
      trackStyle: {
        width: `${width}px`,
        left: spec.centerMode
          ? `calc(${-Number(left)}px + (100% - ${widths[spec.currentSlide]}px) / 2 ) `
          : `${-Number(left)}px`
      }
    };
  }
  const count = carouselPreClones(spec) + carouselPostClones(spec) + spec.slideCount;
  const trackWidth = 100 / spec.slidesToShow * count;
  const slideWidth = 100 / count;
  let left = -slideWidth * (carouselPreClones(spec) + spec.currentSlide) * trackWidth / 100;
  if (spec.centerMode) left += (100 - slideWidth * trackWidth / 100) / 2;
  return {
    slideWidth: `${slideWidth}%`,
    trackStyle: { width: `${trackWidth}%`, left: `${left}%` }
  };
}

export function carouselStyle(values: Record<string, string | number | undefined>) {
  return Object.entries(values).filter(([, value]) => value !== undefined).map(([key, value]) => {
    const name = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      .replace(/^ms-/, '-ms-');
    const suffix = typeof value === 'number' && !['opacity', 'zIndex'].includes(key) ? 'px' : '';
    return `${name}:${value}${suffix}`;
  }).join(';');
}
