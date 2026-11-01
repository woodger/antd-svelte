import type { Snippet } from 'svelte';
import type { HTMLFieldsetAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export type RadioValue = string | number | boolean;
export type RadioContent = string | number | null | undefined | Snippet;

export interface RadioSemanticSlots {
  root?: string;
  icon?: string;
  label?: string;
}

/** Функция получает фактические Svelte checked/disabled/value/name, включая локальное состояние. */
export type RadioSemantic = RadioSemanticSlots | ((info: { props: RadioProps; }) => RadioSemanticSlots);

/** Событие Ant Design с исходным типом value; nativeEvent — настоящий DOM change. */
export interface RadioChangeEvent<Value extends RadioValue = RadioValue> {
  target: Omit<RadioProps, 'value'> & { value: Value; checked: boolean; type: 'radio'; };
  nativeEvent: Event;
  stopPropagation(): void;
  preventDefault(): void;
}

/** Ref rc-checkbox: ссылки очищаются при unmount; методы используют native input. */
export interface RadioRef {
  input: HTMLInputElement;
  nativeElement: HTMLSpanElement;
  focus(options?: FocusOptions): void;
  blur(): void;
}

/** Нативный radio с типизированным value и bind:checked вне RadioGroup. */
export interface RadioProps extends Omit<
  HTMLInputAttributes,
  'type' | 'value' | 'checked' | 'children' | 'class' | 'size'
> {
  /** @defaultValue 'on' */
  value?: RadioValue;
  /** Поддерживает bind:checked. */
  checked?: boolean | undefined;
  /** @defaultValue false */
  defaultChecked?: boolean;
  children?: Snippet;
  onCheckedChange?: (checked: boolean) => void;
  /** Вызывается до onChange группы; нативный onchange получает отдельное DOM-событие. */
  onChange?: (event: RadioChangeEvent) => void;
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
  /** Меняет классы; стили произвольного префикса предоставляет потребитель. */
  prefixCls?: string;
  classNames?: RadioSemantic;
  styles?: RadioSemantic;
  class?: string;
  rootClassName?: string;
  /** Bindable внутренний span; совпадает с ref.nativeElement и очищается при unmount. */
  nativeElement?: HTMLSpanElement;
  /** Bindable native input; совпадает с ref.input и очищается при unmount. */
  inputElement?: HTMLInputElement;
  ref?: RadioRef;
}

/** Radio с кнопочным оформлением; использует состояние, native input и refs Radio. */
export type RadioButtonProps = RadioProps;

export interface RadioOption<Value extends RadioValue = string> {
  value: Value;
  label: RadioContent;
  disabled?: boolean;
  id?: string;
  title?: string;
  style?: string;
  className?: string;
  required?: boolean;
  onChange?: (event: RadioChangeEvent) => void;
}

/** Одиночный выбор типизированного значения через независимую группу native radio. */
export interface RadioGroupProps<Value extends RadioValue = string> extends Omit<
  HTMLFieldsetAttributes,
  'children' | 'class' | 'onchange'
> {
  /** Непустые options имеют приоритет над children; пустой массив оставляет snippet. */
  options?: readonly (Value | RadioOption<Value>)[];
  children?: Snippet;
  /** Поддерживает bind:value. */
  value?: Value | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: Value;
  required?: boolean;
  /** @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Alias вертикального расположения; явный orientation имеет приоритет. */
  vertical?: boolean;
  /** Button меняет оформление Radio; заданный group optionType перекрывает RadioButton. */
  optionType?: 'default' | 'button';
  /** Только appearance; наследует ConfigProvider.componentSize. */
  size?: ComponentSize;
  /** Стиль кнопочного режима, по умолчанию outline. */
  buttonStyle?: 'outline' | 'solid';
  /** По умолчанию false; растягивает группу и равномерно распределяет варианты. */
  block?: boolean;
  onValueChange?: (value: Value) => void;
  /** Вызывается только при смене значения, перед onValueChange. */
  onChange?: (event: RadioChangeEvent<Value>) => void;
  /** Получают всплывающие focusin/focusout дочернего native input. */
  onFocus?: HTMLFieldsetAttributes['onfocusin'];
  onBlur?: HTMLFieldsetAttributes['onfocusout'];
  onMouseEnter?: HTMLFieldsetAttributes['onmouseenter'];
  onMouseLeave?: HTMLFieldsetAttributes['onmouseleave'];
  /** Применяется к группе и Radio из options; children задают свой prefixCls. */
  prefixCls?: string;
  /** Bindable fieldset; сохраняет нативные disabled, validation и form association. */
  nativeElement?: HTMLFieldSetElement;
  class?: string;
  rootClassName?: string;
}

/**
 * Настройки отдельных Radio/RadioButton, включая варианты внутри RadioGroup.
 * Root style: config.styles.root, config.style, local styles.root, local style.
 */
export interface RadioConfig {
  class?: string;
  style?: string;
  classNames?: RadioSemantic;
  styles?: RadioSemantic;
}
