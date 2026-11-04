import type { Snippet } from 'svelte';
import type { ButtonProps } from './Button.svelte';
import type { PopoverContent, PopoverPlacement } from './popover.types';
import type { AdjustOverflow, TooltipArrow } from './tooltip.types';

/** Подтверждение действия с Promise, состоянием ожидания и защитой от позднего результата. */
export interface PopconfirmProps {
  children: Snippet;
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
}
