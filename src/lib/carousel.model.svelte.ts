import { tick, untrack } from 'svelte';
import {
  carouselCanGoNext,
  carouselChangeSlide,
  carouselOnDemandSlides,
  carouselPostClones,
  carouselPreClones,
  carouselSlideTransition,
  carouselSSRStyle,
  carouselTrackLeft,
  carouselTrackStyle,
  type CarouselChange,
  type CarouselSpec
} from './carousel.engine';
import { carouselMetrics, carouselMeasure, connectCarouselDOM } from './carousel.dom';
import {
  carouselSwipeEnd,
  carouselSwipeMove,
  type CarouselSwipeSpec
} from './carousel-swipe.engine';
import type { CarouselSettings } from './carousel-settings.engine';
import type { CarouselInnerSlider, CarouselPlayType, CarouselState } from './carousel.types';

export function createCarouselModel(
  initial: CarouselSettings,
  count: number,
  widths: readonly (number | string | undefined)[]
) {
  let props = initial;
  let state = $state.raw<CarouselState>({
    animating: false,
    autoplaying: null,
    currentDirection: 0,
    currentLeft: null,
    currentSlide: initial.initialSlide,
    direction: 1,
    dragging: false,
    edgeDragged: false,
    initialized: false,
    lazyLoadedList: [],
    listHeight: null,
    listWidth: null,
    scrolling: false,
    slideCount: count,
    slideHeight: null,
    slideWidth: null,
    swipeLeft: null,
    swiped: false,
    swiping: false,
    touchObject: {},
    trackStyle: {},
    trackWidth: 0,
    targetSlide: initial.initialSlide || 0
  });
  let list: HTMLDivElement | undefined;
  let track: HTMLDivElement | undefined;
  let dom: ReturnType<typeof connectCarouselDOM> | undefined;
  let active = false;
  let clickable = true;
  let navIndex: number | undefined;
  let animation: ReturnType<typeof setTimeout> | undefined;
  let autoplay: ReturnType<typeof setInterval> | undefined;
  let progressive: ReturnType<typeof setInterval> | undefined;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let touchLock: (() => void) | undefined;
  state = untrack(() => ({ ...state, ...carouselSSRStyle(spec(), widths) }));

  function spec(measureSlides = true): CarouselSpec {
    return {
      ...props,
      ...state,
      slideWidth: Number.parseFloat(String(state.slideWidth ?? 0)),
      slideHeight: state.slideHeight ?? 0,
      listWidth: state.listWidth ?? 0,
      listHeight: state.listHeight ?? 0,
      trackSlides: measureSlides ? carouselMetrics(track) : undefined
    };
  }

  function swipeSpec(): CarouselSwipeSpec {
    return {
      ...spec(),
      ...state,
      slideWidth: Number.parseFloat(String(state.slideWidth ?? 0)),
      slideHeight: state.slideHeight ?? 0,
      listWidth: state.listWidth ?? 0,
      listHeight: state.listHeight ?? 0,
      swipe: props.swipe,
      swipeToSlide: props.swipeToSlide,
      verticalSwiping: props.verticalSwiping,
      edgeFriction: props.edgeFriction,
      touchThreshold: props.touchThreshold,
      hasOnEdge: Boolean(props.onEdge),
      hasSwipeEvent: Boolean(props.swipeEvent)
    };
  }

  function defer(callback: () => void, delay = 0) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (active) callback();
    }, delay);
    timers.add(timer);
    return timer;
  }

  function commit(patch: Partial<CarouselState>, callback?: () => void) {
    state = { ...state, ...patch };
    void tick().then(() => {
      if (!active) return;
      untrack(() => {
        dom?.scanImages();
        props.onReInit?.();
        loadOnDemand();
        dom?.adaptHeight();
        callback?.();
      });
    });
  }

  function loadOnDemand() {
    if (!props.lazyLoad) return;
    const slides = carouselOnDemandSlides(spec());
    if (slides.length) {
      commit({ lazyLoadedList: state.lazyLoadedList.concat(slides) });
      props.onLazyLoad?.(slides);
    }
  }

  function measure(setTrackStyle: boolean, initialIndex = false, callback?: () => void) {
    if (!list || !track) return;
    const measured = carouselMeasure(list, track, props);
    const currentSlide = initialIndex
      ? props.rtl ? state.slideCount - 1 - props.initialSlide : props.initialSlide
      : state.currentSlide;
    const next = { ...spec(), ...measured, currentSlide };
    const lazyLoadedList = state.lazyLoadedList.concat(carouselOnDemandSlides(next));
    commit({
      ...measured,
      currentSlide,
      lazyLoadedList,
      ...(state.autoplaying === null && props.autoplay ? { autoplaying: 'playing' as const } : {}),
      ...(setTrackStyle ? {
        trackStyle: carouselTrackStyle(next, carouselTrackLeft(next, currentSlide))
      } : {})
    }, callback);
  }

  function resize(setTrackStyle: boolean) {
    measure(setTrackStyle, false, () => {
      if (props.autoplay) autoPlay('update');
      else pause('paused');
    });
    commit({ animating: false });
    clearTimeout(animation);
    if (animation !== undefined) timers.delete(animation);
    animation = undefined;
  }

  function slideHandler(index: number, dontAnimate = false) {
    if (!active) return;
    const { beforeChange, onLazyLoad, afterChange, asNavFor, speed } = props;
    const previous = state.currentSlide;
    const result = carouselSlideTransition(
      { ...spec(), useCSS: props.useCSS && !dontAnimate },
      index
    );
    const next = result.state;
    if (!next) return;
    beforeChange?.(previous, next.currentSlide!);
    const slides = next.lazyLoadedList?.filter(value => !state.lazyLoadedList.includes(value))
      ?? [];
    if (slides.length) onLazyLoad?.(slides);
    if (!props.waitForAnimate && animation !== undefined) {
      clearTimeout(animation);
      timers.delete(animation);
      afterChange?.(previous);
      animation = undefined;
    }
    commit(next, () => {
      if (asNavFor && navIndex !== index) {
        navIndex = index;
        asNavFor.innerSlider?.slideHandler(index);
      }
      if (!result.nextState) return;
      animation = defer(() => {
        const { animating, ...batch } = result.nextState!;
        commit(batch, () => {
          defer(() => commit({ animating }), 10);
          afterChange?.(next.currentSlide!);
          animation = undefined;
        });
      }, speed);
    });
  }

  function change(options: CarouselChange, dontAnimate = false) {
    if (!active) return;
    const index = carouselChangeSlide(spec(), options);
    if (index !== 0 && !index) return;
    slideHandler(index, dontAnimate);
    if (props.autoplay) autoPlay('update');
    // Slick фокусирует прежний DOM .slick-current до commit нового слайда.
    if (props.focusOnSelect) dom?.focusCurrent();
  }

  function play() {
    const current = spec();
    if (props.rtl) slideHandler(state.currentSlide - props.slidesToScroll);
    else if (carouselCanGoNext(current)) slideHandler(state.currentSlide + props.slidesToScroll);
  }

  function autoPlay(type?: CarouselPlayType) {
    if (!active) return;
    clearInterval(autoplay);
    autoplay = undefined;
    const current = state.autoplaying;
    if (type === 'update' && ['hovered', 'focused', 'paused'].includes(current ?? '')) return;
    if (type === 'leave' && ['paused', 'focused'].includes(current ?? '')) return;
    if (type === 'blur' && ['paused', 'hovered'].includes(current ?? '')) return;
    autoplay = setInterval(play, props.autoplaySpeed + 50);
    commit({ autoplaying: 'playing' });
  }

  function pause(type: 'paused' | 'hovered' | 'focused') {
    clearInterval(autoplay);
    autoplay = undefined;
    const current = state.autoplaying;
    if (type === 'paused'
      || type === 'focused' && ['hovered', 'playing'].includes(current ?? '')
      || type === 'hovered' && current === 'playing') commit({ autoplaying: type });
  }

  function progressiveLoad() {
    const slides: number[] = [];
    const current = spec();
    for (let index = state.currentSlide; index < state.slideCount + carouselPostClones(current); index++) {
      if (!state.lazyLoadedList.includes(index)) {
        slides.push(index);
        break;
      }
    }
    for (let index = state.currentSlide - 1; index >= -carouselPreClones(current); index--) {
      if (!state.lazyLoadedList.includes(index)) {
        slides.push(index);
        break;
      }
    }
    if (slides.length) {
      commit({ lazyLoadedList: state.lazyLoadedList.concat(slides) });
      props.onLazyLoad?.(slides);
    } else {
      clearInterval(progressive);
      progressive = undefined;
    }
  }

  function didPropsChange(previous: CarouselSettings, next: CarouselSettings) {
    return Object.keys(next).some(name => {
      const key = name as keyof CarouselSettings;
      if (!(key in previous)) return true;
      const value = previous[key];
      if (typeof value === 'object' || typeof value === 'function' || Number.isNaN(Number(value))) {
        return false;
      }
      return value !== next[key];
    });
  }

  const inner: CarouselInnerSlider = {
    get list() { return list; },
    track: { get node() { return track; } },
    get state() { return state; },
    slickNext: () => { if (active) defer(() => change({ message: 'next' })); },
    slickPrev: () => { if (active) defer(() => change({ message: 'previous' })); },
    slickGoTo: (slide, dontAnimate = false) => {
      const index = Number(slide);
      if (active && !Number.isNaN(index)) {
        defer(() => change({ message: 'index', index }, dontAnimate));
      }
    },
    slickPause: () => pause('paused'),
    slickPlay: () => autoPlay('play'),
    slideHandler,
    autoPlay,
    pause
  };

  return {
    inner,
    get state() { return state; },
    get spec() { return spec(false); },
    change,
    configure(next: CarouselSettings, nextCount: number) {
      const previous = props;
      props = next;
      const changed = nextCount !== state.slideCount || didPropsChange(previous, next);
      if (nextCount !== state.slideCount) commit({ slideCount: nextCount });
      if (!active) return;
      dom?.scanImages();
      props.onReInit?.();
      loadOnDemand();
      dom?.adaptHeight();
      if (changed) measure(true, false, () => {
        if (state.currentSlide >= nextCount) {
          change({ message: 'index', index: nextCount - props.slidesToShow });
        }
        if (previous.autoplay !== props.autoplay
          || previous.autoplaySpeed !== props.autoplaySpeed) {
          if (!previous.autoplay && props.autoplay) autoPlay('playing');
          else if (props.autoplay) autoPlay('update');
          else pause('paused');
        }
      });
    },
    mount(viewport: HTMLDivElement, rail: HTMLDivElement) {
      list = viewport;
      track = rail;
      active = true;
      dom = connectCarouselDOM(list, () => ({ props, state }), {
        resize,
        focus: () => { if (props.autoplay) pause('focused'); },
        blur: () => {
          if (props.autoplay && state.autoplaying === 'focused') autoPlay('blur');
        },
        imageError: () => props.onLazyLoadError?.()
      });
      props.onInit?.();
      loadOnDemand();
      measure(true, true, () => {
        dom?.adaptHeight();
        if (props.autoplay) autoPlay('playing');
      });
      if (props.lazyLoad === 'progressive') progressive = setInterval(progressiveLoad, 1000);
      return () => {
        active = false;
        clearTimeout(animation);
        clearInterval(autoplay);
        clearInterval(progressive);
        for (const timer of timers) clearTimeout(timer);
        timers.clear();
        touchLock?.();
        dom?.destroy();
        dom = undefined;
        list = undefined;
        track = undefined;
      };
    },
    handleKeydown(event: KeyboardEvent) {
      const target = event.target;
      if (!props.accessibility || target instanceof Element
        && /TEXTAREA|INPUT|SELECT/.test(target.tagName)) return;
      if (event.key === 'ArrowLeft') change({ message: props.rtl ? 'next' : 'previous' });
      if (event.key === 'ArrowRight') change({ message: props.rtl ? 'previous' : 'next' });
    },
    handleClick(event: MouseEvent) {
      if (!clickable) {
        event.stopPropagation();
        event.preventDefault();
      }
      clickable = true;
    },
    handleStart(event: MouseEvent | TouchEvent) {
      const touch = 'touches' in event;
      if (props.unslick || !props.touchMove) return;
      if (props.verticalSwiping && list) {
        const view = list.ownerDocument.defaultView!;
        touchLock?.();
        const prevent = (value: TouchEvent) => value.preventDefault();
        view.addEventListener('touchmove', prevent, { passive: false });
        touchLock = () => view.removeEventListener('touchmove', prevent);
      }
      if (!touch && event.target instanceof Element && event.target.tagName === 'IMG') {
        event.preventDefault();
      }
      if (!props.swipe || !touch && !props.draggable) return;
      const x = touch ? event.touches[0].pageX : event.clientX;
      const y = touch ? event.touches[0].pageY : event.clientY;
      commit({ dragging: true, touchObject: { startX: x, startY: y, curX: x, curY: y } });
    },
    handleMove(event: MouseEvent | TouchEvent) {
      if (!state.dragging || !props.touchMove || props.unslick) return;
      const touch = 'touches' in event;
      const x = touch ? event.touches[0].pageX : event.clientX;
      const y = touch ? event.touches[0].pageY : event.clientY;
      const result = carouselSwipeMove(swipeSpec(), x, y);
      if (result.preventDefault && !touch) event.preventDefault();
      if (!result.state) return;
      if (result.state.scrolling) {
        state = {
          ...state,
          touchObject: {
            ...state.touchObject,
            curX: x,
            curY: y,
            swipeLength: Math.round(Math.sqrt((x - state.touchObject.startX!) ** 2))
          }
        };
      }
      if (result.state.touchObject) state = { ...state, touchObject: result.state.touchObject };
      if (result.edge) props.onEdge?.(result.edge);
      if (result.swipeEvent) props.swipeEvent?.(result.swipeEvent);
      if (result.state.swiping) clickable = false;
      commit(result.state);
    },
    handleEnd(event: MouseEvent | TouchEvent) {
      if (!props.touchMove || props.unslick) return;
      const result = carouselSwipeEnd(swipeSpec());
      if (result.preventDefault) event.preventDefault();
      if (result.swipe) props.onSwipe?.(result.swipe);
      commit(result.state);
      if (result.triggerSlide !== undefined) slideHandler(result.triggerSlide);
      touchLock?.();
      touchLock = undefined;
      if (event.type === 'touchend') clickable = true;
    },
    handleHover() { if (props.autoplay) pause('hovered'); },
    handleLeave() {
      if (props.autoplay && state.autoplaying === 'hovered') autoPlay('leave');
    },
    select(index: number) {
      if (props.focusOnSelect && clickable) {
        change({ message: 'children', index, currentSlide: state.currentSlide });
      }
    }
  };
}
