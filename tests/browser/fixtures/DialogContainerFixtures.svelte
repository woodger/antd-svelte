<script lang="ts">
  import reference from './ant-design-dialog-container-reference.json';
  import DialogContainerCase from './DialogContainerCase.svelte';
  import type { DialogContainerCase as ContainerCase } from './dialog-container-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as ContainerCase);
  let mounted = $state(true);
  let tree = $state(true);
  let revision = $state(0);
  let alternate = $state(false);
  let dark = $state(false);
  let nested = $state(false);
  let motion = $state(false);
  let customPrefix = $state(false);
  let staging = $state<'none' | 'element' | 'fragment'>('none');
  let calls = $state(0);
</script>

<section id="dialog-container-fixture">
  <h2>Modal and Drawer containers</h2>
  <label>Dialog reference <select aria-label="Dialog reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount container panel</label>
  <label><input type="checkbox" bind:checked={tree} /> Mount panel tree</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate panel container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark container panel</label>
  <label><input type="checkbox" bind:checked={nested} /> Nested panel controls</label>
  <label><input type="checkbox" bind:checked={motion} /> Animate container panel</label>
  <label><input type="checkbox" bind:checked={customPrefix} /> Custom container prefix</label>
  <label>Panel staging <select aria-label="Panel staging" bind:value={staging}>
    <option value="none">None</option><option value="element">Detached element</option>
    <option value="fragment">DocumentFragment</option>
  </select></label>
  <button type="button" onclick={() => revision++}>Refresh panel function</button>
  <input aria-label="Panel outside" />
  <output aria-label="Panel owner calls">{calls}</output>
  {#if tree}
    {#key `${name}-${staging}`}
      <DialogContainerCase {sample} {mounted} {revision} {alternate} {dark} {nested} {motion} {staging} {customPrefix}
        onCall={() => calls++} />
    {/key}
  {/if}
</section>
