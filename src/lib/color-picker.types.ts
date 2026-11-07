import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { AggregationColor } from './color';
import type { ColorMode, ColorFormat, ColorValue } from './color-picker.engine';
import type { ComponentSize } from './types';

export type ColorPickerContent = string | number | null | undefined | Snippet;
export type ColorPickerPlacement = 'top' | 'bottom' | 'left' | 'right'
  | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
export interface ColorPickerSlots {
  root?: string;
  body?: string;
  content?: string;
  description?: string;
  popup?: { root?: string; };
}
export interface ColorPickerStyles extends ColorPickerSlots {
  popupOverlayInner?: string;
}
export type ColorPickerSemantic<T> = T | ((info: { props: ColorPickerProps; }) => T);

/** Точки presets могут быть одиночными цветами или градиентами; defaultOpen читается при mount. */
export interface ColorPickerPreset {
  key?: string | number;
  label: ColorPickerContent;
  colors: readonly Exclude<ColorValue, null>[];
  defaultOpen?: boolean;
}

/** ColorPicker Ant Design; переданные value/open/format остаются под управлением владельца. */
export interface ColorPickerProps extends Omit<HTMLButtonAttributes,
  'value' | 'defaultValue' | 'children' | 'size' | 'style' | 'class' | 'disabled'
> {
  value?: ColorValue;
  /** Начальное значение читается при создании; заданный value имеет приоритет. */
  defaultValue?: ColorValue;
  mode?: ColorMode | readonly ColorMode[];
  open?: boolean;
  disabled?: boolean;
  format?: ColorFormat;
  /** Начальный формат; без format/defaultFormat используется hex. */
  defaultFormat?: ColorFormat;
  allowClear?: boolean;
  /** Убирает Alpha control; исходное условие opacity применяется при следующем изменении. */
  disabledAlpha?: boolean;
  disabledFormat?: boolean;
  presets?: readonly ColorPickerPreset[];
  size?: ComponentSize | 'medium';
  trigger?: 'click' | 'hover';
  placement?: ColorPickerPlacement;
  arrow?: boolean | { pointAtCenter?: boolean; };
  autoAdjustOverflow?: boolean | { adjustX?: 0 | 1; adjustY?: 0 | 1; };
  /** По умолчанию скрытая панель сохраняет состояние; true уничтожает её при закрытии. */
  destroyOnHidden?: boolean;
  /**
   * Локальная функция перекрывает ConfigProvider; undefined сохраняет provider fallback.
   * До первого открытия не вызывается; после destroyOnHidden снова ждёт открытия.
   */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  /** Custom trigger сохраняет собственную native семантику. */
  children?: Snippet;
  showText?: boolean | Snippet<[color: AggregationColor]>;
  /** Picker/Presets — snippets вместо React components, panel — исходная композиция. */
  panelRender?: Snippet<[panel: Snippet, extra: {
    components: { Picker: Snippet; Presets: Snippet; };
  }]>;
  /** CSS всегда RGB или linear-gradient независимо от формата редактора. */
  onChange?: (color: AggregationColor, css: string) => void;
  /** Независимый callback завершения; позволяет принять controlled value только после drag. */
  onChangeComplete?: (color: AggregationColor) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
  onFormatChange?: (format?: ColorFormat) => void;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Меняет классы; CSS для произвольного префикса должен предоставить потребитель. */
  prefixCls?: string;
  classNames?: ColorPickerSemantic<ColorPickerSlots>;
  styles?: ColorPickerSemantic<ColorPickerStyles>;
}

/** Наследуемые стили и arrow; локальные semantic slots имеют приоритет. */
export interface ColorPickerConfig {
  class?: string;
  style?: string;
  arrow?: ColorPickerProps['arrow'];
  classNames?: ColorPickerProps['classNames'];
  styles?: ColorPickerProps['styles'];
}

export interface ColorPickerLocale {
  presetEmpty: string;
  transparent: string;
  singleColor: string;
  gradientColor: string;
}

/** Приватная граница композиции panelRender; каждый Picker имеет собственный drag/preview. */
export interface ColorPickerPanelProps {
  prefixCls: string;
  value: AggregationColor;
  mode: ColorMode;
  modes: readonly ColorMode[];
  format?: ColorFormat;
  props: ColorPickerProps;
  activeIndex?: number;
  dragging?: boolean;
  onChange: (color: AggregationColor, drag?: boolean) => void;
  onComplete: (color: AggregationColor) => void;
  onMode: (mode: ColorMode) => void;
  onFormat: (format: ColorFormat) => void;
}
