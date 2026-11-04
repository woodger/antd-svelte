<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Slider, Input } from 'antd-svelte';
  import { sliderPrefixCases, sliderPrefixTheme } from './slider-prefix-cases';

  let { preset = 'tenant-single', mounted = true, portal = false, styled = false }: {
    preset?: string;
    mounted?: boolean;
    portal?: boolean;
    styled?: boolean;
  } = $props();
  const sample = untrack(() => sliderPrefixCases.find(sample => sample.name === preset)!);
  let prefixOverride = $state<string>();
  let prefix = $derived(prefixOverride ?? sample.prefix);
  let single = $state(0);
  let range = $state([0, 75]);
  let events = $state(0);
  const marks = { 0: 'Low', 75: 'High', 100: 'Max' };
  let tooltip = $derived({
    ...(sample.mode === 'active' ? {} : { open: true }),
    prefixCls: sample.tip,
    getPopupContainer: portal ? () => document.body : undefined
  });
</script>

<ConfigProvider theme={sliderPrefixTheme(sample)} direction={sample.rtl ? 'rtl' : 'ltr'}>
  <form id="prefix-form" onsubmit={event => event.preventDefault()}>
    <div data-slider-prefix-case style="width:420px;height:240px">
      {#if mounted}
        {#if sample.mode === 'single'}
          <Slider range={false} bind:value={single} prefixCls={prefix}
            orientation={sample.vertical ? 'vertical' : 'horizontal'} reverse={sample.reverse}
            disabled={sample.disabled} {tooltip} name="prefix-value"
            marks={sample.noDecorations ? undefined : marks} dots={!sample.noDecorations} step={25}
            style={sample.vertical ? 'height:180px' : 'width:360px'}
            styles={styled || sample.semantic ? { rail: 'height:13px' } : undefined}
            onValueChange={() => events++} />
        {:else}
          <Slider range bind:value={range} prefixCls={prefix}
            orientation={sample.vertical ? 'vertical' : 'horizontal'} reverse={sample.reverse}
            disabled={sample.disabled} {tooltip} name="prefix-value"
            marks={sample.noDecorations ? undefined : marks} dots={!sample.noDecorations} step={25}
            style={sample.vertical ? 'height:180px' : 'width:360px'}
            styles={styled || sample.semantic ? { rail: 'height:13px' } : undefined}
            onValueChange={() => events++} />
        {/if}
      {/if}
    </div>
  </form>
</ConfigProvider>
<button type="button" onclick={() => prefixOverride = 'next-slider'}>Set alternate slider prefix</button>
<button type="button" onclick={() => prefixOverride = ''}>Use default slider prefix</button>
<button type="button" onclick={() => prefixOverride = undefined}>Restore slider prefix</button>
<output aria-label="Prefix value">{sample.mode === 'single' ? single : range.join(',')}</output>
<output aria-label="Prefix events">{events}</output>
<ConfigProvider theme={{ mode: 'dark', primary: 'green' }}>
  <div data-prefix-neighbor style="width:360px">
    <Slider range value={[0, 75]} tooltip={false} />
    <Input aria-label="Prefix neighbor" />
  </div>
</ConfigProvider>
