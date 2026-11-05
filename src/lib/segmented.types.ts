import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TooltipProps } from './tooltip.types';

export type SegmentedValue = string | number;
export interface SegmentedOption<Value extends SegmentedValue = SegmentedValue> {
  value: Value;
  /** Рядом с icon пустая строка не создаёт текстовый span; числовой 0 отображается. */
  label?: string | number | Snippet;
  icon?: Snippet;
  title?: string;
  'aria-label'?: string;
  disabled?: boolean;
  class?: string;
  tooltip?: string | Omit<TooltipProps, 'children'>;
}
export type SegmentedSemanticSlots = Partial<Record<'root' | 'item' | 'label' | 'icon', string>>;
/** Существующие native props: generated name и defaults сохранены, size остаётся локальным prop. */
export interface SegmentedSemanticInfo<Value extends SegmentedValue = SegmentedValue> {
  props: SegmentedProps<Value>;
}
export type SegmentedSemantic<Value extends SegmentedValue = SegmentedValue> = SegmentedSemanticSlots
  | ((info: SegmentedSemanticInfo<Value>) => SegmentedSemanticSlots | undefined);
type SegmentedConfigSemantic = SegmentedSemanticSlots
  | (<Value extends SegmentedValue>(info: SegmentedSemanticInfo<Value>) =>
    SegmentedSemanticSlots | undefined);

/** Наследуемое оформление; явный record целиком заменяет родительский segmented. */
export interface SegmentedConfig {
  class?: string;
  /** Между context styles.root и локальными styles.root/style. */
  style?: string;
  /** Callback принимает те же native props, что локальный semantic callback. */
  classNames?: SegmentedConfigSemantic;
  styles?: SegmentedConfigSemantic;
}
/** Типизированный выбор одного значения через нативные radio в сегментированном control. */
export interface SegmentedProps<Value extends SegmentedValue = SegmentedValue> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style' | 'onchange'
> {
  options: readonly (Value | SegmentedOption<Value>)[];
  /** Поддерживает bind:value. */
  value?: Value;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: Value;
  onChange?: (value: Value) => void;
  /** @defaultValue false */
  disabled?: boolean;
  name?: string;
  /** @defaultValue false */
  block?: boolean;
  size?: ComponentSize | 'medium';
  orientation?: 'horizontal' | 'vertical';
  /** @defaultValue false */
  vertical?: boolean;
  /** @defaultValue 'default' */
  shape?: 'default' | 'round';
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Context slots дополняются локальными; callback сохраняет native props/defaults. */
  classNames?: SegmentedSemantic<Value>;
  styles?: SegmentedSemantic<Value>;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
