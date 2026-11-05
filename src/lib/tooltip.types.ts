import type { Snippet } from 'svelte';
import type { PopupSourceAlign } from './popup-position.engine';
import type { PresetColorKey } from './theme-token.types';
import type { RenderEmptyContent } from './types';

/** ReactNode заменён текстом, boolean, вложенными массивами и Svelte Snippet. */
export type TooltipContent = RenderEmptyContent;

/** Физические направления; Left/Right в имени не меняются при RTL. */
export type TooltipPlacement =
  | 'top' | 'bottom' | 'left' | 'right'
  | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'contextMenu';
/** Preset имена чувствительны к регистру; остальные строки передаются CSS как одно value. */
export type TooltipColor = PresetColorKey | `${PresetColorKey}-inverse` | (string & {});

/** Объект показывает стрелку; pointAtCenter по умолчанию false. */
export type TooltipArrow = boolean | { pointAtCenter?: boolean };

/** Семантика rc-trigger: числовые 0 и 1 разрешают flip; boolean false отключает коррекцию. */
export interface AdjustOverflow {
  adjustX?: 0 | 1;
  adjustY?: 0 | 1;
}

export interface TooltipSlots {
  root?: string;
  container?: string;
  arrow?: string;
}

/** CSS задаётся строками; callback получает props с разрешёнными trigger, delays и placements. */
export type TooltipSemantic = TooltipSlots | ((info: {
  props: TooltipSemanticProps;
}) => TooltipSlots);

export interface TooltipSemanticProps extends Omit<TooltipProps, 'children' | 'getPopupContainer'> {
  /** Входной prop владельца; внутреннее uncontrolled open не подменяет его. */
  open?: boolean;
  /** У внутренних Tooltip native consumers нет Svelte children snippet. */
  children?: Snippet;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement | ShadowRoot;
  trigger: TooltipTrigger | readonly TooltipTrigger[];
  mouseEnterDelay: number;
  mouseLeaveDelay: number;
  destroyOnHidden: boolean;
  builtinPlacements: Readonly<Record<string, PopupSourceAlign>>;
}

/** Настройки popup; вложенный provider заменяет объект целиком, undefined наследует родителя. */
export interface TooltipConfig {
  class?: string;
  style?: string;
  classNames?: TooltipSemantic;
  styles?: TooltipSemantic;
  arrow?: TooltipArrow;
  trigger?: TooltipTrigger | readonly TooltipTrigger[];
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
}

/** Подсказка с настраиваемыми событиями, bind:open и доступным описанием trigger. */
export interface TooltipProps {
  title?: TooltipContent;
  /** Legacy содержимое приоритетнее title, кроме title=0; falsy overlay использует title. */
  overlay?: TooltipContent;
  /**
   * Обновляет содержимое и semantic container при закрытом popup. @defaultValue false
   * Кэш фиксирует выбранный Snippet, но не останавливает его захваченную Svelte-реактивность.
   */
  fresh?: boolean;
  /** Preset или CSS background; пользовательский цвет выбирает текст по source luminance. */
  color?: TooltipColor;
  /** Меняет классы popup и default openClassName; CSS variables и native wrapper сохраняются. */
  prefixCls?: string;
  /** DOM-класс открытого trigger после hydration; пустая строка использует `${prefixCls}-open`. */
  openClassName?: string;
  children: Snippet;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Удаляет содержимое при закрытии; скрытый native shell сохраняется. @defaultValue false */
  destroyOnHidden?: boolean;
  /**
   * Явный destroyOnHidden приоритетнее, включая false.
   * Объект включает удаление независимо от keepParent.
   * @deprecated Используйте destroyOnHidden.
   */
  destroyTooltipOnHide?: boolean | { keepParent?: boolean };
  /** @defaultValue 'top' */
  placement?: TooltipPlacement;
  /** @defaultValue true */
  arrow?: TooltipArrow;
  /** @defaultValue true */
  autoAdjustOverflow?: boolean | AdjustOverflow;
  /** [] оставляет программное управление без открытия/закрытия по событиям trigger. */
  trigger?: TooltipTrigger | readonly TooltipTrigger[];
  /** Задержка открытия в секундах. */
  mouseEnterDelay?: number;
  /** Задержка закрытия в секундах. */
  mouseLeaveDelay?: number;
  /** Локальная функция → legacy getTooltipContainer → ConfigProvider; undefined наследует fallback. */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /** @deprecated Используйте getPopupContainer. Имеет приоритет над ConfigProvider. */
  getTooltipContainer?: (triggerNode: HTMLElement) => HTMLElement;
  class?: string;
  style?: string;
  /** Применяется к popup; class/style сохраняют native wrapper contract. */
  rootClassName?: string;
  classNames?: TooltipSemantic;
  styles?: TooltipSemantic;
  /** @deprecated Используйте classNames.root. */
  overlayClassName?: string;
  /** @deprecated Используйте styles.root. */
  overlayStyle?: string;
  /** @deprecated Используйте styles.container. */
  overlayInnerStyle?: string;
}

/** Параметры Tooltip ручки Slider; formatter=null отключает содержимое подсказки. */
export interface SliderTooltipConfig {
  open?: boolean;
  /** Обновляет содержимое скрытой подсказки; default cache сохраняет последний открытый кадр. */
  fresh?: boolean;
  /** Удаляет содержимое каждой скрытой подсказки; по умолчанию сохраняет. */
  destroyOnHidden?: boolean;
  /** @deprecated Используйте destroyOnHidden, который имеет приоритет, включая false. */
  destroyTooltipOnHide?: TooltipProps['destroyTooltipOnHide'];
  color?: TooltipColor;
  /** Локальный prefix Tooltip; относится ко всем подсказкам single/range. */
  prefixCls?: string;
  /** DOM-класс открытой ручки после hydration; default — `${prefixCls}-open`. */
  openClassName?: string;
  placement?: TooltipPlacement;
  arrow?: TooltipArrow;
  /** Как у Tooltip; boolean defaults сохраняют native viewport behavior. */
  autoAdjustOverflow?: boolean | AdjustOverflow;
  formatter?: ((value: number) => string | null) | null;
  /** Имеет приоритет над ConfigProvider; у Slider нет корневого getPopupContainer. */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /** @deprecated Используйте getPopupContainer. Глобальный provider getter приоритетнее. */
  getTooltipContainer?: (triggerNode: HTMLElement) => HTMLElement;
}
