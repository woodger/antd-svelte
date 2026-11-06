<script lang="ts" module>
  import type { BorderBeamReferenceTheme } from './border-beam-theme-presets';

  export interface BorderBeamPrefixSample {
    name: string;
    prefix?: string;
    config: BorderBeamReferenceTheme;
    native?: { mode: 'light' | 'dark'; compact?: boolean; };
  }
</script>

<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import { resolveBorderBeamTheme } from './border-beam-theme-presets';
  import BorderBeamThemeControl from './BorderBeamThemeControl.svelte';

  let { sample, mounted = true }: { sample: BorderBeamPrefixSample; mounted?: boolean; } = $props();
  let target = $state<HTMLDivElement>();
  let prefix = $state<string>();
  let configured = $derived(sample.native ?? resolveBorderBeamTheme(sample.config));
  let localPrefix = $derived(prefix ?? sample.prefix);
</script>

<button type="button" onclick={() => prefix = 'next-beam'}>Set alternate beam prefix</button>
<button type="button" onclick={() => prefix = ''}>Use default beam prefix</button>
<div data-beam-theme="external" bind:this={target}
  style="position:relative;box-sizing:border-box;width:300px;height:100px;border-style:solid;border-width:1px 2px 3px 4px;border-radius:12px;--ant-color-primary:#fa541c;--ant-line-width:9px">
  <input aria-label="Beam external draft" value="External draft" />
</div>
{#if mounted}
  <ConfigProvider theme={configured} borderBeam={{ class: 'prefix-context' }}>
    {#each ['normal', 'multiple', 'explicit', 'external'] as id}
      <BorderBeamThemeControl {id} prefixCls={localPrefix}
        prefix={sample.config.cssVar?.prefix ?? 'ant'} externalTarget={target} />
    {/each}
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <BorderBeamThemeControl id="outside" />
</ConfigProvider>
