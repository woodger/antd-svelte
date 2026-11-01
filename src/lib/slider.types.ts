import type { HTMLInputAttributes } from 'svelte/elements';
import type { SliderTooltipConfig } from './tooltip.types';
import type { SliderRangeConfig, SliderRangeProps, SliderRef } from './slider-range.types';

/** Одиночное числовое значение с pointer/keyboard взаимодействием и bind:value. */
export interface SliderSingleProps extends Omit<
  HTMLInputAttributes,
  'value'
  | 'defaultValue'
  | 'type'
  | 'min'
  | 'max'
  | 'step'
  | 'size'
  | 'class'
  | 'children'
  | 'readonly'
> {
  /** Поддерживает bind:value. */
  value?: number | undefined;
  range?: false;
  ref?: SliderRef;
  nativeElement?: HTMLDivElement;
  /** @defaultValue 0 */
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** @defaultValue false */
  reverse?: boolean;
  /** @defaultValue true */
  keyboard?: boolean;
  tooltip?: false | SliderTooltipConfig;
  onValueChange?: (value: number) => void;
  /** Один callback после завершённого изменения; отменённое взаимодействие не публикуется. */
  onChangeComplete?: (value: number) => void;
  class?: string;
}

type SliderRangeExtraKeys = Exclude<keyof SliderRangeProps, keyof SliderSingleProps>;
type SliderRangeExtras<Range> = {
  [Key in SliderRangeExtraKeys]?: Range extends false ? never : SliderRangeProps[Key];
};

type SliderNativeProps = Omit<SliderSingleProps,
  'range' | 'value' | 'defaultValue' | 'onValueChange' | 'onChangeComplete' | 'disabled' | 'step'
>;
export type SliderValue<Range> = Range extends false ? number : number[] | null;
type SliderChangeValue<Range> = Range extends false ? number : number[];

interface SliderValueProps<Range extends boolean | SliderRangeConfig> extends SliderNativeProps {
  value?: SliderValue<Range>;
  defaultValue?: SliderValue<Range>;
  onValueChange?: (value: SliderChangeValue<Range>) => void;
  onChangeComplete?: (value: SliderChangeValue<Range>) => void;
  disabled?: SliderSingleProps['disabled'] | (Range extends false ? never : readonly boolean[]);
  step?: number | (Range extends false ? never : null);
}

/** Range=true/config выбирает массив; default generic сохраняет прежние scalar callbacks. */
export type SliderProps<Range extends boolean | SliderRangeConfig = false> =
  SliderValueProps<Range> & SliderRangeExtras<Range>
    & (Range extends false ? { range?: false; } : { range: Range; });
