import type { Snippet } from 'svelte';
import type { HTMLFieldsetAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';

export type RadioValue = string | number | boolean;

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
  class?: string;
  rootClassName?: string;
  /** Внутренний span RcCheckbox вместо React RadioRef.nativeElement; очищается при unmount. */
  nativeElement?: HTMLSpanElement;
  /** Нативный input для focus/blur вместо методов React ref. */
  inputElement?: HTMLInputElement;
}

/** Radio с кнопочным оформлением; использует состояние, native input и refs Radio. */
export type RadioButtonProps = RadioProps;

export interface RadioOption<Value extends RadioValue = string> {
  value: Value;
  label: string;
  disabled?: boolean;
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
  /** Button меняет оформление Radio; заданный group optionType перекрывает RadioButton. */
  optionType?: 'default' | 'button';
  /** Только appearance; наследует ConfigProvider.componentSize. */
  size?: ComponentSize;
  /** Стиль кнопочного режима, по умолчанию outline. */
  buttonStyle?: 'outline' | 'solid';
  /** По умолчанию false; растягивает группу и равномерно распределяет варианты. */
  block?: boolean;
  onValueChange?: (value: Value) => void;
  class?: string;
  rootClassName?: string;
}
