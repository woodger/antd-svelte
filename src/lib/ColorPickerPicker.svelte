<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { AggregationColor } from './color';
  import { ColorCore } from './color-core.engine';
  import {
    calculatePickerColor, fillPickerColor, generateColor, getGradientPercentColor,
    getPickerColors, type ColorMode
  } from './color-picker.engine';
  import { colorPickerRuRU } from './color-picker.locale';
  import { connectSliderRangeDrag } from './slider-range.dom';
  import type { SliderDragInfo } from './slider-internal-context';
  import type { ColorPickerPanelProps } from './color-picker.types';
  import ColorPickerSlider from './ColorPickerSlider.svelte';
  import ColorPickerInputs from './ColorPickerInputs.svelte';
  import Segmented from './Segmented.svelte';

  let { prefixCls, value, mode, modes, format, props, onChange, onComplete, onMode, onFormat,
    activeIndex = $bindable(0), dragging = $bindable(false) }: ColorPickerPanelProps = $props();
  const config = useConfig();
  let locale = $derived({ ...colorPickerRuRU, ...config.locale.colorPicker });
  let colors = $derived(getPickerColors(value));
  let lockedColor = $state.raw<AggregationColor | undefined>(untrack(() => value));
  let active = $derived(value.isGradient()
    ? dragging ? lockedColor : colors[activeIndex]?.color : value);
  let pickerColor = $state.raw(untrack(() => active ?? generateColor('#1677ff')));
  let picker = $derived(pickerColor.equals(active ?? null) ? active! : pickerColor);
  let previousHex = untrack(() => active?.toHexString());
  let forceSync = $state(0);
  let previousSync = 0;
  let colorList = $derived(colors.map(entry => ({
    percent: entry.percent, color: entry.color.toRgbString()
  })));
  let dragColors: { percent: number; color: string; }[] = [];
  let gesture: (() => void) | undefined;
  let select = $state<HTMLDivElement>();
  let handler = $state<HTMLButtonElement>();
  const hueColors = [
    ['rgb(255, 0, 0)', 0], ['rgb(255, 255, 0)', 17], ['rgb(0, 255, 0)', 33],
    ['rgb(0, 255, 255)', 50], ['rgb(0, 0, 255)', 67], ['rgb(255, 0, 255)', 83],
    ['rgb(255, 0, 0)', 100]
  ].map(([color, percent]) => ({ color: color as string, percent: percent as number }));

  $effect.pre(() => {
    void dragging;
    if (value.isGradient()) lockedColor = colors[activeIndex]?.color;
  });

  $effect.pre(() => {
    const hex = active?.toHexString();
    if (hex !== previousHex || forceSync !== previousSync) {
      pickerColor = active ?? generateColor('#1677ff');
      previousHex = hex;
      previousSync = forceSync;
    }
  });

  onDestroy(() => gesture?.());

  function fill(color: AggregationColor | ColorCore, info?: {
    type?: 'hue' | 'alpha'; value?: number;
  }) {
    return fillPickerColor(value, mode, activeIndex, color, info);
  }

  function changePicker(color: AggregationColor | ColorCore, info?: {
    type?: 'hue' | 'alpha'; value?: number;
  }) {
    const next = fill(color, info);
    pickerColor = next.isGradient() ? next.getColors()[activeIndex].color : next;
    onChange(next, true);
  }

  function completePicker(color: AggregationColor | ColorCore) {
    onComplete(fill(color));
    forceSync++;
  }

  function handlePalette(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    gesture?.();
    handler?.focus();
    let candidate = picker;
    function update(point: PointerEvent) {
      const bounds = select!.getBoundingClientRect();
      candidate = calculatePickerColor(picker,
        (point.clientX - bounds.left) / bounds.width, (point.clientY - bounds.top) / bounds.height);
      changePicker(candidate);
    }
    update(event);
    gesture = connectSliderRangeDrag(event.currentTarget as HTMLElement, event, update, () => {
      gesture = undefined;
      completePicker(candidate);
    }, () => { gesture = undefined; });
  }

  function handlePaletteKey(event: KeyboardEvent) {
    const hsb = picker.toHsb();
    const horizontal = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    const vertical = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    if (!horizontal && !vertical) return;
    event.preventDefault();
    const next = calculatePickerColor(picker, hsb.s + horizontal / 100, 1 - hsb.b - vertical / 100);
    changePicker(next);
    completePicker(next);
  }

  function handleDragStart(info: SliderDragInfo) {
    dragColors = [...colorList];
    if (info.rawValues.length > colorList.length) {
      dragColors.splice(info.draggingIndex, 0, {
        percent: info.draggingValue,
        color: getGradientPercentColor(colorList, info.draggingValue)
      });
    }
    dragging = true;
    onChange(generateColor([...dragColors].sort((a, b) => a.percent - b.percent)), true);
  }

  function handleDragChange(info: SliderDragInfo) {
    const next = [...dragColors];
    if (info.deleteIndex !== undefined && info.deleteIndex !== -1) next.splice(info.deleteIndex, 1);
    else {
      next[info.draggingIndex] = { ...next[info.draggingIndex], percent: info.draggingValue };
      next.sort((a, b) => a.percent - b.percent);
    }
    onChange(generateColor(next), true);
  }

  function deletePoint(index: number) {
    const next = [...colorList];
    next.splice(index, 1);
    const color = generateColor(next);
    onChange(color);
    onComplete(color);
  }

  function clear() {
    if (value.cleared || props.disabled) return;
    const next = generateColor({ ...value.toHsb(), a: 0 });
    next.cleared = true;
    onChange(next);
    props.onClear?.();
  }
