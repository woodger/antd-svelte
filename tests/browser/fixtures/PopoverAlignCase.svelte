<script lang="ts">
  import { AvatarGroup, Popover, Popconfirm, type TooltipAlignConfig } from 'antd-svelte';
  import type { PopoverAlignmentCase } from './popover-align.types';

  let { sample, onAlign }: {
    sample: PopoverAlignmentCase;
    onAlign?: () => void;
  } = $props();
  let changed = $state(false);
  let calls = $state(0);
  let lastAlign = $state.raw<TooltipAlignConfig>();
  let callbackElement = $state<HTMLElement>();
  let count = $state(0);
  let width = $state(160);
  let options = $derived({ ...sample.options, ...(changed ? sample.patch : {}) });
  let properties = $derived({
    ...options,
    open: true,
    trigger: [] as const,
    onPopupAlign: record,
    styles: {
      root: `width:${width}px;height:80px;max-width:none;${style(sample.rootStyle)}`,
      container: 'height:100%;box-sizing:border-box',
      arrow: style(sample.arrowStyle)
    }
  });

  function record(node: HTMLElement, align: TooltipAlignConfig) {
    callbackElement = node;
    lastAlign = JSON.parse(JSON.stringify(align));
    calls++;
    onAlign?.();
  }

  function style(values: Record<string, number> | undefined) {
    return Object.entries(values ?? {}).map(([key, value]) => `${key}:${value}px`).join(';');
  }

  function expose(node: HTMLElement) {
    Object.defineProperties(node, {
      alignCalls: { configurable: true, get: () => calls },
      lastAlign: { configurable: true, get: () => lastAlign },
      callbackElement: { configurable: true, get: () => callbackElement }
    });

    return () => {
      for (const key of ['alignCalls', 'lastAlign', 'callbackElement']) {
        Reflect.deleteProperty(node, key);
      }
    };
  }
</script>

<style>
  #popover-align-case :global(.ant-avatar-group-more) {
    position: fixed;
    left: var(--alignment-left);
    top: var(--alignment-top);
    width: var(--alignment-width);
    height: var(--alignment-height);
    padding: 0;
    border: 0;
    margin: 0;
  }
</style>

{#snippet content()}<input aria-label="Alignment draft" value="Draft" style="width:80px" />
  <button type="button" aria-label="Alignment count" onclick={() => count++}>{count}</button>{/snippet}
{#snippet anchor()}<button type="button" data-alignment-anchor=""
  style={`position:fixed;left:${sample.anchor.x}px;top:${sample.anchor.y}px;width:${sample.anchor.width}px;height:${sample.anchor.height}px;padding:0;border:0;margin:0`}>Align target</button>{/snippet}
<div id="popover-align-case" {@attach expose}
  style={`--alignment-left:${sample.anchor.x}px;--alignment-top:${sample.anchor.y}px;--alignment-width:${sample.anchor.width}px;--alignment-height:${sample.anchor.height}px`}>
  <button type="button" onclick={() => changed = true}>Change alignment props</button>
  <button type="button" onclick={() => width = 180}>Resize alignment popup</button>
  <output aria-label="Alignment calls">{calls}</output>
  {#if sample.mode === 'avatar'}
    <AvatarGroup items={[{ key: 'a', text: 'A', label: 'A' }, { key: 'b', text: 'B', label: 'B' }]}
      max={{ count: 1, popover: { ...properties, title: 'Alignment title', content } }} />
  {:else if sample.mode === 'popconfirm'}
    <Popconfirm {...properties} title="Alignment title" description={content}>
      {@render anchor()}
    </Popconfirm>
  {:else}
    <Popover {...properties} title="Alignment title" {content}>
      {@render anchor()}
    </Popover>
  {/if}
</div>
