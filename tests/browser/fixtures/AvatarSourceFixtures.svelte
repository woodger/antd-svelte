<script lang="ts">
  import reference from './ant-design-avatar-source-reference.json';
  import AvatarSourceCase from './AvatarSourceCase.svelte';
  import type { AvatarSourceCase as Sample } from './avatar-source-presets';
  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let mounted = $state(true);
  let larger = $state(false);
  let dark = $state(false);
  let decorated = $state(false);
  let named = $state(true);
  let attrsChanged = $state(false);
  let sourceMode = $state<'case' | 'string' | 'none'>('case');
  let focusTrap = $state(true);
</script>
<section id="avatar-source-fixture">
  <h2>Avatar source snippets</h2>
  <label>Avatar source reference <select aria-label="Avatar source reference" bind:value={name}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label>Avatar source mode <select aria-label="Avatar source mode" bind:value={sourceMode}>
    <option value="case">Snippet</option><option value="string">String</option>
    <option value="none">Fallback</option>
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount source avatar</label>
  <label><input type="checkbox" bind:checked={larger} /> Larger source avatar</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark source avatar</label>
  <label><input type="checkbox" bind:checked={decorated} /> Decorative source avatar</label>
  <label><input type="checkbox" bind:checked={named} /> Name source avatar</label>
  <label><input type="checkbox" bind:checked={attrsChanged} /> Change avatar source attributes</label>
  <label><input type="checkbox" bind:checked={focusTrap} /> Trap source preview focus</label>
  {#if mounted}
    {#key name}<AvatarSourceCase {sample} {larger} {dark} {sourceMode} {decorated} {named}
      {attrsChanged} {focusTrap} />{/key}
  {/if}
</section>
