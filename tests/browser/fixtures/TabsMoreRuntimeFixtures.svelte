<script lang="ts">
  import reference from './ant-design-tabs-more-runtime-reference.json';
  import TabsMoreRuntimeCase from './TabsMoreRuntimeCase.svelte';
  import type { TabsMoreRuntimeCase as RuntimeCase } from './tabs-more-runtime-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as RuntimeCase);
  let mounted = $state(true);
  let styled = $state(false);
  let nested = $state(false);
  let motion = $state(true);
  let destroy = $state(false);
  let autofocus = $state(false);
</script>

<section id="tabs-more-runtime-fixture">
  <h2>Tabs More runtime</h2>
  <label>More runtime reference <select aria-label="More runtime reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount runtime Tabs</label>
  <label><input type="checkbox" bind:checked={styled} /> Style runtime popup</label>
  <label><input type="checkbox" bind:checked={nested} /> Nested runtime Select</label>
  <label><input type="checkbox" bind:checked={motion} /> Runtime motion</label>
  <label><input type="checkbox" bind:checked={destroy} /> Destroy runtime popup</label>
  <label><input type="checkbox" bind:checked={autofocus} /> Autofocus runtime popup</label>
  {#key name}
    <TabsMoreRuntimeCase {sample} {mounted} {styled} {nested} {motion} {destroy} {autofocus} />
  {/key}
</section>
