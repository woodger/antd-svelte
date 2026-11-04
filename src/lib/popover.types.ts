import type { Snippet } from 'svelte';
import type {
  AdjustOverflow,
  TooltipArrow,
  TooltipColor,
  TooltipPlacement,
  TooltipSlots,
  TooltipTrigger
} from './tooltip.types';

export type PopoverPlacement = TooltipPlacement;
export type PopoverTrigger = TooltipTrigger;
/** False опускает секцию; true оставляет пустую секцию без текста; 0 отображается. */
export type PopoverContent = string | number | boolean | Snippet;

export interface PopoverSlots extends TooltipSlots {
  title?: string;
  content?: string;
}

/** Callback получает props с разрешёнными placement, trigger и delays; CSS — строки. */
export type PopoverSemantic = PopoverSlots | ((info: {
  props: PopoverSemanticProps;
}) => PopoverSlots);

export interface PopoverSemanticProps extends PopoverProps {
  /** Входной prop владельца; внутреннее uncontrolled open не подменяет его. */
  open?: boolean;
  placement: PopoverPlacement;
  trigger: PopoverTrigger | readonly PopoverTrigger[];
  mouseEnterDelay: number;
  mouseLeaveDelay: number;
}

/** Собственные настройки Popover; defaults Tooltip к нему не применяются. */
export interface PopoverConfig {
  class?: string;
  style?: string;
  classNames?: PopoverSemantic;
  styles?: PopoverSemantic;
  arrow?: TooltipArrow;
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
}

/** Интерактивная поверхность у trigger snippet с bind:open и управлением фокусом. */
export interface PopoverProps {
  children: Snippet;
  /** Цвет панели и стрелки; title/content сохраняют собственные semantic цвета. */
  color?: TooltipColor;
  /** Меняет классы панели, slots и default openClassName; CSS variables сохраняются. */
  prefixCls?: string;
  /** DOM-класс открытого trigger после hydration; по умолчанию `${prefixCls}-open`. */
  openClassName?: string;
  title?: PopoverContent | null;
  content?: PopoverContent | null;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Удаляет title/content при закрытии; по умолчанию содержимое сохраняется. */
  destroyOnHidden?: boolean;
  /**
   * Современный destroyOnHidden имеет приоритет, включая false.
   * @deprecated Используйте destroyOnHidden; keepParent не меняет результат.
   */
  destroyTooltipOnHide?: boolean | { keepParent?: boolean };
  /** [] оставляет программное управление без открытия/закрытия по событиям trigger. */
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  /** @defaultValue 'top' */
  placement?: PopoverPlacement;
  /** @defaultValue true */
  arrow?: TooltipArrow;
  /** @defaultValue true */
  autoAdjustOverflow?: boolean | AdjustOverflow;
  /** Задержка открытия в секундах. */
  mouseEnterDelay?: number;
  /** Задержка закрытия в секундах. */
  mouseLeaveDelay?: number;
  /** Локальная функция → legacy getTooltipContainer → ConfigProvider. */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /** @deprecated Используйте getPopupContainer. Undefined сохраняет provider fallback. */
  getTooltipContainer?: (triggerNode: HTMLElement) => HTMLElement;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-busy'?: boolean;
  popupClass?: string;
  class?: string;
  style?: string;
  rootClassName?: string;
  classNames?: PopoverSemantic;
  styles?: PopoverSemantic;
  /** @deprecated Используйте classNames.root. */
  overlayClassName?: string;
  /** @deprecated Используйте styles.root. */
  overlayStyle?: string;
  /** @deprecated Используйте styles.container. */
  overlayInnerStyle?: string;
}
