import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type TourContent = string | number | bigint | boolean | null | undefined
  | Snippet | readonly TourContent[];
export type TourPlacement = 'center' | 'top' | 'bottom' | 'left' | 'right'
  | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
export type TourType = 'default' | 'primary';
export type TourTarget = HTMLElement | null | (() => HTMLElement | null | undefined);
export type TourArrow = boolean | { pointAtCenter: boolean; };
export type TourMask = boolean | { style?: string; color?: string; };
export type TourSemanticName = 'root' | 'cover' | 'close' | 'mask' | 'section' | 'footer'
  | 'actions' | 'indicator' | 'indicators' | 'header' | 'title' | 'description';
export type TourSlots = Partial<Record<TourSemanticName, string>>;
export type TourSemantic = TourSlots | ((info: { props: TourProps; }) => TourSlots);

/** Подсвеченная область: offset по X/Y, по умолчанию 6px; radius по умолчанию 2px. */
export interface TourGap {
  offset?: number | readonly [number, number];
  radius?: number;
}

/** False скрывает закрытие и отключает Escape; aria/data атрибуты относятся к кнопке. */
export type TourClosable = boolean | {
  closeIcon?: TourContent;
  role?: HTMLAttributes<HTMLButtonElement>['role'];
  [name: `aria-${string}`]: string | number | boolean | undefined;
  [name: `data-${string}`]: string | number | boolean | undefined;
};

/** Настройки штатной Previous/Next/Finish кнопки; callback идёт после перехода. */
export interface TourButtonProps {
  children?: TourContent;
  onClick?: (event: MouseEvent & { currentTarget: HTMLButtonElement; }) => void;
  class?: string;
  style?: string;
}

/** Шаг тура; локальные arrow/mask/placement/type имеют приоритет над общими. */
export interface TourStepProps {
  title: TourContent;
  description?: TourContent;
  cover?: TourContent;
  /** Getter вызывается только в браузере; null/undefined означает центр экрана. */
  target?: TourTarget;
  placement?: TourPlacement;
  arrow?: TourArrow;
  mask?: TourMask;
  type?: TourType;
  closeIcon?: TourContent;
  closable?: TourClosable;
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
  nextButtonProps?: TourButtonProps;
  prevButtonProps?: TourButtonProps;
  class?: string;
  style?: string;
  classNames?: TourSlots;
  styles?: TourSlots;
  /** Унаследованные поля rc-tour заменяют штатные panel callbacks/metadata. */
  current?: number;
  total?: number;
  prefixCls?: string;
  onClose?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onFinish?: () => void;
  renderPanel?: Snippet<[step: TourPanelInfo, current: number]>;
}

/** Данные panel snippet после объединения общих и локальных полей шага. */
export interface TourPanelInfo extends Omit<TourStepProps, 'closable'> {
  prefixCls: string;
  total: number;
  current: number;
  closable: Exclude<TourClosable, boolean> | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

/** Результат исходного выравнивания; callback получает фактические points после flip. */
export interface TourAlign {
  points?: readonly string[];
  offset?: readonly [number, number];
  dynamicInset?: boolean;
  autoArrow?: boolean;
  overflow?: {
    adjustX?: boolean | number;
    adjustY?: boolean | number;
    shiftX?: boolean | number;
    shiftY?: boolean | number;
  };
}

/** Тур Ant Design: без open/defaultOpen открыт при непустом наборе шагов. */
export interface TourProps {
  steps?: readonly TourStepProps[];
  /** Заданное значение управляется владельцем; onClose сам его не меняет. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Заданное значение управляется владельцем; onChange получает новый индекс. */
  current?: number;
  /** Читается один раз. @defaultValue 0 */
  defaultCurrent?: number;
  onChange?: (current: number) => void;
  onClose?: (current: number) => void;
  /** Вызывается после onClose при завершении штатной последней кнопкой. */
  onFinish?: () => void;
  /** @defaultValue true */
  keyboard?: boolean;
  /** @defaultValue true */
  mask?: TourMask;
  /** @defaultValue true */
  arrow?: TourArrow;
  placement?: TourPlacement;
  type?: TourType;
  gap?: TourGap;
  closeIcon?: TourContent;
  closable?: TourClosable;
  disabledInteraction?: boolean;
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
  /** @defaultValue 1001 */
  zIndex?: number;
  /**
   * False оставляет слои inline. Как rc-tour, mask/placeholder вызывают getter без аргумента,
   * popup передаёт placeholder; getter должен учитывать оба вызова.
   */
  getPopupContainer?: false | ((target?: HTMLElement) => HTMLElement);
  onPopupAlign?: (popup: HTMLElement, align: TourAlign) => void;
  indicatorsRender?: Snippet<[current: number, total: number]>;
  actionsRender?: Snippet<[original: Snippet, info: { current: number; total: number; }]>;
  classNames?: TourSemantic;
  styles?: TourSemantic;
  class?: string;
  rootClassName?: string;
  style?: string;
  prefixCls?: string;
  /** Ant Design принудительно включает placeholder animation, как и в upstream. */
  animated?: boolean | { placeholder: boolean; };
  /** Ant Design заменяет эту rc-tour настройку своими placements. */
  builtinPlacements?: Record<string, TourAlign> | ((info?: {
    arrowPointAtCenter?: boolean;
  }) => Record<string, TourAlign>);
}

/** Наследуемое оформление Tour; локальные semantic/style слои имеют приоритет. */
export interface TourConfig {
  closeIcon?: TourContent;
  class?: string;
  style?: string;
  classNames?: TourSemantic;
  styles?: TourSemantic;
}

export interface TourLocale {
  Next: string;
  Previous: string;
  Finish: string;
}
