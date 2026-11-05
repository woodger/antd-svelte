<script lang="ts">
  import { Tooltip } from 'antd-svelte';
  import { tooltipContentValue, type TooltipContentCase } from './tooltip-content-presets';

  let { sample }: { sample: TooltipContentCase } = $props();
  let events = $state<boolean[]>([]);
</script>

{#snippet rich()}<strong data-rich-content="">Rich content</strong>{/snippet}
<Tooltip title={tooltipContentValue(sample.title, rich)}
  overlay={tooltipContentValue(sample.overlay, rich)} trigger="click"
  mouseEnterDelay={0} mouseLeaveDelay={0} onOpenChange={value => events.push(value)}>
  <button type="button">Content trigger</button>
</Tooltip>
<output aria-label="Content events">{JSON.stringify(events)}</output>
