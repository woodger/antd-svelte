<script module lang="ts">
  import type { ColorPickerProps } from 'antd-svelte';

  export interface ColorPickerPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    local?: string;
    variablePrefix?: string;
    aliases?: boolean;
    rtl?: boolean;
    size?: ColorPickerProps['size'];
    format?: ColorPickerProps['format'];
    disabled?: boolean;
    cleared?: boolean;
    gradient?: boolean;
    modes?: boolean;
    disabledAlpha?: boolean;
    disabledFormat?: boolean;
    noPresets?: boolean;
    closed?: boolean;
    priority?: boolean;
    portal?: boolean;
    custom?: boolean;
  }
</script>

<script lang="ts">
  import { ColorPicker, type ColorValue } from 'antd-svelte';

  let { sample, rootPrefix, local = true }: {
    sample: ColorPickerPrefixSample;
    rootPrefix: string;
    local?: boolean;
  } = $props();
  let prefix = $derived(local && sample.local || `${rootPrefix}-color-picker`);
  const gradient: ColorValue = [
    { color: '#1677ff', percent: 0 }, { color: '#fa541c', percent: 100 }
  ];
  const presets = [{
    label: 'Stored colors', colors: ['#1677ff', '#fa541c', '#00000055', '#ffffff55']
  }];
  let events = $state<string[]>([]);
  let color = $state('#1677ff');
  let open = $state(true);
</script>

<section data-color-prefix-host data-color-prefix={prefix} data-root-prefix={rootPrefix}
  style="width:800px;padding:16px;color:rgb(1,2,3)">
  <ColorPicker prefixCls={local ? sample.local : undefined} class="fixture-color-prefix"
    classNames={{ popup: { root: 'fixture-color-prefix-popup' } }}
    defaultValue={sample.gradient ? gradient : sample.cleared ? '' : '#1677ff'}
    mode={sample.modes ? ['single', 'gradient'] : sample.gradient ? 'gradient' : 'single'}
    format={sample.format} size={sample.size} disabled={sample.disabled}
    disabledAlpha={sample.disabledAlpha} disabledFormat={sample.disabledFormat}
    showText open={!sample.closed && open} allowClear
    presets={sample.noPresets ? undefined : presets}
    getPopupContainer={sample.portal ? () => document.getElementById('color-prefix-portal')! : undefined}
    style={sample.priority ? 'padding-top:13px;color:green' : undefined}
    styles={sample.priority ? {
      description: 'color:#cf1322', popup: { root: 'color:#389e0d' }
    } : undefined}
    children={sample.custom ? trigger : undefined}
    aria-label="Prefix color"
    onOpenChange={next => { open = next; events.push(`open:${next}`); }}
    onChange={next => { color = next.toCssString(); events.push(`change:${color}`); }}
    onChangeComplete={next => events.push(`complete:${next.toCssString()}`)}>
  </ColorPicker>
  <output aria-label="ColorPicker prefix events">{events.join('|')}</output>
  <output aria-label="ColorPicker prefix value">{color}</output>
</section>

{#snippet trigger()}
  <button type="button" aria-label="Custom prefix color">Custom color</button>
{/snippet}
