<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import reference from './ant-design-tooltip-ref-reference.json';
  import TooltipRefCase from './TooltipRefCase.svelte';

  let source = $state(true);
  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)!);
</script>

<section id="tooltip-ref-fixture">
  <h2>Tooltip imperative ref</h2>
  <label><input type="checkbox" bind:checked={source} /> Source ref config</label>
  <select aria-label="Tooltip ref case" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <ConfigProvider theme={{ token: { motion: false } }} tooltip={source ? {} : undefined}>
    {#key sample.name}<TooltipRefCase {sample} />{/key}
  </ConfigProvider>
</section>
