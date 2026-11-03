<script lang="ts">
  import reference from './ant-design-mentions-popup-reference.json';
  import MentionsPopupCase from './MentionsPopupCase.svelte';
  import type { MentionsPopupCase as PopupCase } from './mentions-popup-presets';
  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as PopupCase);
  let mounted = $state(true);
  let tree = $state(true);
  let revision = $state(0);
  let alternate = $state(false);
  let dark = $state(false);
  let loading = $state(false);
  let empty = $state(false);
  let calls = $state(0);
  let dialog = $state(false);
</script>

{#snippet example()}
  {#key name}
    <MentionsPopupCase {sample} {mounted} {revision} {alternate} {dark} {loading} {empty}
      onCall={() => calls++} />
  {/key}
{/snippet}

<section id="mentions-popup-fixture">
  <h2>Mentions popup API</h2>
  <label>Mention popup reference <select aria-label="Mention popup reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount mention component</label>
  <label><input type="checkbox" bind:checked={tree} /> Mount mention tree</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate mention container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark mention theme</label>
  <label><input type="checkbox" bind:checked={loading} /> Loading mention popup</label>
  <label><input type="checkbox" bind:checked={empty} /> Empty mention popup</label>
  <label><input type="checkbox" bind:checked={dialog} /> Mention in native dialog</label>
  <button type="button" onclick={() => revision++}>Refresh mention function</button>
  <input aria-label="Mention outside" />
  <output aria-label="Mention owner calls">{calls}</output>
  {#if tree}
    {#if dialog}
      <dialog aria-label="Mention popup dialog" {@attach element => {
        element.showModal();
        return () => element.close();
      }}>{@render example()}</dialog>
    {:else}{@render example()}{/if}
  {/if}
</section>
