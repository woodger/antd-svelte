<script lang="ts">
  import { ConfigProvider, Tooltip, Popover, Popconfirm, AvatarGroup, Slider } from 'antd-svelte';
  import type { OverlayCornerCase as Sample, OverlayCornerValues } from './overlay-corner-presets';

  let { sample, step = 0, native = false }: {
    sample: Sample;
    step?: number;
    native?: boolean;
  } = $props();
  let values = $derived<OverlayCornerValues>(Object.assign({}, sample,
    ...(sample.frames?.slice(0, step) ?? [])));
  let prefix = $derived(sample.component === 'tooltip' || sample.component === 'slider'
    ? 'ant-tooltip' : 'ant-popover');
  let css = $derived(`
    #corner-case [data-corner-anchor],#corner-case .ant-avatar-group-more,#corner-case .ant-slider-handle{
      position:fixed!important;left:${values.rect.x}px!important;top:${values.rect.y}px!important;
      width:${values.rect.width}px!important;height:${values.rect.height}px!important;
      transform:none!important;box-sizing:border-box!important;margin:0!important;
    }
    ${values.popup ? `.${prefix}{width:${values.popup.width}px!important;height:${values.popup.height}px!important;min-width:0!important;max-width:none!important}` : ''}
  `);
  let options = $derived({
    open: values.open ?? true,
    placement: values.placement,
    arrow: values.arrow ?? true,
    autoAdjustOverflow: values.adjust ?? true
  });
</script>

<svelte:head><svelte:element this={'style'}>{css}</svelte:element></svelte:head>

{#snippet content()}
  <div style="display:block;width:136px;height:40px"><input aria-label="Corner draft" value="Draft" style="width:100px;height:20px;padding:0;border:0;font:14px sans-serif" /></div>
{/snippet}
{#snippet anchor()}<button data-corner-anchor="" type="button">Anchor</button>{/snippet}

<ConfigProvider direction={sample.direction}
  theme={native ? undefined : {
    token: { motion: false, ...sample.token },
    components: sample.components
  }}>
  <div id="corner-case" {@attach host => {
    const element = host.querySelector(sample.component === 'avatar-group'
      ? '.ant-avatar-group-more' : sample.component === 'slider' ? '.ant-slider-handle' : 'button');
    element?.setAttribute('data-corner-anchor', '');
  }}>
    {#if sample.component === 'tooltip'}
      <Tooltip {...options} title={content}>{@render anchor()}</Tooltip>
    {:else if sample.component === 'popover'}
      <Popover {...options} title="Corner card" {content} trigger="click">{@render anchor()}</Popover>
    {:else if sample.component === 'popconfirm'}
      <Popconfirm {...options} title="Corner card" description={content}>{@render anchor()}</Popconfirm>
    {:else if sample.component === 'avatar-group'}
      <AvatarGroup items={[
        { key: 'a', label: 'Alpha', text: 'A' },
        { key: 'b', label: 'Beta', text: 'B' },
        { key: 'c', label: 'Gamma', text: 'C' }
      ]} max={{ count: 1, popover: { ...options, title: 'Corner card', content } }} />
    {:else}
      <Slider {...(sample.range
        ? { range: true, defaultValue: [25, 75] as [number, number] }
        : { range: false, defaultValue: 50 })} tooltip={{
        open: values.open ?? true,
        placement: values.placement,
        arrow: values.arrow,
        autoAdjustOverflow: values.adjust,
        formatter: () => 'Corner slider'
      }} />
    {/if}
  </div>
</ConfigProvider>
