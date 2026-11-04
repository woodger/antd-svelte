<script lang="ts">
  import { ConfigProvider, Tooltip, Popover, Popconfirm, AvatarGroup, Slider,
    TypographyText } from 'antd-svelte';
  import { buildOverlayConfig, buildOverlayProvider } from './overlay-config-presets';
  import type { OverlayConfigCase as Sample, OverlayConfigValues } from './overlay-config-presets';

  let { sample, step = 0, interactive = false, native = false, activeSlider = false,
    natural = false }: {
    sample: Sample;
    step?: number;
    interactive?: boolean;
    native?: boolean;
    activeSlider?: boolean;
    natural?: boolean;
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
  ${natural ? '' : `.ant-tooltip,.ant-popover,[data-ant-tooltip],[data-ant-popover] {
    width:240px!important;height:120px!important;
  }`}
`}</svelte:element></svelte:head>

{#snippet content()}
  <input aria-label="Config draft" value="Draft" style="width:100px;height:20px;padding:0;border:0;font:14px sans-serif" />
{/snippet}
{#snippet anchor()}<button type="button" class={values.anchorClass} data-config-anchor="">Anchor</button>{/snippet}

<ConfigProvider direction={sample.direction} theme={native ? sample.theme : {
  ...sample.theme, token: { motion: false, ...sample.theme?.token }
}} {...buildOverlayProvider(values.provider)}>
  <ConfigProvider {...buildOverlayProvider(values.child)}>
    <div id="config-case" {@attach host => host.querySelector(sample.component === 'avatar-group'
      ? '.ant-avatar-group-more' : sample.component === 'slider' ? '.ant-slider-handle'
      : sample.component === 'typography' ? '.ant-typography' : 'button')
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
      {:else if sample.component === 'typography'}
        <TypographyText data-config-anchor="" style="display:block;width:80px"
          tabindex={sample.focusable ? 0 : undefined}
          ellipsis={{ suffix: sample.jsEllipsis ? '' : undefined,
            tooltip: { ...options, title: content } }}>
          {values.text ?? 'A long text that exceeds the available width'}
        </TypographyText>
      {:else}
        <Slider {...(sample.range
          ? { range: true, defaultValue: [25, 75] as [number, number] }
          : { range: false, defaultValue: 50 })}
          tooltip={{ open: activeSlider ? undefined : true,
            placement: 'topLeft', color: values.local?.color,
            prefixCls: values.local?.prefixCls, openClassName: values.local?.openClassName,
            getPopupContainer: values.local?.container === 'body' ? () => document.body : undefined }} />
      {/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Config changes">{JSON.stringify(changes)}</output>
