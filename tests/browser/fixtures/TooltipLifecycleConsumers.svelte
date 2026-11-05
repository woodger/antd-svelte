<script lang="ts">
  import { ConfigProvider, Slider, TypographyText } from 'antd-svelte';
  import type { TooltipLifecycleConsumer } from './tooltip-lifecycle.types';

  let { sample, source }: { sample: TooltipLifecycleConsumer; source: boolean } = $props();
  let step = $state(0);
  let options = $derived(sample.frames[step].props);
  let tooltip = $derived({
    disabled: options.disabled,
    forceRender: options.forceRender,
    destroyOnHidden: options.destroyOnHidden,
    id: options.id ?? undefined,
    zIndex: options.zIndex ?? undefined
  });
</script>

<div id="tooltip-lifecycle-consumers" style="margin:180px;width:400px">
  <button type="button" onclick={() => step++} disabled={step >= sample.frames.length - 1}>
    Next consumer step
  </button>
  <output aria-label="Lifecycle consumer step">{step}</output>
  <ConfigProvider theme={source ? { cssVar: {}, token: { motion: false } }
    : { mode: 'light', primary: 'blue' }} tooltip={source ? {} : undefined}>
    {#if sample.mode === 'typography'}
      <TypographyText style="display:block;width:80px" tabindex={0}
        ellipsis={{ tooltip: {
          ...tooltip,
          title: 'Consumer value',
          mouseEnterDelay: 0,
          mouseLeaveDelay: 0
        } }}>
        A long text that exceeds its width
      </TypographyText>
    {:else}
      <Slider {...sample.mode === 'single' ? { range: false, defaultValue: 25 }
        : { range: true, defaultValue: [25, 75] as [number, number] }}
        tooltip={{
          ...tooltip,
          open: sample.mode === 'pinned' ? true : undefined,
          formatter: () => 'Consumer value'
        }} />
    {/if}
  </ConfigProvider>
</div>
