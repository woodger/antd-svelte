import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';

export type CheckboxValue = HTMLInputAttributes['value'] | boolean;
export type CheckboxContent = string | number | null | undefined | Snippet;

export interface CheckboxSemanticSlots {
  root?: string;
  icon?: string;
  label?: string;
}

export type CheckboxSemantic = CheckboxSemanticSlots | ((info: {
  props: CheckboxProps;
}) => CheckboxSemanticSlots);

/** Событие Ant Design; checked/value сохраняют тип, nativeEvent — DOM change. */
export interface CheckboxChangeEvent {
  target: Omit<CheckboxProps, 'value'> & {
    value: CheckboxValue;
    checked: boolean;
    type: 'checkbox';
  };
  nativeEvent: Event;
  stopPropagation(): void;
  preventDefault(): void;
}

/** Native refs очищаются при unmount; focus/blur используют настоящий input. */
export interface CheckboxRef {
  input: HTMLInputElement;
  nativeElement: HTMLSpanElement;
  focus(options?: FocusOptions): void;
  blur(): void;
}

/** Нативный checkbox с bind:checked/indeterminate и участием в CheckboxGroup. */
export interface CheckboxProps extends Omit<
  HTMLInputAttributes,
  'type' | 'checked' | 'indeterminate' | 'children' | 'class' | 'size' | 'value'
> {
  /** Поддерживает bind:checked вне CheckboxGroup. */
  checked?: boolean;
  /** Фиксируется при создании; default false и native reset без callbacks. */
  defaultChecked?: boolean;
  /** Bindable mixed state; пользовательское переключение сбрасывает его, как в прежнем API. */
  indeterminate?: boolean;
  value?: CheckboxValue;
  children?: Snippet;
  /** Исключает значение из группы; disabled внешнего fieldset продолжает действовать. */
  skipGroup?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Вызывается до Group.onChange; нативный onchange получает отдельный DOM event. */
  onChange?: (event: CheckboxChangeEvent) => void;
  onClick?: HTMLInputAttributes['onclick'];
  onFocus?: HTMLInputAttributes['onfocus'];
  onBlur?: HTMLInputAttributes['onblur'];
  onKeyDown?: HTMLInputAttributes['onkeydown'];
  onKeyPress?: HTMLInputAttributes['onkeypress'];
  onMouseEnter?: (event: MouseEvent & { currentTarget: EventTarget & HTMLLabelElement; }) => void;
  onMouseLeave?: (event: MouseEvent & { currentTarget: EventTarget & HTMLLabelElement; }) => void;
  /** Один раз вызывает focus при mount; lowercase autofocus сохраняет HTML-поведение. */
  autoFocus?: boolean;
  tabIndex?: number;
  /** Меняет классы; CSS произвольного префикса предоставляет потребитель. */
  prefixCls?: string;
  classNames?: CheckboxSemantic;
  styles?: CheckboxSemantic;
  class?: string;
  rootClassName?: string;
  /** Bindable внутренний span; совпадает с ref.nativeElement. */
  nativeElement?: HTMLSpanElement;
  /** Bindable native input; совпадает с ref.input. */
  inputElement?: HTMLInputElement;
  ref?: CheckboxRef;
}

/**
 * Настройки отдельных Checkbox, включая варианты CheckboxGroup.
 * Root style: config.styles.root, config.style, local styles.root, local style.
 */
export interface CheckboxConfig {
  class?: string;
  style?: string;
  classNames?: CheckboxSemantic;
  styles?: CheckboxSemantic;
}
