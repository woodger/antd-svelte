<script lang="ts">
  import reference from './ant-design-choice-container-reference.json';
  import ChoiceContainerCase from './ChoiceContainerCase.svelte';
  import type { ChoiceContainerCase as ContainerCase } from './choice-container-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as ContainerCase);
  let mounted = $state(true);
  let tree = $state(true);
  let revision = $state(0);
  let alternate = $state(false);
  let dark = $state(false);
  let componentTheme = $state(false);
  let panel = $state(false);
  let lazy = $state(false);
  let calls = $state(0);
  let dialog = $state(false);
</script>

{#snippet example()}
  {#key name}
    <ChoiceContainerCase {sample} {mounted} {revision} {alternate} {dark} {componentTheme}
      {panel} {lazy} onCall={() => calls++} />
  {/key}
{/snippet}

<section id="choice-container-fixture">
  <h2>TreeSelect and Cascader popup containers</h2>
  <label>Choice reference <select aria-label="Choice reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount choice component</label>
  <label><input type="checkbox" bind:checked={tree} /> Mount choice tree</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate choice container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark choice theme</label>
  <label><input type="checkbox" bind:checked={componentTheme} /> Override choice component theme</label>
  <label><input type="checkbox" bind:checked={panel} /> Use CascaderPanel</label>
  <label><input type="checkbox" bind:checked={lazy} /> Lazy choice children</label>
  <label><input type="checkbox" bind:checked={dialog} /> Choice in native dialog</label>
  <button type="button" onclick={() => revision++}>Refresh choice function</button>
  <input aria-label="Choice outside" />
  <output aria-label="Choice owner calls">{calls}</output>
  {#if tree}
    {#if dialog}
      <dialog aria-label="Choice container dialog" {@attach element => {
        element.showModal();
        return () => element.close();
      }}>{@render example()}</dialog>
    {:else}{@render example()}{/if}
  {/if}
</section>
