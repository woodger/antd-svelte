import type { Snippet } from 'svelte';
import type { ButtonProps } from './Button.svelte';
import type {
  PopoverContent,
  PopoverPlacement,
  PopoverSlots,
  PopoverTrigger
} from './popover.types';
import type { AdjustOverflow, TooltipArrow, TooltipColor } from './tooltip.types';

export interface PopconfirmSlots extends PopoverSlots {
  icon?: string;
}

/** Title/content относятся к тексту подтверждения и описанию, icon — к wrapper иконки. */
export type PopconfirmSemantic = PopconfirmSlots | ((info: {
  props: PopconfirmSemanticProps;
}) => PopconfirmSlots);

export interface PopconfirmSemanticProps extends PopconfirmProps {
  /** Входной prop владельца; внутреннее uncontrolled open не подменяет его. */
  open?: boolean;
  placement: PopoverPlacement;
  trigger: PopoverTrigger | readonly PopoverTrigger[];
  mouseEnterDelay: number;
  mouseLeaveDelay: number;
  okType: ButtonProps['type'];
}

/** Собственные defaults Popconfirm; локальные props приоритетнее контекста. */
export interface PopconfirmConfig {
  class?: string;
  style?: string;
  classNames?: PopconfirmSemantic;
  styles?: PopconfirmSemantic;
  arrow?: TooltipArrow;
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
}

/** Подтверждение действия с Promise, состоянием ожидания и защитой от позднего результата. */
export interface PopconfirmProps {
  children: Snippet;
  /** Передаётся наружному Popover; semantic цвета текста подтверждения приоритетнее. */
  color?: TooltipColor;
  title: Exclude<PopoverContent, boolean>;
  description?: Exclude<PopoverContent, boolean> | null;
  icon?: Snippet | null;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  disabled?: boolean;
  /** @defaultValue true */
  showCancel?: boolean;
  okText?: string;
  cancelText?: string;
  /** @defaultValue 'primary' */
  okType?: ButtonProps['type'];
  okButtonProps?: Omit<ButtonProps, 'children' | 'htmlType' | 'loading'>;
  cancelButtonProps?: Omit<ButtonProps, 'children' | 'htmlType' | 'loading'>;
  /** @defaultValue 'top' */
  placement?: PopoverPlacement;
  /** @defaultValue true */
  arrow?: TooltipArrow;
  /** Локальный trigger → ConfigProvider.popconfirm → click. */
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  /** Задержки hover в секундах, по умолчанию 0.1. */
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  /** @defaultValue true */
  autoAdjustOverflow?: boolean | AdjustOverflow;
  /** Передаётся Popover: локальная функция → legacy getter → ConfigProvider. */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /** @deprecated Используйте getPopupContainer. */
  getTooltipContainer?: (triggerNode: HTMLElement) => HTMLElement;
  onOpenChange?: (open: boolean) => void;
  /** Promise удерживает loading; rejection сохраняет возможность повтора. */
  onConfirm?: (event: MouseEvent) => void | PromiseLike<unknown>;
  onCancel?: (event: MouseEvent) => void;
  onError?: (error: unknown) => void;
  class?: string;
  style?: string;
  rootClassName?: string;
  classNames?: PopconfirmSemantic;
  styles?: PopconfirmSemantic;
  /** @deprecated Используйте classNames.root. */
  overlayClassName?: string;
  /** @deprecated Используйте styles.root. */
  overlayStyle?: string;
  /** @deprecated Используйте styles.container. */
  overlayInnerStyle?: string;
}
