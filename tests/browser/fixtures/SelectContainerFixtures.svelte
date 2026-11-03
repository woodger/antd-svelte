<script lang="ts">
  import reference from './ant-design-select-container-reference.json';
  import SelectContainerCase from './SelectContainerCase.svelte';
  import type { SelectContainerCase as ContainerCase } from './select-container-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as ContainerCase);
  let mounted = $state(true);
  let tree = $state(true);
  let revision = $state(0);
  let alternate = $state(false);
  let dark = $state(false);
  let componentTheme = $state(false);
  let inherit = $state(true);
  let calls = $state(0);
  let dialog = $state(false);
</script>

{#snippet example()}
  {#key name}
    <SelectContainerCase {sample} {mounted} {revision} {alternate} {dark} {componentTheme} {inherit}
      onCall={() => calls++} />
  {/key}
{/snippet}

<section id="select-container-fixture">
  <h2>Select popup containers</h2>
  <label>Select reference <select aria-label="Select reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount select component</label>
  <label><input type="checkbox" bind:checked={tree} /> Mount select tree</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate select container</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit select container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark select theme</label>
  <label><input type="checkbox" bind:checked={componentTheme} /> Override select component theme</label>
  <label><input type="checkbox" bind:checked={dialog} /> Select in native dialog</label>
  <button type="button" onclick={() => revision++}>Refresh select function</button>
  <input aria-label="Select outside" />
  <output aria-label="Select owner calls">{calls}</output>
  {#if tree}
    {#if dialog}
      <dialog aria-label="Select container dialog" {@attach element => {
        element.showModal();
        return () => element.close();
      }}>
        {@render example()}
      </dialog>
    {:else}{@render example()}{/if}
  {/if}
</section>
