import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type CarouselContent = string | number | bigint | boolean | null | undefined | Snippet
  | readonly CarouselContent[];
export type CarouselEffect = 'scrollx' | 'fade';
export type DotPlacement = 'top' | 'bottom' | 'start' | 'end';
export type CarouselLazyLoad = 'ondemand' | 'progressive' | 'anticipated';
export type CarouselSwipeDirection = 'left' | 'right' | 'up' | 'down' | 'vertical';
export type CarouselAutoplayState = 'playing' | 'paused' | 'hovered' | 'focused' | null;
export type CarouselPlayType = 'update' | 'leave' | 'blur' | 'play' | 'playing';

/** Один исходный child: snippet рендерится внутри его div, width заменяет React style.width. */
export interface CarouselItem {
  children?: CarouselContent;
  width?: number | string;
  class?: string;
  style?: string;
  attributes?: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'>;
}

/** Props корня custom arrow; onClick отсутствует у выключенного направления. */
export interface CarouselArrowProps {
  class: string;
  className: string;
  style: string;
  onClick?: (event?: MouseEvent) => void;
  currentSlide: number;
  slideCount: number;
  'data-role': 'none';
}

/** AppendDots применяет эти props к своему корню; customPaging применяет onClick к кнопке. */
export interface CarouselDotsProps {
  class: string;
  className: string;
  onMouseEnter?: () => void;
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
}

/** Делегированный Settings react-slick 2.0.0; defaults сохраняются в реализации. */
export interface CarouselSlickSettings {
  /** Physical Left/Right, кроме input/textarea/select. @defaultValue true */
  accessibility?: boolean;
  /** Высота текущего слайда после browser measurements. @defaultValue false */
  adaptiveHeight?: boolean;
  /** Вызывается после speed; прерванный переход сообщает предыдущий индекс. */
  afterChange?: (currentSlide: number) => void;
  appendDots?: Snippet<[dots: Snippet, props: CarouselDotsProps]>;
  /** @defaultValue false */
  arrows?: boolean;
  asNavFor?: CarouselRef | null;
  /** Интервал JS autoplay равен autoplaySpeed + 50ms. @defaultValue 3000 */
  autoplaySpeed?: number;
  autoplay?: boolean;
  /** До изменения currentSlide и перед callback загрузки новых lazy slides. */
  beforeChange?: (currentSlide: number, nextSlide: number) => void;
  centerMode?: boolean;
  centerPadding?: string;
  children?: CarouselContent;
  class?: string;
  cssEase?: string;
  /** Custom renderer явно применяет onClick к собственной native кнопке. */
  customPaging?: Snippet<[index: number, props: { onClick: (event: MouseEvent) => void; }]>;
  dots?: boolean;
  dotsClass?: string;
  /** Мышиный drag; touch отдельно учитывает swipe/touchMove. @defaultValue false */
  draggable?: boolean;
  /** Сохранён upstream prop; CSS-переход использует cssEase. */
  easing?: string;
  edgeFriction?: number;
  fade?: boolean;
  focusOnSelect?: boolean;
  infinite?: boolean;
  /** Применяется повторно при изменении prop или root RTL. @defaultValue 0 */
  initialSlide?: number;
  lazyLoad?: CarouselLazyLoad;
  nextArrow?: Snippet<[props: CarouselArrowProps]>;
  onEdge?: (direction: CarouselSwipeDirection) => void;
  onInit?: () => void;
  /** Индексы включают pre/post clones исходного Slick. */
  onLazyLoad?: (slidesToLoad: number[]) => void;
  onLazyLoadError?: () => void;
  onReInit?: () => void;
  onSwipe?: (direction: CarouselSwipeDirection) => void;
  pauseOnDotsHover?: boolean;
  pauseOnFocus?: boolean;
  pauseOnHover?: boolean;
  prevArrow?: Snippet<[props: CarouselArrowProps]>;
  /** Регистрируется при mount; breakpoint применяется по событию matchMedia. */
  responsive?: readonly CarouselResponsiveObject[];
  /** Положительное целое; строки объединяются в логические слайды. @defaultValue 1 */
  rows?: number;
  rtl?: boolean;
  /** Сохранён upstream prop; react-slick не использует его для смены тега. */
  slide?: string;
  /** Положительное целое. @defaultValue 1 */
  slidesPerRow?: number;
  /** Положительное число. @defaultValue 1 */
  slidesToScroll?: number;
  /** Положительное число. @defaultValue 1 */
  slidesToShow?: number;
  /** Длительность CSS-перехода и таймера afterChange, ms. @defaultValue 500 */
  speed?: number;
  swipeToSlide?: boolean;
  swipe?: boolean;
  swipeEvent?: (direction: CarouselSwipeDirection) => void;
  touchMove?: boolean;
  touchThreshold?: number;
  useCSS?: boolean;
  useTransform?: boolean;
  variableWidth?: boolean;
  vertical?: boolean;
  verticalSwiping?: boolean;
  waitForAnimate?: boolean;
}

