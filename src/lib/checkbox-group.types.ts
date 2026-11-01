import type { Snippet } from 'svelte';
import type { HTMLFieldsetAttributes } from 'svelte/elements';
import type { CheckboxChangeEvent, CheckboxContent } from './checkbox.types';

export type CheckboxGroupValue = string | number | boolean;

export interface CheckboxGroupOption<Value extends CheckboxGroupValue = string> {
  value: Value;
  label: CheckboxContent;
  disabled?: boolean;
  id?: string;
  title?: string;
  className?: string;
  style?: string;
  required?: boolean;
  onChange?: (event: CheckboxChangeEvent) => void;
}

/** Типизированный массив значений и независимые нативные checkbox для FormData. */
export interface CheckboxGroupProps<Value extends CheckboxGroupValue = string> extends Omit<
  HTMLFieldsetAttributes,
  'children' | 'class' | 'onchange'
> {
  /** Непустые options перекрывают children; nullish entries/values пропускаются. */
  options?: readonly (Value | CheckboxGroupOption<Value> | null | undefined)[];
  children?: Snippet;
  /** Bindable state: options нормализуют его, children сохраняют raw-массив как в upstream. */
  value?: Value[] | undefined;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: readonly Value[];
  /** Alias отфильтрованного callback; массив не разделяется с bind:value. */
  onValueChange?: (value: Value[]) => void;
  /** Массив доступных зарегистрированных значений; вызывается перед onValueChange. */
  onChange?: (value: Value[]) => void;
  prefixCls?: string;
  rootClassName?: string;
  /** Bindable fieldset с прежними native form/reset/disabled контрактами. */
  nativeElement?: HTMLFieldSetElement;
  class?: string;
}
