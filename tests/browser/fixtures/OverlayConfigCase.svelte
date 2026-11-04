<script lang="ts">
  import { ConfigProvider, Tooltip, Popover, Popconfirm, AvatarGroup, Slider } from 'antd-svelte';
  import { buildOverlayConfig, buildOverlayProvider } from './overlay-config-presets';
  import type { OverlayConfigCase as Sample, OverlayConfigValues } from './overlay-config-presets';

  let { sample, step = 0, interactive = false, native = false }: {
    sample: Sample;
    step?: number;
    interactive?: boolean;
    native?: boolean;
  } = $props();
  let values = $derived<OverlayConfigValues>(Object.assign({}, sample,
    ...(sample.frames?.slice(0, step) ?? [])));
  let local = $derived(buildOverlayConfig(values.local) ?? {});
  let changes = $state<boolean[]>([]);
  let options = $derived({
    placement: sample.defaultPlacement ? undefined : 'topLeft' as const,
    ...local,
    open: interactive ? undefined : values.open ?? true,
    onOpenChange: (next: boolean) => changes.push(next)
  });
</script>

<svelte:head><svelte:element this={'style'}>{`
  #config-case [data-config-anchor],#config-case .ant-avatar-group-more,#config-case .ant-slider-handle {
    position:fixed!important;left:200px!important;top:180px!important;
    width:80px!important;height:36px!important;transform:none!important;margin:0!important;
    box-sizing:border-box!important;
  }
  .ant-tooltip,.ant-popover {
    width:240px!important;height:120px!important;
  }
`}</svelte:element></svelte:head>

{#snippet content()}
  <input aria-label="Config draft" value="Draft" style="width:100px;height:20px;padding:0;border:0;font:14px sans-serif" />
{/snippet}
{#snippet anchor()}<button type="button" data-config-anchor="">Anchor</button>{/snippet}

<ConfigProvider theme={native ? undefined : { token: { motion: false } }} {...buildOverlayProvider(values.provider)}>
  <ConfigProvider {...buildOverlayProvider(values.child)}>
    <div id="config-case" {@attach host => host.querySelector(sample.component === 'avatar-group'
      ? '.ant-avatar-group-more' : sample.component === 'slider' ? '.ant-slider-handle' : 'button')
      ?.setAttribute('data-config-anchor', '')}>
      {#if sample.component === 'tooltip'}
        <Tooltip {...options} title={content}>{@render anchor()}</Tooltip>
      {:else if sample.component === 'popover'}
        <Popover {...options} title="Config title" {content}>{@render anchor()}</Popover>
      {:else if sample.component === 'popconfirm'}
        <Popconfirm {...options} title="Config title" description={content}>{@render anchor()}</Popconfirm>
      {:else if sample.component === 'avatar-group'}
        <AvatarGroup items={[
          { key: 'a', label: 'Alpha', text: 'A' },
          { key: 'b', label: 'Beta', text: 'B' }
        ]} max={{ count: 1, popover: { ...options, title: 'Config title', content } }} />
      {:else}
        <Slider defaultValue={50} tooltip={{ open: true, placement: 'topLeft' }} />
      {/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Config changes">{JSON.stringify(changes)}</output>
