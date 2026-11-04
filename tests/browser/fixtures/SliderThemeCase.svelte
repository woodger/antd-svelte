<script lang="ts">
  import { ConfigProvider, Slider, Input } from 'antd-svelte';
  import type { ThemeConfig } from 'antd-svelte';
  import { sliderThemePresets } from './slider-theme-presets';

  let {
    preset = 'default',
    enabled = true,
    disabled = false,
    inherited = true,
    hashed = true,
    rtl = false,
    mounted = true,
    railSize,
    priority = false
  }: {
    preset?: string;
    enabled?: boolean;
    disabled?: boolean;
    inherited?: boolean;
    hashed?: boolean;
    rtl?: boolean;
    mounted?: boolean;
    railSize?: number;
    priority?: boolean;
  } = $props();
  let single = $state(50);
  let range = $state([25, 75]);
  let changes = $state(0);
  let config = $derived<ThemeConfig>({
    ...sliderThemePresets[preset],
    token: { ...sliderThemePresets[preset]?.token, motion: false },
    cssVar: { ...sliderThemePresets[preset]?.cssVar, key: 'slider-theme-scope' },
    components: {
      ...sliderThemePresets[preset]?.components,
      Slider: {
        ...sliderThemePresets[preset]?.components?.Slider,
        ...(railSize === undefined ? {} : { railSize })
      }
    },
    hashed
  });
</script>

{#if mounted}
  <ConfigProvider theme={enabled ? config : undefined} direction={rtl ? 'rtl' : 'ltr'}>
    <div style="display:flex;flex-wrap:wrap">
      <div data-slider-theme="single-horizontal" style="width:300px;height:180px">
        <Slider bind:value={single} {disabled} tooltip={false} onValueChange={() => changes++}
          style={priority ? '--ant-slider-rail-size:11px' : undefined} />
      </div>
      <div data-slider-theme="single-vertical" style="width:300px;height:180px">
        <Slider bind:value={single} orientation="vertical" {disabled} tooltip={false}
          onValueChange={() => changes++} />
      </div>
      <div data-slider-theme="range-horizontal" style="width:300px;height:180px">
        <Slider range bind:value={range} marks={{ 0: '0', 50: '50', 100: '100' }} dots step={25}
          {disabled} tooltip={false} onValueChange={() => changes++}
          styles={priority ? { root: '--ant-slider-rail-size:9px', rail: 'height:13px' } : undefined}
          style={priority ? '--ant-slider-rail-size:11px' : undefined} />
      </div>
      <div data-slider-theme="range-vertical" style="width:300px;height:180px">
        <Slider range bind:value={range} orientation="vertical"
          marks={{ 0: '0', 50: '50', 100: '100' }} dots step={25}
          {disabled} tooltip={false} onValueChange={() => changes++} />
      </div>
    </div>
    <ConfigProvider theme={{ inherit: inherited, cssVar: { key: 'slider-child-scope' },
      components: { Slider: { railSize: 9 } } }}>
      <div data-slider-theme="nested" style="width:300px;height:40px">
        <Slider defaultValue={50} tooltip={false} />
      </div>
    </ConfigProvider>
    <Input aria-label="Slider token neighbor" />
  </ConfigProvider>
{/if}
<div data-slider-theme="outside" style="width:300px;height:40px">
  <Slider defaultValue={50} tooltip={false} />
</div>
<ConfigProvider theme={{ cssVar: { key: 'slider-sibling-scope' },
  components: { Slider: { railSize: 7 } } }}>
  <div data-slider-theme="sibling" style="width:300px;height:40px">
    <Slider defaultValue={50} tooltip={false} />
  </div>
</ConfigProvider>
<output aria-label="Slider theme value">{single}</output>
<output aria-label="Slider theme range">{range.join(',')}</output>
<output aria-label="Slider theme changes">{changes}</output>
