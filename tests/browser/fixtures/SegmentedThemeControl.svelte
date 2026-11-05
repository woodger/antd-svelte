<script lang="ts">
  import { Segmented } from 'antd-svelte';

  let { id, kind = 'normal', priority = false }: {
    id: string;
    kind?: string;
    priority?: boolean;
  } = $props();
  let selection = $state<string>();
  let events = $state<string[]>([]);
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Disabled', disabled: true }
  ];
</script>

<!-- Одинаковый родительский color изолирует CSS inheritance от DOM-обёртки ConfigProvider. -->
<div data-segmented-theme={id} style="width:360px;color:rgb(31, 41, 51)">
  <Segmented aria-label="Segmented theme control" {options} name={`theme-${id}`}
    bind:value={selection} onChange={next => events = [...events, next]}
    size={kind === 'small' ? 'small' : kind === 'large' ? 'large' : undefined}
    block={kind === 'block'} shape={kind === 'round' ? 'round' : 'default'}
    orientation={kind === 'vertical' ? 'vertical' : undefined} disabled={kind === 'disabled'}
    style={priority ? 'padding:6px' : undefined}
    styles={priority ? {
      root: 'padding:5px;background:#e6f4ff',
      item: 'color:#c41d7f',
      label: 'padding-inline:17px'
    } : undefined} />
  {#if id === 'normal'}<output aria-label="Segmented theme events">{JSON.stringify(events)}</output>{/if}
</div>
