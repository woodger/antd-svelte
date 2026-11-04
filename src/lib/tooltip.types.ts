import type { Snippet } from 'svelte';

/** Физические направления; Left/Right в имени не меняются при RTL. */
export type TooltipPlacement =
  | 'top' | 'bottom' | 'left' | 'right'
  | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
export type TooltipTrigger = 'hover' | 'focus';

/** Объект показывает стрелку; pointAtCenter по умолчанию false. */
export type TooltipArrow = boolean | { pointAtCenter?: boolean };

/** Семантика rc-trigger: числовые 0 и 1 разрешают flip; boolean false отключает коррекцию. */
export interface AdjustOverflow {
  adjustX?: 0 | 1;
  adjustY?: 0 | 1;
}

/** Текстовая подсказка по hover/focus с bind:open и доступным описанием trigger. */
export interface TooltipProps {
  title?: string | number | null | Snippet;
  children: Snippet;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @defaultValue 'top' */
  placement?: TooltipPlacement;
  /** @defaultValue true */
  arrow?: TooltipArrow;
  /** @defaultValue true */
  autoAdjustOverflow?: boolean | AdjustOverflow;
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
}

/** Параметры Tooltip ручки Slider; formatter=null отключает содержимое подсказки. */
export interface SliderTooltipConfig {
  open?: boolean;
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