</script>

<style>
  .color-picker-palette { touch-action: none; }
  .color-picker-point { padding: 0; color: inherit; font: inherit; }
  .color-picker-point:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .color-picker-clear { padding: 0; background: transparent; }
</style>

  {#if props.allowClear || modes.length > 1}
    <div class={`${prefixCls}-operation`}>
      {#if modes.length > 1}
        <Segmented bind:value={() => mode, () => {}} size="small" name="" options={modes.map(value => ({ value,
          label: value === 'single' ? locale.singleColor : locale.gradientColor }))}
          onChange={next => onMode(next as ColorMode)} />
      {/if}
      {#if props.allowClear}
        <button type="button" class={[`${prefixCls}-clear`, 'color-picker-clear']}
          aria-label="Clear color" disabled={props.disabled} onclick={clear}></button>
      {/if}
    </div>
  {/if}
  {#if mode === 'gradient'}
    <ColorPickerSlider {prefixCls} colors={colorList} value={colorList.map(entry => entry.percent)}
      max={100} gradient {activeIndex} onActive={index => { activeIndex = index; }}
      onDragStart={handleDragStart} onDragChange={handleDragChange} onKeyDelete={deletePoint}
      onChangeComplete={values => {
        onComplete(generateColor(colorList));
        if (activeIndex >= values.length) activeIndex = values.length - 1;
        dragging = false;
      }} />
  {/if}
  <div class={`${prefixCls}-panel`}>
    <!-- svelte-ignore a11y_no_static_element_interactions (Двумерный palette делегирует клавиатуру native handler button.) -->
    <div bind:this={select} class={[`${prefixCls}-select`, 'color-picker-palette']}
      onpointerdown={handlePalette}>
      <div class={`${prefixCls}-palette`} style="position:relative">
        <div style={`position:absolute;left:${picker.toHsb().s * 100}%;top:${(1 - picker.toHsb().b) * 100}%;z-index:1;transform:translate(-50%,-50%)`}>
          <button bind:this={handler} type="button" aria-label="Saturation and brightness"
            class={[`${prefixCls}-handler`, 'color-picker-point']}
            style={`background-color:${picker.toRgbString()}`} onkeydown={handlePaletteKey}></button>
        </div>
        <div class={`${prefixCls}-saturation`}
          style={`background-color:hsl(${picker.toHsb().h},100%,50%);background-image:linear-gradient(0deg,#000,transparent),linear-gradient(90deg,#fff,hsla(0,0%,100%,0))`}></div>
      </div>
    </div>
    <div class={`${prefixCls}-slider-container`}>
      <div class={[`${prefixCls}-slider-group`, props.disabledAlpha && `${prefixCls}-slider-group-disabled-alpha`]}>
        <ColorPickerSlider {prefixCls} colors={hueColors} value={[picker.toHsb().h]} max={359}
          pointColor={`hsl(${picker.toHsb().h},100%,50%)`}
          onChange={values => changePicker(new ColorCore(picker.toHsb()).setHue(values[0]),
            { type: 'hue', value: values[0] })}
          onChangeComplete={values => completePicker(new ColorCore(picker.toHsb()).setHue(values[0]))} />
        {#if !props.disabledAlpha}
          <ColorPickerSlider {prefixCls} value={[picker.toHsb().a * 100]} max={100}
            colors={[{ percent: 0, color: 'rgba(255,0,4,0)' },
              { percent: 100, color: new ColorCore(picker.toHsb()).setA(1).toRgbString() }]}
            pointColor={picker.toRgbString()}
            onChange={values => changePicker(new ColorCore(picker.toHsb()).setA(values[0] / 100),
              { type: 'alpha', value: values[0] })}
            onChangeComplete={values => completePicker(new ColorCore(picker.toHsb()).setA(values[0] / 100))} />
        {/if}
      </div>
      <div class={`${prefixCls}-color-block`}><div class={`${prefixCls}-color-block-inner`}
        style={`background:${picker.toRgbString()}`}></div></div>
    </div>
  </div>
  <ColorPickerInputs {prefixCls} value={active ?? generateColor('#000')} {format}
    disabledAlpha={props.disabledAlpha} disabledFormat={props.disabledFormat}
    onFormatChange={onFormat} onChange={color => onChange(fill(color))} />
