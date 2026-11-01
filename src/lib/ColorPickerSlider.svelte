<script lang="ts">
  import Slider from './Slider.svelte';
  import { provideSliderInternal, type SliderDragInfo } from './slider-internal-context';
  import { getGradientPercentColor } from './color-picker.engine';

  let {
    prefixCls, colors, value, max, gradient = false, pointColor, activeIndex,
    onChange, onChangeComplete, onActive, onDragStart, onDragChange, onKeyDelete
  }: {
    prefixCls: string;
    colors: readonly { color: string; percent: number; }[];
    value: number[];
    max: number;
    gradient?: boolean;
    pointColor?: string;
    activeIndex?: number;
    onChange?: (values: number[]) => void;
    onChangeComplete: (values: number[]) => void;
    onActive?: (index: number) => void;
    onDragStart?: (info: SliderDragInfo) => void;
    onDragChange?: (info: SliderDragInfo) => void;
    onKeyDelete?: (index: number) => void;
  } = $props();
  provideSliderInternal({
    controlled: true,
    direction: 'ltr',
    handleClass: index => activeIndex === index ? `${prefixCls}-slider-handle-active` : '',
    handleStyle: (_, point) => gradient
      ? `background:${getGradientPercentColor(colors, point)}` : '',
    onFocus: index => onActive?.(index),
    onDragStart: info => onDragStart?.(info),
    onDragChange: info => onDragChange?.(info),
    get onKeyDelete() { return onKeyDelete; }
  });
  let background = $derived(`linear-gradient(90deg, ${colors
    .map(entry => `${entry.color} ${entry.percent}%`).join(', ')})`);
</script>

<Slider range={{ editable: gradient, minCount: 2 }} {value} min={0} {max}
  track={false} tooltip={{ open: false }}
  class={`${prefixCls}-slider${gradient ? ` ${prefixCls}-gradient-slider` : ''}`}
  classNames={{ rail: `${prefixCls}-slider-rail`, handle: `${prefixCls}-slider-handle` }}
  styles={{ rail: `background:${background}`, handle: pointColor ? `background:${pointColor}` : '' }}
  ariaLabelForHandle={gradient ? 'Gradient stop' : max === 359 ? 'Hue' : 'Alpha'}
  {onChange} {onChangeComplete} />
