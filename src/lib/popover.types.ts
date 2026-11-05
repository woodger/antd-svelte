import type { Snippet } from 'svelte';
import type {
  AdjustOverflow,
  TooltipArrow,
  TooltipColor,
  TooltipPlacement,
  TooltipProps,
  TooltipSlots,
  TooltipTrigger
} from './tooltip.types';

export type PopoverPlacement = TooltipPlacement;
export type PopoverTrigger = TooltipTrigger;
/** False опускает секцию; true оставляет пустую секцию без текста; 0 отображается. */
export type PopoverContent = string | number | boolean | Snippet;

/** bind:ref Popover/Popconfirm: доступен после mount и очищается при unmount. */
export interface PopoverRef {
  /** Основной DOM trigger, включая SVG; до разрешения anchor может быть undefined. */
  readonly nativeElement: Element | undefined;
  /** Native div shell сохраняется также до первого открытия и при destroyOnHidden. */
  readonly popupElement: HTMLDivElement | undefined;
  /** Объединяет вызовы в microtask; закрытый или уничтоженный popup не открывает. */
  forceAlign: () => void;
}

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
  /** ID native popup; пустая строка использует стабильный fallback. Скрытый ID следует fresh. */
  id?: string;
  /** Цвет панели и стрелки; title/content сохраняют собственные semantic цвета. */
  color?: TooltipColor;
  /** Меняет классы панели, slots и default openClassName; CSS variables сохраняются. */
  prefixCls?: string;
  /** DOM-класс открытого trigger после hydration; по умолчанию `${prefixCls}-open`. */
  openClassName?: string;
  title?: PopoverContent | null;
  content?: PopoverContent | null;
  /** Скрывает панель, сохраняя raw open и trigger-события. @defaultValue false */
  disabled?: boolean;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Удаляет title/content при закрытии; по умолчанию содержимое сохраняется. */
  destroyOnHidden?: boolean;
  /** Монтирует скрытое содержимое и portal после hydration, включая destroyOnHidden. */
  forceRender?: boolean;
  /** Обновляет скрытые title/content и semantic styles; по умолчанию false. */
  fresh?: boolean;
  /** Явный z-index; semantic root и legacy overlayStyle имеют приоритет. */
  zIndex?: number;
  /**
   * Современный destroyOnHidden имеет приоритет, включая false.
   * @deprecated Используйте destroyOnHidden; keepParent не меняет результат.
   */
  destroyTooltipOnHide?: boolean | { keepParent?: boolean };
  /** Базовые события; [] отключает их без отдельных showAction/hideAction. */
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  /** Заменяет события открытия; undefined использует trigger, [] отключает их. */
  showAction?: readonly PopoverTrigger[];
  /** Заменяет события закрытия; [] сохраняет только Escape и действия содержимого. */
  hideAction?: readonly PopoverTrigger[];
  /** Задержка focus в секундах; default 0 независимо от mouseEnterDelay. */
  focusDelay?: number;
  /** Задержка blur в секундах; default 0 независимо от mouseLeaveDelay. */
  blurDelay?: number;
  /** @defaultValue 'top' */
  placement?: PopoverPlacement;
  /** Накладывается поверх выбранной записи placements; вложенный overflow заменяется целиком. */
  align?: TooltipProps['align'];
  /** Заменяет всю автоматически подготовленную карту, включая пустой объект. */
  builtinPlacements?: TooltipProps['builtinPlacements'];
  /** Получает DOM popup и итоговый align после flip, до применения новых координат. */
  onPopupAlign?: TooltipProps['onPopupAlign'];
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
