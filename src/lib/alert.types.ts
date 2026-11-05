import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type AlertType = 'success' | 'info' | 'warning' | 'error';
export type AlertVariant = 'outlined' | 'filled';
export type AlertContent = string | number | boolean | null | Snippet
  | readonly (AlertContent | undefined)[];

export interface AlertCloseAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: HTMLAttributes<HTMLButtonElement>['role'];
  [attribute: `aria-${string}`]: unknown;
  [attribute: `data-${string}`]: unknown;
}
export interface AlertClosable extends AlertCloseAttributes {
  disabled?: boolean;
  /** Пустая строка сохраняет прежнюю пустую кнопку; остальные falsy values выбирают fallback. */
  closeIcon?: AlertContent;
  /** Приоритетнее onClose на корне; preventDefault не отменяет закрытие. */
  onClose?: (event: MouseEvent) => void;
  /** Snapshot при запросе; вызывается после удаления DOM и отменяется при unmount. */
  afterClose?: () => void;
}
export interface AlertSemanticSlots {
  root?: string;
  icon?: string;
  section?: string;
  title?: string;
  description?: string;
  actions?: string;
  close?: string;
}
export interface AlertSemanticInfo {
  props: Omit<AlertProps, 'closable'> & {
    prefixCls: string;
    variant: AlertVariant;
    type: AlertType;
    closable: boolean;
  };
}
export type AlertSemantic = AlertSemanticSlots
  | ((info: AlertSemanticInfo) => AlertSemanticSlots | undefined);
export interface AlertRef {
  /** Snapshot после mount; после закрытия узел остаётся отсоединённым до unmount. */
  readonly nativeElement: HTMLDivElement;
}
/** Наследуемое оформление и close/icon defaults; явный record заменяет родительский. */
export interface AlertConfig extends Pick<
  AlertProps, 'class' | 'style' | 'variant' | 'closeIcon' | 'classNames' | 'styles'
> {
  closable?: boolean | (AlertCloseAttributes & Pick<AlertClosable, 'closeIcon'>);
  successIcon?: AlertContent;
  infoIcon?: AlertContent;
  warningIcon?: AlertContent;
  errorIcon?: AlertContent;
}

/** Сообщение со статусом, действием и закрытием с завершением анимации. */
export interface AlertProps {
  type?: AlertType;
  /** @defaultValue 'outlined' */
  variant?: AlertVariant;
  title?: AlertContent;
  /** @deprecated Используйте title. Title ?? message сохраняет 0/false/пустую строку. */
  message?: AlertContent;
  description?: AlertContent;
  /** Undefined включает иконку в banner; в обычном режиме она скрыта. */
  showIcon?: boolean;
  /** Null/undefined выбирают context/default icon; false и пустая строка оставляют пустой span. */
  icon?: AlertContent;
  action?: AlertContent;
  /** @defaultValue false */
  banner?: boolean;
  /** @defaultValue false */
  closable?: boolean | AlertClosable;
  /** @deprecated Используйте closable.closeIcon. */
  closeText?: AlertContent;
  /** @deprecated Используйте closable.closeIcon. */
  closeIcon?: AlertContent;
  /** @deprecated Используйте closable.onClose; preventDefault не отменяет закрытие. */
  onClose?: (event: MouseEvent) => void;
  /** @deprecated Используйте closable.afterClose; callback фиксируется при запросе. */
  afterClose?: () => void;
  /** @defaultValue 'alert' */
  role?: HTMLAttributes<HTMLDivElement>['role'];
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  /** @defaultValue true */
  'aria-atomic'?: HTMLAttributes<HTMLDivElement>['aria-atomic'];
  'aria-hidden'?: HTMLAttributes<HTMLDivElement>['aria-hidden'];
  class?: string;
  style?: string;
  prefixCls?: string;
  rootClassName?: string;
  /** Callbacks получают разрешённые prefixCls/variant/type/showIcon/boolean closable. */
  classNames?: AlertSemantic;
  styles?: AlertSemantic;
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  /** Bind:nativeElement отражает текущий DOM; undefined до mount, после close/unmount. */
  nativeElement?: HTMLDivElement;
  /** Bind:ref получает snapshot root после mount и очищается при unmount. */
  ref?: AlertRef;
  [attribute: `aria-${string}`]: unknown;
  [attribute: `data-${string}`]: unknown;
}
