<script lang="ts">
  import { Select, Tooltip } from 'antd-svelte';
  let { nested = false }: { nested?: boolean; } = $props();
  let count = $state(0);
</script>

<form>
  <input aria-label="Panel draft" name="draft" value="Seed" />
  <button type="button" data-panel-count onclick={event => {
    event.stopPropagation();
    count++;
  }}>{count}</button>
  {#if nested}
    <Select aria-label="Nested panel choice" options={[
      { value: 'alpha', label: 'Alpha' }, { value: 'beta', label: 'Beta' }
    ]} />
    <Tooltip title="Nested panel hint"><button type="button">Panel hint</button></Tooltip>
  {/if}
</form>
