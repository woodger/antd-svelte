<script lang="ts">
  import AvatarApiCase from './AvatarApiCase.svelte';
  import reference from './ant-design-avatar-api-reference.json';
  import type { AvatarApiCase as Sample } from './avatar-api-presets';

  let name = $state(reference.cases[0].name);
  let changed = $state(false);
  let mounted = $state(true);
  let aliases = $state(false);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="avatar-api-fixture">
  <h2>Avatar config, DOM and refs</h2>
  <label>Avatar API reference <select bind:value={name} onchange={() => {
    changed = false;
    mounted = true;
  }}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={aliases} /> Native Avatar click alias</label>
  <button type="button" onclick={() => changed = !changed}>Change Avatar API props</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle API Avatar</button>
  <input aria-label="Avatar API outside input" value="Outside draft" />
  {#if mounted}{#key name}<AvatarApiCase {sample} {changed} {aliases} />{/key}{/if}
</section>
