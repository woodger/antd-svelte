import type { Component, Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type FlexAlign =
  'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'self-start'
  | 'self-end'
  | 'baseline'
  | 'normal'
  | 'stretch';
export type FlexJustify =
  'flex-start'
  | 'flex-end'
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | 'normal'
  | 'left'
  | 'right';
export type FlexGap = 'small' | 'medium' | 'middle' | 'large' | string | number;

/**
 * Props пользовательского корня. Class/style/dir и children передаются без обёртки.
 * Для DOM-ref объявите nativeElement через $bindable() и передайте в bind:this корня.
 * Без такого forwarding nativeElement Flex остаётся undefined.
 */
export interface FlexRootProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children?: Snippet;
  nativeElement?: HTMLElement;
}

/** Flex-контейнер с нативным или Svelte-корнем и наследуемыми layout-настройками. */
export interface FlexProps<Props extends object = {}> extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
  | 'class'
  | 'style'
> {
  children?: Snippet;
  orientation?: 'horizontal' | 'vertical';
  /** @defaultValue false */
  vertical?: boolean;
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  justify?: FlexJustify;
  align?: FlexAlign;
  flex?: string | number;
  gap?: FlexGap;
  /** Локальный BEM prefix; пустая строка использует ant-flex. */
  prefixCls?: string;
  /** Нативный tag или Svelte component, получающий props корня. @defaultValue 'div' */
  component?: keyof HTMLElementTagNameMap | Component<Props>;
  class?: HTMLAttributes<HTMLElement>['class'];
  rootClassName?: string;
  style?: string;
  /**
   * Нативный ref доступен после mount и очищается при unmount.
   * Пользовательский component передаёт его через $bindable nativeElement, иначе ref undefined.
   */
  nativeElement?: HTMLElement;
}

/** Полный набор props при передаче пользовательского component с дополнительными параметрами. */
export type FlexComponentProps<Props extends object = {}> = FlexProps<Props>
  & Omit<Props, 'class' | 'style' | 'dir' | 'nativeElement'>;

/**
 * Undefined наследует record, явный объект заменяет родительский.
 * Локальные orientation/vertical и style приоритетнее provider vertical/style.
 * Flex и custom gap применяются после style; preset gap остаётся классом.
 */
export type FlexConfig = Pick<FlexProps, 'class' | 'style' | 'vertical'>;
