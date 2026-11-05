<script lang="ts">
  import { ConfigProvider, Tooltip } from 'antd-svelte';
  import reference from './ant-design-tooltip-content-reference.json';
  import { contentCases } from './tooltip-content-presets';
  import TooltipContentCase from './TooltipContentCase.svelte';
  import TooltipCacheCase from './TooltipCacheCase.svelte';
  import TooltipContentConsumers from './TooltipContentConsumers.svelte';
  import OverlayLifecycleContent from './OverlayLifecycleContent.svelte';

  let source = $state(true);
  let mode = $state('content');
  let selected = $state('plain');
  let selectedCache = $state('fresh-default-destroy-false');
  let sample = $derived(contentCases.find(item => item.name === selected)!);
  let cache = $derived(reference.caches.find(item => item.name === selectedCache)!);
  let open = $state(true);
  let fresh = $state(false);
  let replacement = $state(false);
</script>

{#snippet original()}<OverlayLifecycleContent />{/snippet}
{#snippet changed()}<strong>Replacement content</strong>{/snippet}
<section id="tooltip-content-fixture">
  <h2>Tooltip content and cache</h2>
  <label><input type="checkbox" bind:checked={source} /> Source content config</label>
  <select aria-label="Tooltip content mode" bind:value={mode}>
    <option value="content">Content values</option>
    <option value="cache">Cache lifetime</option>
    <option value="state">Retained content state</option>
    <option value="consumers">Content consumers</option>
  </select>
  <select aria-label="Tooltip content case" bind:value={selected}>
    {#each contentCases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Tooltip cache case" bind:value={selectedCache}>
    {#each reference.caches as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <ConfigProvider theme={{ token: { motion: false } }} tooltip={source ? {} : undefined}>
    <div style="margin:80px 180px">
      {#if mode === 'content'}
        {#key sample.name}<TooltipContentCase {sample} />{/key}
      {:else if mode === 'cache'}
        {#key cache.name}<TooltipCacheCase sample={cache} />{/key}
      {:else if mode === 'consumers'}
        <TooltipContentConsumers />
      {:else}
        <label><input type="checkbox" bind:checked={open} /> State tooltip open</label>
        <label><input type="checkbox" bind:checked={fresh} /> State tooltip fresh</label>
        <label><input type="checkbox" bind:checked={replacement} /> Replace tooltip content</label>
        <Tooltip title={replacement ? changed : original} {open} {fresh} trigger={[]}>
          <button type="button">State tooltip trigger</button>
        </Tooltip>
      {/if}
    </div>
  </ConfigProvider>
</section>
