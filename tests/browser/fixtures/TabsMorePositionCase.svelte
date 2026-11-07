<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Tabs, type TabsMoreAlign, type TabsMoreProps } from 'antd-svelte';
  import type { TabsMorePositionCase } from './tabs-more-position-presets';
  import TabsMorePositionContent from './TabsMorePositionContent.svelte';
  import './tabs-more-position.css';

  let {
    sample,
    mounted = true,
    width,
    motion = false,
    updated = false,
    observe = false,
    sync = false,
    onAlign
  }: {
    sample: TabsMorePositionCase;
    mounted?: boolean;
    width?: number;
    motion?: boolean;
    updated?: boolean;
    observe?: boolean;
    sync?: boolean;
    onAlign?: (align: TabsMoreAlign) => void;
  } = $props();
  let container = $state<HTMLDivElement>();
  let aligned = $state<TabsMoreAlign>();
  let callbackCount = $state(0);
  let syncedAlign = $state<TabsMoreAlign>();
  let lifecycle = $state<string[]>([]);
  let callbackNode = $state<HTMLDivElement>();
  let emptyCallback = $state(false);
  let more = $derived.by(() => {
    const options: TabsMoreProps = {
      icon: 'Position More',
      trigger: 'click',
      ...sample.more,
      onPopupAlign: (node, value) => {
        if (observe) {
          callbackCount++;
          aligned = value;
          callbackNode = node;
          emptyCallback ||= !node.childElementCount;
        }
        if (sync) syncedAlign = value;
        onAlign?.(value);
      }
    };
    if (!sample.menu) options.overlay = content;
    if (sample.undefinedBuiltin) options.builtinPlacements = undefined;
    if (sample.undefinedMin) options.minOverlayWidthMatchTrigger = undefined;
    if (sample.undefinedOffset) options.align = { ...options.align, offset: undefined };
    if (updated) options.align = { ...options.align, offset: [11, 17], dynamicInset: true };
    if (sync && syncedAlign) options.align = syncedAlign;
    if (sample.container) options.getPopupContainer = () => container!;
    return options;
  });
</script>

{#snippet content()}
  <TabsMorePositionContent width={width ?? sample.width ?? 180}
    onLife={event => untrack(() => lifecycle.push(event))} />
{/snippet}

<div class="position-canvas"></div>
<div bind:this={container} class="position-container"></div>
<div class="position-stage" style={`left:${sample.x ?? 350}px;top:${sample.y ?? 250}px`}>
  <ConfigProvider direction={sample.rtl ? 'rtl' : 'ltr'} theme={{
    cssVar: { key: 'tabs-more-position' }, token: { motion }
  }}>
    {#if mounted}
      <Tabs id="tabs-more-position-main" {more}
        classNames={sample.styledArrow ? { popup: { root: 'position-arrow-custom' } } : undefined}
        items={Array.from({ length: 10 }, (_, index) => ({
          key: String(index), label: `Tab ${index + 1}`
        }))} />
    {/if}
  </ConfigProvider>
</div>
<output aria-label="Position callback count">{callbackCount}</output>
<output aria-label="Position aligned">{JSON.stringify(aligned ?? null)}</output>
<output aria-label="Position callback node">{callbackNode?.dataset.tabsPopupOwner ?? 'none'}</output>
<output aria-label="Position empty callback">{String(emptyCallback)}</output>
<output aria-label="Position lifecycle">{JSON.stringify(lifecycle)}</output>
