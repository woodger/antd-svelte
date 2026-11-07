import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { SliderTooltipConfig } from './tooltip.types';
import type { SliderSingleProps } from './slider.types';

/** Исходные настройки нескольких точек; editable имеет приоритет над draggableTrack. */
export interface SliderRangeConfig {
  editable?: boolean;
  draggableTrack?: boolean;
  minCount?: number;
  maxCount?: number;
}

export type SliderMarkContent = string | number | boolean | null | undefined | Snippet;
export type SliderMarks = Readonly<Record<string | number,
  SliderMarkContent | { label?: SliderMarkContent; style?: string; }
>>;
export type SliderSemanticName = 'root' | 'tracks' | 'track' | 'rail' | 'handle';
export type SliderClassNames = Partial<Record<SliderSemanticName, string>>;
export type SliderStyles = Partial<Record<SliderSemanticName, string>>;
export type SliderSemanticValue<Value, Props = SliderRangeProps> = Value
  | ((info: { props: Props; }) => Value);

/** Общие стили Slider; callbacks различают scalar/range по props.range. */
export interface SliderConfig {
  class?: string;
  style?: string;
  classNames?: SliderSemanticValue<SliderClassNames, SliderSingleProps | SliderRangeProps>;
  styles?: SliderSemanticValue<SliderStyles, SliderSingleProps | SliderRangeProps>;
}

/** Методы доступны после mount; nativeElement указывает на корень Slider. */
export interface SliderRef {
  readonly nativeElement: HTMLDivElement | undefined;
  focus: () => void;
  blur: () => void;
}

/**
 * Range API Ant Design. Bind:value — Svelte state; callbacks получают отсортированную копию.
 * Name/form принадлежат нативным range inputs; каждый включённый handle отправляет одно поле.
 */
export interface SliderRangeProps extends Omit<
  HTMLInputAttributes,
  'value' | 'defaultValue' | 'type' | 'min' | 'max' | 'step' | 'size' | 'class'
    | 'children' | 'readonly' | 'disabled'
> {
  range: true | SliderRangeConfig;
  value?: number[] | null;
  /** Фиксируется при создании. Undefined создаёт две точки у min, null/[] — пустой Slider. */
  defaultValue?: number[] | null;
  min?: number;
  max?: number;
  /** Null выравнивает значения только по marks/min/max. @defaultValue 1 */
  step?: number | null;
  marks?: SliderMarks;
  dots?: boolean;
  /** @defaultValue true */
  included?: boolean;
  track?: boolean;
  /** @defaultValue true */
  allowCross?: boolean;
  /** True использует step; при step=null точки выталкиваются к соседним marks. */
  pushable?: boolean | number;
  /** Любая выключенная точка блокирует editable и draggableTrack. */
  disabled?: boolean | readonly boolean[] | null;
  orientation?: 'horizontal' | 'vertical';
  reverse?: boolean;
  keyboard?: boolean;
  autoFocus?: boolean;
  /** Svelte callback после изменения bind:value. */
  onValueChange?: (value: number[]) => void;
  /** Исходный callback; не вызывается для неизменившегося отсортированного набора. */
  onChange?: (value: number[]) => void;
  /** Вызывается и для действий без изменения значения, как в rc-slider. */
  onBeforeChange?: (value: number[]) => void;
  /** Mouse/pointer release, navigation keyup и click mark; Delete не завершает действие. */
  onChangeComplete?: (value: number[]) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  tabIndex?: number | readonly number[];
  ariaLabelForHandle?: string | readonly string[];
  ariaLabelledByForHandle?: string | readonly string[];
  ariaRequired?: boolean;
  ariaValueTextFormatterForHandle?: ((value: number) => string)
    | readonly ((value: number) => string)[];
  tooltip?: false | SliderTooltipConfig;
  prefixCls?: string;
  rootClassName?: string;
  class?: string;
  classNames?: SliderSemanticValue<SliderClassNames>;
  styles?: SliderSemanticValue<SliderStyles>;
  dotStyle?: string | ((value: number) => string);
  activeDotStyle?: string | ((value: number) => string);
  ref?: SliderRef;
  nativeElement?: HTMLDivElement;
}
