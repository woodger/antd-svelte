import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { InputVariant } from './input.types';

export type InputNumberValue = number | string;
export type InputNumberContent = string | number | null | undefined | Snippet;
export interface InputNumberFocusOptions extends FocusOptions {
  cursor?: 'start' | 'end' | 'all';
}

/** Proxy native input; nativeElement относится к корню control, включая prefix/suffix. */
export interface InputNumberRef extends HTMLInputElement {
  focus(options?: InputNumberFocusOptions): void;
  nativeElement: HTMLElement;
}

export interface InputNumberStepInfo {
  offset: InputNumberValue;
  type: 'up' | 'down';
  emitter: 'handler' | 'keyboard' | 'wheel';
}

export interface InputNumberSlots {
  root?: string;
  prefix?: string;
  suffix?: string;
  input?: string;
  actions?: string;
  action?: string;
}

export type InputNumberSemantic = InputNumberSlots | ((info: {
  props: InputNumberProps<InputNumberValue>;
}) => InputNumberSlots);

type InputNumberEvent<EventType extends Event> = EventType & {
  currentTarget: EventTarget & HTMLInputElement;
};

/** Число/null по умолчанию; stringMode сохраняет десятичные строки без Number conversion. */
export interface InputNumberProps<Value extends InputNumberValue = number> extends Omit<
  HTMLInputAttributes,
  'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'size' | 'class' | 'type'
  | 'children' | 'prefix' | 'style'
> {
  /** Поддерживает bind:value; function binding позволяет отклонять изменения владельцем. */
  value?: Value | null;
  /** Читается при создании; native reset восстанавливает это значение без callbacks. */
  defaultValue?: Value | null;
  /** В stringMode callbacks возвращают string/null; используйте InputNumberProps<string>. */
  stringMode?: boolean;
  min?: InputNumberValue;
  max?: InputNumberValue;
  step?: InputNumberValue;
  precision?: number;
  decimalSeparator?: string;
  /** Formatter получает строковое число и исходный ввод; precision не обрезает ввод при typing. */
  formatter?: (
    value: InputNumberValue | undefined,
    info: { userTyping: boolean; input: string; }
  ) => string;
  parser?: (value: string | undefined) => InputNumberValue;
  controls?: boolean | { upIcon?: InputNumberContent; downIcon?: InputNumberContent; };
  keyboard?: boolean;
  /** Колесо изменяет значение только у поля с фокусом; по умолчанию false. */
  changeOnWheel?: boolean;
  /** По умолчанию true; false сохраняет черновик при blur, Enter по-прежнему подтверждает его. */
  changeOnBlur?: boolean;
  mode?: 'input' | 'spinner';
  size?: ComponentSize | 'medium';
  status?: 'error' | 'warning';
  variant?: InputVariant;
  /** @deprecated Используйте variant. */
  bordered?: boolean;
  readOnly?: boolean;
  prefix?: InputNumberContent;
  suffix?: InputNumberContent;
  /** @deprecated Используйте SpaceCompact и SpaceAddon. */
  addonBefore?: InputNumberContent;
  /** @deprecated Используйте SpaceCompact и SpaceAddon. */
  addonAfter?: InputNumberContent;
  rootClassName?: string;
  /** Меняет классы; CSS для произвольного префикса предоставляет потребитель. */
  prefixCls?: string;
  class?: string;
  style?: string;
  classNames?: InputNumberSemantic;
  styles?: InputNumberSemantic;
  type?: HTMLInputAttributes['type'];
  autoFocus?: boolean;
  autoComplete?: HTMLInputAttributes['autocomplete'];
  tabIndex?: number;
  maxLength?: number;
  onValueChange?: (value: Value | null) => void;
  onChange?: (value: Value | null) => void;
  /** Вызывается после onChange; аргумент — исходная строка поля. */
  onInput?: (text: string) => void;
  onStep?: (value: Value, info: InputNumberStepInfo) => void;
  onPressEnter?: (event: InputNumberEvent<KeyboardEvent>) => void;
  onFocus?: (event: InputNumberEvent<FocusEvent>) => void;
  onBlur?: (event: InputNumberEvent<FocusEvent>) => void;
  onKeyDown?: (event: InputNumberEvent<KeyboardEvent>) => void;
  onKeyUp?: (event: InputNumberEvent<KeyboardEvent>) => void;
  onMouseDown?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
  onClick?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
  onMouseUp?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
  onMouseLeave?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
  onMouseMove?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
  onMouseEnter?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
  onMouseOut?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
  /** Bindable native input, control root и proxy ref; SSR не создаёт DOM. */
  inputElement?: HTMLInputElement;
  nativeElement?: HTMLDivElement;
  ref?: InputNumberRef;
}

/** Локальные semantic styles перекрывают config; config variant наследуется без локального. */
export interface InputNumberConfig {
  class?: string;
  style?: string;
  variant?: InputVariant;
  classNames?: InputNumberSemantic;
  styles?: InputNumberSemantic;
}