export interface CarouselResponsiveObject {
  breakpoint: number;
  settings: CarouselSlickSettings | 'unslick';
}

/** Carousel Ant Design; items дают метаданные слайдов, children — один snippet либо массив. */
export interface CarouselProps extends Omit<
  CarouselSlickSettings,
  'dots' | 'dotsClass' | 'autoplay' | 'verticalSwiping'
> {
  /** Имеет приоритет над children. Snippets не разбираются как React virtual tree. */
  items?: readonly CarouselItem[];
  effect?: CarouselEffect;
  style?: string;
  /** Непустой локальный prefix имеет приоритет; иначе используется ConfigProvider.prefixCls. */
  prefixCls?: string;
  rootClassName?: string;
  id?: string;
  /** Присутствует в upstream types, но не управляет текущим слайдом; используйте ref.goTo. */
  slickGoTo?: number;
  dotPlacement?: DotPlacement;
  dots?: boolean | { class?: string; className?: string; };
  /** @defaultValue false */
  autoplay?: boolean | { dotDuration?: boolean; };
  /** @defaultValue false */
  waitForAnimate?: boolean;
  /** Доступен после mount; методы сохраняют отложенный вызов исходного slick. */
  ref?: CarouselRef;
  /** Внешний div карусели; поддерживает bind:nativeElement. */
  nativeElement?: HTMLDivElement;
}

/** Наблюдаемая часть состояния исходного innerSlider. Индекс в RTL зеркальный. */
export interface CarouselState {
  /** Slick оставляет undefined после завершения перехода с useCSS=false. */
  animating: boolean | undefined;
  autoplaying: CarouselAutoplayState;
  currentDirection: number;
  currentLeft: number | null;
  currentSlide: number;
  direction: number;
  dragging: boolean;
  edgeDragged: boolean;
  initialized: boolean;
  lazyLoadedList: number[];
  listHeight: number | null;
  listWidth: number | null;
  scrolling: boolean;
  slideCount: number;
  slideHeight: number | null;
  slideWidth: number | string | null;
  swipeLeft: number | null;
  swiped: boolean;
  swiping: boolean;
  touchObject: CarouselTouchObject;
  trackStyle: Record<string, string | number | undefined>;
  trackWidth: number;
  targetSlide: number;
}

export interface CarouselTouchObject {
  startX?: number;
  startY?: number;
  curX?: number;
  curY?: number;
  swipeLength?: number;
}

/** Методы делегированного slider; React instance заменён объектом состояния и DOM refs. */
export interface CarouselInnerSlider {
  readonly list: HTMLDivElement | undefined;
  readonly track: { readonly node: HTMLDivElement | undefined; };
  readonly state: Readonly<CarouselState>;
  slickNext: () => void;
  slickPrev: () => void;
  slickGoTo: (slide: number, dontAnimate?: boolean) => void;
  slickPause: () => void;
  slickPlay: () => void;
  slideHandler: (index: number, dontAnimate?: boolean) => void;
  autoPlay: (playType?: CarouselPlayType) => void;
  pause: (pauseType: 'paused' | 'hovered' | 'focused') => void;
}

export interface CarouselRef {
  readonly nativeElement: HTMLDivElement | undefined;
  /** Методы откладываются на timer; индексы и направление сохраняют Slick RTL semantics. */
  goTo: (slide: number, dontAnimate?: boolean) => void;
  next: () => void;
  prev: () => void;
  autoPlay: (playType?: 'update' | 'leave' | 'blur') => void;
  /** Отсутствует в responsive unslick; обычный режим предоставляет typed slider API. */
  readonly innerSlider: CarouselInnerSlider | undefined;
}

/** Наследуемые class/style относятся к внутреннему slick-slider, как в Ant Design. */
export interface CarouselConfig {
  class?: string;
  style?: string;
}

export interface CarouselLocale {
  prevSlide: string;
  nextSlide: string;
}
