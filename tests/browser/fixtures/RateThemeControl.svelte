<script lang="ts">
  import { ConfigProvider, Rate } from 'antd-svelte';

  let { id, priority = false }: { id: string; priority?: boolean; } = $props();
  let value = $state(2.5);
  let events = $state<number[]>([]);
  let focusEvents = $state<string[]>([]);
  let nativeElement = $state<HTMLUListElement>();
</script>

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'}>
  <div data-rate-theme={id} style="width:360px;font-size:14px;color:rgb(31,41,51)">
    <Rate {value} bind:nativeElement allowHalf aria-label={`Rate theme ${id}`}
      size={id === 'small' ? 'small' : id === 'large' ? 'large' : undefined}
      disabled={id === 'disabled'} character={id === 'character' ? 'A' : undefined}
      tooltips={id === 'tooltips' ? ['One', 'Two', 'Three', 'Four', 'Five'] : undefined}
      style={priority ? '--ant-rate-star-color:#c41d7f;--ant-rate-star-hover-scale:scale(1.4)'
        : undefined}
      onChange={next => {
        value = next;
        events = [...events, next];
      }}
      onFocus={() => focusEvents = [...focusEvents, 'focus']}
      onBlur={() => focusEvents = [...focusEvents, 'blur']} />
  </div>
</ConfigProvider>
{#if id === 'normal'}
  <output aria-label="Rate theme value">{value}</output>
  <output aria-label="Rate theme events">{JSON.stringify(events)}</output>
  <output aria-label="Rate theme focus events">{JSON.stringify(focusEvents)}</output>
  <output aria-label="Rate theme ref">{nativeElement ? 'mounted' : 'empty'}</output>
{/if}
