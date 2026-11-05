<script lang="ts">
  import { ConfigProvider, Tooltip } from 'antd-svelte';
  import OverlayLifecycleContent from './OverlayLifecycleContent.svelte';

  let { source }: { source: boolean } = $props();
  let open = $state(true);
  let disabled = $state(false);
  let force = $state(true);
  let changed = $state(false);
  let events = $state<boolean[]>([]);
</script>

{#snippet content()}<OverlayLifecycleContent />{/snippet}
<div id="tooltip-lifecycle-state" style="margin:120px">
  <label><input type="checkbox" bind:checked={open} /> State lifecycle open</label>
  <label><input type="checkbox" bind:checked={disabled} /> State lifecycle disabled</label>
  <label><input type="checkbox" bind:checked={force} /> State lifecycle force</label>
  <label><input type="checkbox" bind:checked={changed} /> State lifecycle ID and layer</label>
  <output aria-label="State lifecycle events">{JSON.stringify(events)}</output>
  <ConfigProvider theme={source ? { cssVar: {}, token: { motion: false } }
    : { mode: 'light', primary: 'blue' }} tooltip={source ? {} : undefined}>
    <Tooltip title={content} {open} {disabled} forceRender={force} destroyOnHidden trigger={[]}
      id={changed ? 'state-changed' : 'state-initial'} zIndex={changed ? 1600 : 1200}
      onOpenChange={value => events.push(value)}>
      <button type="button">State lifecycle trigger</button>
    </Tooltip>
  </ConfigProvider>
</div>
