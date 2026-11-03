<script lang="ts">
  import AvatarGroupMaxCase from './AvatarGroupMaxCase.svelte';
  import reference from './ant-design-avatar-group-max-reference.json';
  import type { AvatarGroupMaxCase as Sample } from './avatar-group-max-presets';

  let name = $state(reference.cases[0].name);
  let changed = $state(false);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="avatar-group-max-fixture">
  <h2>AvatarGroup legacy max aliases</h2>
  <label>AvatarGroup max reference <select bind:value={name} onchange={() => changed = false}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => changed = !changed}>Change AvatarGroup max props</button>
  <button type="button">Before max group</button>
  {#key name}<AvatarGroupMaxCase {sample} {changed} />{/key}
  <button type="button">After max group</button>
</section>
