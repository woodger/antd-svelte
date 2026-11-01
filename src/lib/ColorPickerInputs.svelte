<script lang="ts">
  import { untrack } from 'svelte';
  import Input from './Input.svelte';
  import InputNumber from './InputNumber.svelte';
  import Select from './Select.svelte';
  import { toHexFormat, type AggregationColor } from './color';
  import { generateColor, getColorAlpha, type ColorFormat } from './color-picker.engine';

  let { prefixCls, value, format, disabledAlpha, disabledFormat, onFormatChange, onChange }: {
    prefixCls: string;
    value: AggregationColor;
    format?: ColorFormat;
    disabledAlpha?: boolean;
    disabledFormat?: boolean;
    onFormatChange: (format: ColorFormat) => void;
    onChange: (value: AggregationColor) => void;
  } = $props();
  let hex = $state(untrack(() => toHexFormat(value.toHexString())));
  let colorFormat = $derived(format ?? 'hex');

  $effect.pre(() => {
    hex = toHexFormat(value.toHexString());
  });

  function handleHex(input: string) {
    hex = toHexFormat(input);
    if (/^(?:[\da-f]{6}|[\da-f]{8})$/i.test(toHexFormat(input, true))) {
      onChange(generateColor(input));
    }
  }

  function handleChannel(channel: 'r' | 'g' | 'b' | 'h' | 's', number: number | null) {
    if (colorFormat === 'rgb') {
      onChange(generateColor({ ...value.toRgb(), [channel]: number || 0 }));
    } else {
      onChange(generateColor({ ...value.toHsb(),
        [channel]: channel === 'h' ? number || 0 : (number || 0) / 100 }));
    }
  }
</script>

<style>
  .color-fields :global(.ant-color-picker-format-select > .ant-select) { padding: 0; border: 0; background: transparent; box-shadow: none; gap: 0; font-size: var(--ant-font-size-sm); line-height: var(--ant-control-height-sm); height: calc(var(--ant-font-size) + 10px); }
  .color-fields :global(.ant-color-picker-format-select .ant-select-content) { flex: none; width: auto; margin-inline-end: var(--ant-margin-xxs); }
  .color-fields :global(.ant-color-picker-format-select .ant-select-input) { width: 3ch; }
  @supports (field-sizing: content) {
    .color-fields :global(.ant-color-picker-format-select .ant-select-input) { field-sizing: content; width: auto; }
  }
  .color-fields :global(.ant-input-number-sm) { height: calc(var(--ant-font-size) + 10px); }
  .color-fields :global(.ant-color-picker-hsb-input .ant-input-number-input),
  .color-fields :global(.ant-color-picker-rgb-input .ant-input-number-input) { height: calc(var(--ant-font-size-sm) + 8px); }
</style>

<div class={[`${prefixCls}-input-container`, 'color-fields']}>
  {#if !disabledFormat}
    <Select bind:value={() => colorFormat, () => {}} size="small" aria-label="Color format"
      class={`${prefixCls}-format-select`}
      style="min-width:0;width:max-content;flex:none;margin-inline-end:var(--ant-margin-xs)"
      options={['hex', 'hsb', 'rgb'].map(value => ({ value, label: value.toUpperCase() }))}
      onValueChange={next => onFormatChange(next as ColorFormat)} />
  {/if}
  <div class={`${prefixCls}-input`}>
    {#if colorFormat === 'hex'}
      <Input value={hex} onValueChange={handleHex} prefix="#" aria-label="Hex color"
        class={`${prefixCls}-hex-input`} size="small" />
    {:else}
      <div class={`${prefixCls}-${colorFormat}-input`}>
        {#each colorFormat === 'rgb' ? ['r', 'g', 'b'] as const : ['h', 's', 'b'] as const as channel}
          {@const number = colorFormat === 'rgb' ? value.toRgb()[channel as 'r' | 'g' | 'b']
            : value.toHsb()[channel as 'h' | 's' | 'b'] * (channel === 'h' ? 1 : 100)}
          <InputNumber bind:value={() => number, () => {}} min={0}
            max={colorFormat === 'rgb' ? 255 : channel === 'h' ? 360 : 100}
            size="small" aria-label={`Color ${channel}`}
            class={`${prefixCls}-steppers ${prefixCls}-${colorFormat}-input`}
            formatter={colorFormat === 'hsb' ? point => `${Math.round(Number(point || 0))}${channel === 'h' ? '' : '%'}` : undefined}
            onValueChange={next => handleChannel(channel, next)} />
        {/each}
      </div>
    {/if}
  </div>
  {#if !disabledAlpha}
    <InputNumber bind:value={() => getColorAlpha(value), () => {}} size="small" min={0} max={100}
      class={`${prefixCls}-steppers ${prefixCls}-alpha-input`} aria-label="Color alpha"
      formatter={point => `${point}%`}
      onValueChange={point => onChange(generateColor({ ...value.toHsb(), a: (point || 0) / 100 }))} />
  {/if}
</div>
