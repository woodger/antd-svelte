<script lang="ts">
  import { ConfigProvider, Tooltip, Popover } from 'antd-svelte';
  import type { NestedColorCase } from './overlay-color-presets';

  let { sample }: { sample: NestedColorCase } = $props();
  let getter = $derived(sample.container === 'body' ? () => document.body
    : sample.container === 'parent' ? (trigger: HTMLElement) => trigger.parentElement!
    : undefined);
</script>

{#snippet content()}
  <span id="nested-color-origin">
    <Tooltip open title="Nested text" color={sample.color}
      rootClassName="nested-color-inner" getPopupContainer={getter}>
      <button type="button">Nested anchor</button>
    </Tooltip>
  </span>
{/snippet}

<ConfigProvider theme={{ token: { motion: false } }}>
  {#if sample.outer === 'tooltip'}
    <Tooltip open color="#fff" title={content} rootClassName="nested-color-outer">
      <button type="button">Outer anchor</button>
    </Tooltip>
  {:else}
    <Popover open color="#fff" {content} rootClassName="nested-color-outer">
      <button type="button">Outer anchor</button>
    </Popover>
  {/if}
</ConfigProvider>
