<script lang="ts">
  import { Tooltip, type TooltipAlignConfig, type TooltipRef } from 'antd-svelte';
  import type { TooltipAlignmentCase } from './tooltip-align.types';

  let { sample }: { sample: TooltipAlignmentCase } = $props();
  let changed = $state(false);
  let api = $state<TooltipRef>();
  let calls = $state(0);
  let lastAlign = $state.raw<TooltipAlignConfig>();
  let callbackElement = $state<HTMLElement>();
  let count = $state(0);
  let width = $state(160);
  let options = $derived({ ...sample.options, ...(changed ? sample.patch : {}) });

  function record(node: HTMLElement, align: TooltipAlignConfig) {
    callbackElement = node;
    lastAlign = JSON.parse(JSON.stringify(align));
    calls++;
  }

  function style(values: Record<string, number> | undefined) {
    return Object.entries(values ?? {}).map(([key, value]) => `${key}:${value}px`).join(';');
  }

  function expose(node: HTMLElement) {
    Object.defineProperties(node, {
      tooltipRef: { configurable: true, get: () => api },
      alignCalls: { configurable: true, get: () => calls },
      lastAlign: { configurable: true, get: () => lastAlign },
      callbackElement: { configurable: true, get: () => callbackElement }
    });

    return () => {
      for (const key of ['tooltipRef', 'alignCalls', 'lastAlign', 'callbackElement']) {
        Reflect.deleteProperty(node, key);
      }
    };
  }
</script>

{#snippet content()}<input aria-label="Alignment draft" value="Draft" />
  <button type="button" aria-label="Alignment count" onclick={() => count++}>{count}</button>{/snippet}
<div id="tooltip-align-case" {@attach expose}>
  <button type="button" onclick={() => changed = true}>Change alignment props</button>
  <button type="button" onclick={() => width = 180}>Resize alignment popup</button>
  <output aria-label="Alignment calls">{calls}</output>
  <Tooltip {...options} bind:ref={api} title={content} open trigger={[]} onPopupAlign={record}
    styles={{
      root: `width:${width}px;height:80px;max-width:none;${style(sample.rootStyle)}`,
      container: 'height:100%;box-sizing:border-box',
      arrow: style(sample.arrowStyle)
    }}>
    <button type="button" data-alignment-anchor=""
      style={`position:fixed;left:${sample.anchor.x}px;top:${sample.anchor.y}px;width:${sample.anchor.width}px;height:${sample.anchor.height}px;padding:0;border:0`}>Align target</button>
  </Tooltip>
</div>
