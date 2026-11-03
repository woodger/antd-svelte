<script lang="ts">
  import AvatarGroupPopoverCase from './AvatarGroupPopoverCase.svelte';
  import reference from './ant-design-avatar-group-popover-reference.json';
  import type { AvatarGroupPopoverCase as Sample } from './avatar-group-popover-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let changed = $state(false);
  let mounted = $state(true);
  let standalone = $state(false);
  let nativeOptions = $state(false);
  let alternate = $state(false);
  let dark = $state(false);
  let revision = $state(0);
</script>

<section id="avatar-group-popover-fixture">
  <h2>AvatarGroup Popover configuration</h2>
  <label>Group Popover reference <select bind:value={name} onchange={() => changed = false}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount group popup</label>
  <label><input type="checkbox" bind:checked={standalone} /> Standalone group popup</label>
  <label><input type="checkbox" bind:checked={nativeOptions} /> Native group popup options</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate group popup container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark group popup theme</label>
  <button type="button" onclick={() => revision++}>Refresh group popup getter</button>
  <button type="button" onclick={() => changed = !changed}>Change group popup props</button>
  <button type="button">Before group popup</button>
  {#key name}<AvatarGroupPopoverCase {sample} {changed} {mounted} {alternate} {revision}
    {standalone} {nativeOptions} {dark} />{/key}
  <button type="button">After group popup</button>
</section>
