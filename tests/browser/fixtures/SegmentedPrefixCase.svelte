<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import SegmentedPrefixControl from './SegmentedPrefixControl.svelte';
  import { segmentedPrefixCases, segmentedPrefixTheme } from './segmented-prefix-presets';

  let { preset = 'tenant', mounted = true }: { preset?: string; mounted?: boolean; } = $props();
  let sample = $derived(segmentedPrefixCases.find(item => item.name === preset)!);
  let prefixOverride = $state<string>();
  let prefix = $derived(prefixOverride ?? sample.prefix);
</script>

{#if mounted}
  <ConfigProvider theme={segmentedPrefixTheme(sample)}>
    <form aria-label="Segmented prefix form" onsubmit={event => event.preventDefault()}>
      {#each ['normal', 'small', 'large', 'block', 'vertical', 'disabled'] as id}
        <SegmentedPrefixControl {id} {prefix} {sample} />
      {/each}
    </form>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <SegmentedPrefixControl id="outside" {sample} />
</ConfigProvider>
<button type="button" onclick={() => prefixOverride = 'next-segmented'}>
  Set alternate Segmented prefix
</button>
<button type="button" onclick={() => prefixOverride = ''}>Use default Segmented prefix</button>
<button type="button" onclick={() => prefixOverride = undefined}>Restore Segmented prefix</button>
